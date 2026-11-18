import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { apiFetch } from '../api/api';
import { obterNotificacoes, NotificacaoMobile } from '../api/mobileSocial';
import { useAuth } from '../contexts/AuthContext';
import { useNotificationSettings, refreshNotificationSettings } from '../notifications/notificationSettings';

/**
 * Expo Go on Android cannot receive remote push. In some installations even
 * local notification scheduling throws inside the native channel manager.
 * Only explicitly identified native builds may load expo-notifications.
 * (Importing this module at file scope would produce Expo Go warnings.)
 */
const nativeBuild = Platform.OS === 'android'
  ? (Constants.executionEnvironment === 'bare' || Constants.executionEnvironment === 'standalone')
  : Platform.OS === 'ios' && Constants.executionEnvironment !== 'storeClient';

type NotificationAPI = typeof import('expo-notifications');
let notificationsModule: NotificationAPI | null = null;
function getNativeNotifications(): NotificationAPI | null {
  if (!nativeBuild) return null;
  try {
    if (!notificationsModule) notificationsModule = require('expo-notifications') as NotificationAPI;
    return notificationsModule;
  } catch (error) {
    console.warn('Módulo nativo de notificações indisponível.', error);
    return null;
  }
}

function titleFor(item: NotificacaoMobile): string {
  if (item.tipo === 'mensagem') return item.nome_remetente || 'Nova mensagem';
  if (item.tipo === 'curtida') return 'Nova curtida';
  if (item.tipo === 'comentario') return 'Novo comentário';
  return 'Nova publicação';
}
function bodyFor(item: NotificacaoMobile): string {
  if (item.tipo === 'mensagem') return item.conteudo || 'Enviou um anexo';
  return [item.nome_remetente, item.conteudo].filter(Boolean).join(': ');
}

export default function NotificationBridge({ onOpenChat, onOpenPost }: { onOpenChat?: (chatId: number) => void; onOpenPost?: (postId: number) => void }) {
  const { usuario } = useAuth();
  const [banner, setBanner] = useState<NotificacaoMobile | null>(null);
  const lastId = useRef(0);
  const initialized = useRef(false);
  const nativePushReady = useRef(false);
  const nativeLocalReady = useRef(false);
  const lastQueryWarning = useRef(0);
  const handledResponse = useRef<string | null>(null);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentUser = Number(usuario?.id_usuario || 0);
  const { enabled: notificationEnabled, loaded: notificationLoaded } = useNotificationSettings(currentUser);

  const showInApp = useCallback((item: NotificacaoMobile) => {
    setBanner(item);
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    dismissTimer.current = setTimeout(() => setBanner(null), 6500);
  }, []);

  useEffect(() => {
    const N = getNativeNotifications();
    if (!N) return;
    const listener = N.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      const chatId = Number(data?.chatId || 0);
      const postId = Number(data?.postId || data?.referenceId || 0);
      const tipo = String(data?.type || data?.tipo || '');
      const identifier = response.notification.request.identifier;
      if (handledResponse.current !== identifier) {
        if (tipo === 'mensagem' && chatId > 0) { handledResponse.current = identifier; onOpenChat?.(chatId); }
        else if (tipo !== 'mensagem' && postId > 0) { handledResponse.current = identifier; onOpenPost?.(postId); }
      }
    });
    void N.getLastNotificationResponseAsync().then(response => {
      const data = response?.notification.request.content.data;
      const chatId = Number(data?.chatId || 0);
      const postId = Number(data?.postId || data?.referenceId || 0);
      const tipo = String(data?.type || data?.tipo || '');
      const identifier = response?.notification.request.identifier;
      if (identifier && handledResponse.current !== identifier) {
        if (tipo === 'mensagem' && chatId > 0) { handledResponse.current = identifier; onOpenChat?.(chatId); }
        else if (tipo !== 'mensagem' && postId > 0) { handledResponse.current = identifier; onOpenPost?.(postId); }
      }
    }).catch(() => {});
    return () => listener.remove();
  }, [onOpenChat, onOpenPost]);

  useEffect(() => {
    if (!currentUser || !notificationLoaded || !notificationEnabled) {
      if (banner) setBanner(null);
      lastId.current = 0;
      initialized.current = false;
      nativePushReady.current = false;
      nativeLocalReady.current = false;
      setBanner(null);
      return;
    }
    let active = true;
    let inFlight = false;

    const check = async () => {
      if (!active || AppState.currentState !== 'active' || inFlight) return;
      inFlight = true;
      try {
        const result = await obterNotificacoes(lastId.current);
        if (!active) return;
        const items = Array.isArray(result.notifications) ? result.notifications : [];
        if (!initialized.current) {
          initialized.current = true;
          lastId.current = items.reduce((max, n) => Math.max(max, Number(n.id_notificacao) || 0), 0);
          return; // Do not replay old events from before opening the app.
        }
        const newItems = items
          .filter(n => Number(n.id_notificacao) > lastId.current)
          .sort((a, b) => Number(a.id_notificacao) - Number(b.id_notificacao));
        for (const item of newItems) {
          if (!active) break;
          lastId.current = Math.max(lastId.current, Number(item.id_notificacao) || 0);
          // A registered remote push is responsible for native delivery.
          if (nativePushReady.current) continue;
          const N = getNativeNotifications();
          if (N && nativeLocalReady.current) {
            try {
              const conversation = item.tipo === 'mensagem' && item.id_chat
                ? `conversa-${item.id_chat}` : 'atividade-librashub';
              if (Platform.OS === 'android') {
                await N.setNotificationChannelAsync(conversation, {
                  name: item.tipo === 'mensagem' ? `Conversa ${item.id_chat}` : 'Atividade LibrasHub',
                  importance: N.AndroidImportance.HIGH,
                });
              }
              await N.scheduleNotificationAsync({
                content: {
                  title: titleFor(item),
                  body: bodyFor(item),
                  data: { chatId: item.id_chat ?? 0, type: item.tipo, referenceId: item.referencia_id, postId: item.tipo === 'mensagem' ? null : item.referencia_id },
                  ...(Platform.OS === 'android' ? { channelId: conversation } : { threadIdentifier: conversation }),
                },
                trigger: null,
              });
              continue;
            } catch (error) {
              nativeLocalReady.current = false;
              console.warn('Notificação nativa falhou; usando aviso interno do aplicativo.', error);
            }
          }
          showInApp(item);
        }
      } catch (error) {
        if (Date.now() - lastQueryWarning.current >= 60000) {
          lastQueryWarning.current = Date.now();
          console.warn('Não foi possível consultar notificações do LibrasHub.', error);
        }
      } finally {
        inFlight = false;
      }
    };

    const setup = async () => {
      const N = getNativeNotifications();
      if (N) {
        try {
          if (Platform.OS === 'android') {
            await N.setNotificationChannelAsync('mensagens', {
              name: 'Mensagens', importance: N.AndroidImportance.HIGH,
            });
          }
          const permission = await N.requestPermissionsAsync();
          nativeLocalReady.current = permission.granted;
          if (permission.granted) {
            const projectId = Constants.easConfig?.projectId ?? Constants.expoConfig?.extra?.eas?.projectId;
            if (projectId) {
              try {
                const push = await N.getExpoPushTokenAsync({ projectId });
                await apiFetch('mobile/social.php?action=push_register', {
                  method: 'POST', body: JSON.stringify({ token: push.data }),
                });
                nativePushReady.current = true;
              } catch (error) {
                console.warn('Push remoto indisponível; usando notificações locais.', error);
              }
            }
          }
        } catch (error) {
          nativeLocalReady.current = false;
          console.warn('Notificações nativas indisponíveis; usando avisos no aplicativo.', error);
        }
      }
      await check();
    };

    void setup();
    const timer = setInterval(() => { void check(); }, 20000);
    const stateSubscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        void refreshNotificationSettings(currentUser).catch(() => {});
        void check();
      }
    });
    return () => {
      active = false;
      clearInterval(timer);
      stateSubscription.remove();
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, [currentUser, notificationEnabled, notificationLoaded, showInApp]);

  if (!banner) return null;
  return (
    <View pointerEvents="box-none" style={styles.overlay}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${titleFor(banner)}. ${bodyFor(banner)}`}
        style={styles.banner}
        onPress={() => {
          const chatId = Number(banner.id_chat || 0);
          setBanner(null);
          if (chatId > 0 && banner.tipo === 'mensagem') onOpenChat?.(chatId);
          else if (banner.tipo !== 'mensagem' && Number(banner.referencia_id || 0) > 0) onOpenPost?.(Number(banner.referencia_id));
        }}
      >
        <Text style={styles.title} numberOfLines={1}>{titleFor(banner)}</Text>
        <Text style={styles.body} numberOfLines={2}>{bodyFor(banner)}</Text>
        <Text style={styles.hint}>Toque para abrir · desaparece automaticamente</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 70, left: 0, right: 0, zIndex: 9999, elevation: 20 },
  banner: { marginHorizontal: 14, backgroundColor: '#17263f', borderColor: '#8fa5ca', borderWidth: 1,
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, elevation: 20 },
  title: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  body: { color: '#f1f5ff', fontSize: 14, marginTop: 4 },
  hint: { color: '#c5d1e6', fontSize: 11, marginTop: 6 },
});

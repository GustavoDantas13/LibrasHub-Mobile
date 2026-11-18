import { View, TouchableOpacity } from '../components/AccessiblePrimitives';
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotificationSettings, updateNotificationSettings } from '../notifications/notificationSettings';
import { Alert } from 'react-native';
import Text from '../components/AppText';
import Button from '../components/Button';
import ScreenTitle from '../components/ScreenTitle';
import SettingSwitch from '../components/SettingSwitch';
import { FontSize } from '../types';
import { styles } from '../styles/styles';
import { useFontSizePreference } from '../accessibility/fontPreference';
import { useAccessibilityPreferences } from '../accessibility/preferences';

const FONTES: { valor: FontSize; titulo: string; descricao: string }[] = [
  { valor: 'normal', titulo: 'Normal', descricao: 'Tamanho padrão do aplicativo' },
  { valor: 'large', titulo: 'Grande', descricao: 'Texto aproximadamente 15% maior' },
  { valor: 'extra', titulo: 'Extra grande', descricao: 'Texto aproximadamente 30% maior' },
  { valor: 'huge', titulo: 'Muito grande', descricao: 'Texto aproximadamente 45% maior' },
];

export default function SettingsPage({
  darkMode,
  setDarkMode,
  setFontSize: setAppFontSize,
  highContrast,
  setHighContrast,
}: {
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  fontSize: FontSize;
  setFontSize: (v: FontSize) => void;
  highContrast: boolean;
  setHighContrast: (v: boolean) => void;
}) {
  const { usuario } = useAuth();
  const currentUserId = Number(usuario?.id_usuario || 0);
  const { enabled: notifications, loaded: notificationsLoaded } = useNotificationSettings(currentUserId);
  const [notificationSaving, setNotificationSaving] = useState(false);
  const changeNotifications = async (value: boolean) => {
    if (!notificationsLoaded || notificationSaving) return;
    setNotificationSaving(true);
    try { await updateNotificationSettings(currentUserId, value); }
    catch (error) { Alert.alert('Notificações', error instanceof Error ? error.message : 'Não foi possível salvar a preferência.'); }
    finally { setNotificationSaving(false); }
  };
  const { fontSize, setFontSize } = useFontSizePreference();
  const {
    boldText,
    comfortableSpacing,
    letterSpacing,
    largeTouchTargets,
    colorBlindMode,
    colorBlindFilter,
    setColorBlindMode,
    setColorBlindFilter,
    setBoldText,
    setComfortableSpacing,
    setLetterSpacing,
    setLargeTouchTargets,
    resetPreferences,
  } = useAccessibilityPreferences();

  function alterarFonte(valor: FontSize) {
    setAppFontSize(valor);
    void setFontSize(valor);
  }

  function restaurarPadroes() {
    Alert.alert(
      'Restaurar acessibilidade',
      'Deseja voltar as opções de acessibilidade para o padrão?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restaurar',
          onPress: () => {
            void resetPreferences();
            alterarFonte('normal');
            setDarkMode(false);
            setHighContrast(false);
          },
        },
      ],
    );
  }

  return (
    <View>
      <ScreenTitle
        title="Configurações"
        subtitle="Ajuste leitura, visibilidade e interação do aplicativo"
      />

      <View style={[styles.card, { backgroundColor: darkMode ? '#172033' : '#FFFFFF', borderColor: darkMode ? '#334155' : '#E1E5EB' }]}>
        <Text style={styles.sectionLabel}>VISIBILIDADE</Text>
        <SettingSwitch
          title="Modo escuro"
          subtitle="Reduz a luminosidade geral da interface"
          value={darkMode}
          onValueChange={setDarkMode}
        />
        <SettingSwitch
          title="Alto contraste"
          subtitle="Reforça a diferença entre fundo, texto e elementos de navegação"
          value={highContrast}
          onValueChange={setHighContrast}
        />
        <SettingSwitch
          title="Acessibilidade para daltonismo"
          subtitle="Reduz a dependência de cores isoladas e reforça contrastes visuais"
          value={colorBlindMode}
          onValueChange={(valor) => void setColorBlindMode(valor)}
        />
        <View style={{ marginTop: 8, marginBottom: 8 }}>
          <Text style={styles.cardHeading}>Filtro de cores</Text>
          <Text style={styles.tinyMuted}>Escolha o filtro que facilita distinguir as cores na interface.</Text>
          {[
            { valor: 'none', titulo: 'Sem filtro' },
            { valor: 'protanopia', titulo: 'Protanopia (vermelho)' },
            { valor: 'deuteranopia', titulo: 'Deuteranopia (verde)' },
            { valor: 'tritanopia', titulo: 'Tritanopia (azul)' },
            { valor: 'highContrast', titulo: 'Cores de alto contraste' },
          ].map((filtro) => (
            <TouchableOpacity
              key={filtro.valor}
              accessibilityRole="radio"
              accessibilityState={{ selected: colorBlindFilter === filtro.valor }}
              onPress={() => void setColorBlindFilter(filtro.valor)}
              style={[styles.option, { marginTop: 6 }, colorBlindFilter === filtro.valor && styles.optionActive]}
            >
              <Text style={styles.cardHeading}>{filtro.titulo}</Text>
              <View style={[styles.radio, colorBlindFilter === filtro.valor && styles.radioActive]}>
                {colorBlindFilter === filtro.valor && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          ))}
          <Text style={[styles.tinyMuted, {marginTop:12}]}>Prévia das cores de sinalização do aplicativo</Text>
          <View style={{flexDirection:'row',gap:9,marginTop:8}}>
            {['#E75555','#16A34A','#2165D2','#FDC500'].map(c=>(
              <View key={c} accessible accessibilityLabel={`Cor de referência ${c}`} style={{width:45,height:30,borderRadius:7,backgroundColor:c}}/>
            ))}
          </View>
          <Text style={styles.tinyMuted}>Os ajustes de cor são aplicados aos controles e textos do aplicativo; fotos e vídeos preservam suas cores originais.</Text>
        </View>
        <SettingSwitch
          title="Texto reforçado"
          subtitle="Aumenta o peso dos textos que não possuem destaque próprio"
          value={boldText}
          onValueChange={(valor) => void setBoldText(valor)}
        />
      </View>

      <View style={[styles.card, { marginTop: 12, backgroundColor: darkMode ? '#172033' : '#FFFFFF', borderColor: darkMode ? '#334155' : '#E1E5EB' }]}>
        <Text style={styles.sectionLabel}>LEITURA</Text>
        <SettingSwitch
          title="Espaçamento confortável"
          subtitle="Aumenta o espaço entre linhas para facilitar o acompanhamento do texto"
          value={comfortableSpacing}
          onValueChange={(valor) => void setComfortableSpacing(valor)}
        />
        <SettingSwitch
          title="Mais espaço entre letras"
          subtitle="Aumenta levemente o espaçamento das letras em todo o aplicativo"
          value={letterSpacing}
          onValueChange={(valor) => void setLetterSpacing(valor)}
        />
      </View>

      <View style={[styles.card, { marginTop: 12, backgroundColor: darkMode ? '#172033' : '#FFFFFF', borderColor: darkMode ? '#334155' : '#E1E5EB' }]}>
        <Text style={styles.sectionLabel}>TAMANHO DO TEXTO</Text>
        <Text style={styles.muted}>
          O tamanho escolhido é aplicado aos textos do aplicativo e fica salvo neste aparelho.
        </Text>

        {FONTES.map((opcao) => (
          <TouchableOpacity
            key={opcao.valor}
            accessibilityRole="radio"
            accessibilityState={{ selected: fontSize === opcao.valor }}
            accessibilityLabel={`Tamanho de texto ${opcao.titulo}`}
            accessibilityHint={opcao.descricao}
            onPress={() => alterarFonte(opcao.valor)}
            style={[styles.option, { backgroundColor: darkMode ? '#1E293B' : '#FFFFFF', borderColor: darkMode ? '#475569' : '#E1E5EB' }, fontSize === opcao.valor && styles.optionActive]}
          >
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.cardHeading}>{opcao.titulo}</Text>
              <Text style={styles.tinyMuted}>{opcao.descricao}</Text>
            </View>
            <View style={[styles.radio, fontSize === opcao.valor && styles.radioActive]}>
              {fontSize === opcao.valor && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.card, { marginTop: 12, backgroundColor: darkMode ? '#172033' : '#FFFFFF', borderColor: darkMode ? '#334155' : '#E1E5EB' }]}>
        <Text style={styles.sectionLabel}>INTERAÇÃO</Text>
        <SettingSwitch
          title="Controles maiores"
          subtitle="Aumenta a área de toque de botões e controles principais"
          value={largeTouchTargets}
          onValueChange={(valor) => void setLargeTouchTargets(valor)}
        />
        <SettingSwitch
          title="Desativar notificações"
          subtitle={notificationsLoaded ? "Controla mensagens, curtidas, comentários e publicações neste dispositivo e o envio push da conta" : "Carregando preferência da sua conta..."}
          value={!notifications}
          onValueChange={(valor) => void changeNotifications(!valor)}
        />
      </View>

      <View
        accessible
        accessibilityLabel="Prévia das configurações de leitura"
        style={[styles.preview, darkMode && { backgroundColor: '#1E293B', borderColor: '#475569' }]}
      >
        <Text style={styles.cardHeading}>PRÉVIA DE LEITURA</Text>
        <Text style={styles.resultText}>LibrasHub — Comunicação sem barreiras</Text>
        <Text style={styles.muted}>
          Use esta prévia para comparar tamanho, peso e espaçamento do texto antes de continuar.
        </Text>
      </View>

      <View style={{ marginTop: 12 }}>
        <Button title="Restaurar acessibilidade padrão" secondary onPress={restaurarPadroes} />
      </View>
    </View>
  );
}

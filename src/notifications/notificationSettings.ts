import { useEffect, useSyncExternalStore } from 'react';
import { consultarNotificacoesAtivas, definirNotificacoesAtivas } from '../api/mobileSocial';

/** Preferência do usuário autenticado, persistida no servidor e partilhada pelas telas. */
let currentId = 0;
let enabled = true;
let loaded = false;
const listeners = new Set<() => void>();
let version = 0;
const notify = () => listeners.forEach(listener => listener());
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
const snapshot = () => ({ userId: currentId, enabled, loaded, version });
let state = snapshot();
const update = () => { version++; state = snapshot(); notify(); };

export async function refreshNotificationSettings(userId: number): Promise<void> {
  if (!userId) return;
  if (currentId !== userId) { currentId = userId; enabled = true; loaded = false; update(); }
  const result = await consultarNotificacoesAtivas();
  if (currentId !== userId) return;
  enabled = Boolean(result.enabled);
  loaded = true;
  update();
}

export async function updateNotificationSettings(userId: number, value: boolean): Promise<void> {
  if (!userId) throw new Error('Entre na sua conta para alterar as notificações.');
  if (currentId !== userId) { currentId = userId; enabled = true; loaded = false; update(); }
  const previous = enabled;
  enabled = value;
  loaded = true;
  update(); // aplica imediatamente em todos os componentes
  try {
    const result = await definirNotificacoesAtivas(value);
    if (currentId === userId) { enabled = Boolean(result.enabled); update(); }
  } catch (e) {
    if (currentId === userId) { enabled = previous; update(); }
    throw e;
  }
}

export function useNotificationSettings(userId: number) {
  const data = useSyncExternalStore(subscribe, () => state, () => state);
  useEffect(() => {
    if (!userId) {
      if (currentId !== 0) { currentId = 0; enabled = true; loaded = false; update(); }
      return;
    }
    if (data.userId !== userId || !data.loaded) {
      void refreshNotificationSettings(userId).catch(error =>
        console.warn('Não foi possível carregar a preferência de notificações.', error));
    }
  }, [userId, data.userId, data.loaded]);
  return { enabled: data.userId === userId && data.enabled, loaded: data.userId === userId && data.loaded };
}

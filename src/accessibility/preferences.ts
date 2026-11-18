import { useEffect, useSyncExternalStore } from 'react';
import * as SecureStore from 'expo-secure-store';

type AccessibilityPreferences = {
  darkMode: boolean;
  highContrast: boolean;
  boldText: boolean;
  comfortableSpacing: boolean;
  letterSpacing: boolean;
  largeTouchTargets: boolean;
  colorBlindMode: boolean;
  colorBlindFilter: string;
};

const STORAGE_KEY = 'librashub_accessibility_preferences';
const PADRAO: AccessibilityPreferences = {
  darkMode: false,
  highContrast: false,
  boldText: false,
  comfortableSpacing: false,
  letterSpacing: false,
  largeTouchTargets: false,
  colorBlindMode: false,
  colorBlindFilter: "deuteranopia",
};

let valorAtual: AccessibilityPreferences = { ...PADRAO };
let carregado = false;
const ouvintes = new Set<() => void>();

function avisar() {
  ouvintes.forEach((ouvinte) => ouvinte());
}

function assinar(ouvinte: () => void) {
  ouvintes.add(ouvinte);
  return () => ouvintes.delete(ouvinte);
}

function obterSnapshot() {
  return valorAtual;
}

async function persistir() {
  try {
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(valorAtual));
  } catch {
    // Mantém as preferências durante a sessão se o armazenamento não estiver disponível.
  }
}

async function carregar() {
  if (carregado) return;
  carregado = true;

  try {
    const salvo = await SecureStore.getItemAsync(STORAGE_KEY);
    if (!salvo) return;

    const dados = JSON.parse(salvo);
    valorAtual = {
      darkMode: Boolean(dados.darkMode),
      highContrast: Boolean(dados.highContrast),
      boldText: Boolean(dados.boldText),
      comfortableSpacing: Boolean(dados.comfortableSpacing),
      letterSpacing: Boolean(dados.letterSpacing),
      largeTouchTargets: Boolean(dados.largeTouchTargets),
      colorBlindMode: Boolean(dados.colorBlindMode),
      colorBlindFilter: typeof dados.colorBlindFilter === "string" ? dados.colorBlindFilter : "deuteranopia",
    };
    avisar();
  } catch {
    // Mantém os padrões.
  }
}

export async function definirPreferenciaAcessibilidade(
  chave: Exclude<keyof AccessibilityPreferences, 'colorBlindFilter'>,
  valor: boolean,
) {
  valorAtual = { ...valorAtual, [chave]: valor };
  avisar();
  await persistir();
}

export async function restaurarPreferenciasAcessibilidade() {
  valorAtual = { ...PADRAO };
  avisar();
  await persistir();
}

export function useAccessibilityPreferences() {
  const preferences = useSyncExternalStore(assinar, obterSnapshot, obterSnapshot);

  useEffect(() => {
    void carregar();
  }, []);

  return {
    ...preferences,
    setDarkMode: (valor: boolean) => definirPreferenciaAcessibilidade('darkMode', valor),
    setHighContrast: (valor: boolean) => definirPreferenciaAcessibilidade('highContrast', valor),
    setBoldText: (valor: boolean) => definirPreferenciaAcessibilidade('boldText', valor),
    setComfortableSpacing: (valor: boolean) => definirPreferenciaAcessibilidade('comfortableSpacing', valor),
    setLetterSpacing: (valor: boolean) => definirPreferenciaAcessibilidade('letterSpacing', valor),
    setLargeTouchTargets: (valor: boolean) => definirPreferenciaAcessibilidade('largeTouchTargets', valor),
    setColorBlindMode: (valor: boolean) => definirPreferenciaAcessibilidade('colorBlindMode', valor),
    setColorBlindFilter: async (valor: string) => {
      valorAtual = { ...valorAtual, colorBlindFilter: valor, colorBlindMode: valor !== 'none' };
      avisar();
      await persistir();
    },
    resetPreferences: restaurarPreferenciasAcessibilidade,
  };
}

export function isDarkModeEnabled() {
  return valorAtual.darkMode;
}

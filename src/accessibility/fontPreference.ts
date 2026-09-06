import { useEffect, useSyncExternalStore } from 'react';
import * as SecureStore from 'expo-secure-store';
import { FontSize } from '../types';

const STORAGE_KEY = 'librashub_font_size';
const escalas: Record<FontSize, number> = { normal: 1, large: 1.15, extra: 1.3 };
let valorAtual: FontSize = 'normal';
let carregado = false;
const ouvintes = new Set<() => void>();

function avisar() { ouvintes.forEach((ouvinte) => ouvinte()); }
function assinar(ouvinte: () => void) {
  ouvintes.add(ouvinte);
  return () => { ouvintes.delete(ouvinte); };
}
function obterSnapshot() { return valorAtual; }

async function carregar() {
  if (carregado) return;
  carregado = true;
  try {
    const salvo = await SecureStore.getItemAsync(STORAGE_KEY);
    if (salvo === 'normal' || salvo === 'large' || salvo === 'extra') {
      valorAtual = salvo;
      avisar();
    }
  } catch {
    // Mantém o tamanho normal se o armazenamento não estiver disponível.
  }
}

export async function definirTamanhoFonte(valor: FontSize) {
  valorAtual = valor;
  avisar();
  try { await SecureStore.setItemAsync(STORAGE_KEY, valor); }
  catch { /* A alteração continua válida durante a sessão atual. */ }
}

export function useFontSizePreference() {
  const fontSize = useSyncExternalStore(assinar, obterSnapshot, obterSnapshot);
  useEffect(() => { carregar(); }, []);
  return { fontSize, escala: escalas[fontSize], setFontSize: definirTamanhoFonte };
}

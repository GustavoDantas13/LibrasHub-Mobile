import { apiFetch } from './api';
import { RegistroHistorico } from '../types';
import { File } from 'expo-file-system';

export type RespostaFrame = {
  sucesso: boolean;
  mensagem?: string;
  status: 'analisando' | 'traduzido' | 'invalido' | 'aguardando' | 'erro';
  gesto?: string;
  texto?: string;
  confirmacao?: number | string;
  confianca?: number;
  error?: string;
};

export type MidiaSelecionada = { uri: string; nome: string; tipo: string; tamanho?: number };

export type ResultadoMidia = {
  arquivo?: string;
  gesto?: string;
  confianca?: number;
  valido?: boolean;
  erro?: string;
  id_gesto?: number | null;
  id_historico?: number | null;
  url_arquivo?: string | null;
};

export type RespostaAnalise = {
  sucesso: boolean;
  mensagem?: string;
  resultados: ResultadoMidia[];
  frase: string;
  total_salvos?: number;
};

export function enviarFrame(uri: string, sessaoTraducao: string) {
  const form = new FormData();
  form.append('frame', new File(uri), 'frame.jpg');
  form.append('sessao_traducao', sessaoTraducao);
  return apiFetch<RespostaFrame>('traducao/frame.php', { method: 'POST', body: form });
}

export function analisarMidias(arquivos: MidiaSelecionada[]) {
  const form = new FormData();
  arquivos.forEach((arquivo) => {
    form.append('mediaFile[]', new File(arquivo.uri), arquivo.nome);
  });
  return apiFetch<RespostaAnalise>('traducao/analisar.php', { method: 'POST', body: form });
}

export const limparTraducao = (sessaoTraducao: string) => {
  const form = new FormData();
  form.append('sessao_traducao', sessaoTraducao);
  return apiFetch<{ sucesso: true; mensagem: string }>('traducao/limpar.php', { method: 'POST', body: form });
};

export const listarTraducoes = () => apiFetch<{ sucesso: true; mensagem: string; historico: RegistroHistorico[] }>('traducao/listar.php');
export const salvarTraducao = (dados: { id_gesto: number; texto_resultado?: string; url_arquivo?: string }) =>
  apiFetch<{ sucesso: true; mensagem: string; id_historico: number }>('traducao/salvar.php', { method: 'POST', body: JSON.stringify(dados) });
export const excluirTraducao = (id_historico: number) =>
  apiFetch<{ sucesso: true; mensagem: string }>('traducao/excluir.php', { method: 'DELETE', body: JSON.stringify({ id_historico }) });

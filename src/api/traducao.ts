import { apiFetch } from './api';
import { RegistroHistorico } from '../types';

export const listarTraducoes = () => apiFetch<{ sucesso: true; mensagem: string; historico: RegistroHistorico[] }>('traducao/listar.php');
export const salvarTraducao = (dados: { id_gesto: number; texto_resultado?: string; url_arquivo?: string }) =>
  apiFetch<{ sucesso: true; mensagem: string; id_historico: number }>('traducao/salvar.php', { method: 'POST', body: JSON.stringify(dados) });
export const excluirTraducao = (id_historico: number) =>
  apiFetch<{ sucesso: true; mensagem: string }>('traducao/excluir.php', { method: 'DELETE', body: JSON.stringify({ id_historico }) });

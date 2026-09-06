import { apiFetch } from './api';
import { Usuario } from '../types';

export const buscarUsuario = () => apiFetch<{ sucesso: true; mensagem: string; usuario: Usuario }>('usuario/buscar.php');
export const atualizarUsuario = (nome: string, email: string) => apiFetch<{ sucesso: true; mensagem: string; usuario: Usuario }>('usuario/atualizar.php', {
  method: 'PUT', body: JSON.stringify({ nome, email }),
});
export const excluirUsuario = () => apiFetch<{ sucesso: true; mensagem: string }>('usuario/excluir.php', { method: 'DELETE' });

import { apiFetch } from './api';
import { Usuario } from '../types';

type LoginResponse = { sucesso: true; mensagem: string; token: string; usuario: Usuario };
type CadastroResponse = { sucesso: true; mensagem: string; usuario: Usuario };

export const login = (email: string, senha: string) => apiFetch<LoginResponse>('auth/login.php', {
  method: 'POST', body: JSON.stringify({ email, senha }), autenticado: false,
});
export const cadastrar = (nome: string, email: string, senha: string) => apiFetch<CadastroResponse>('auth/cadastro.php', {
  method: 'POST', body: JSON.stringify({ nome, email, senha }), autenticado: false,
});
export const logout = () => apiFetch<{ sucesso: true; mensagem: string }>('auth/logout.php', { method: 'POST' });

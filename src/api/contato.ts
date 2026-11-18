import { apiFetch } from './api';

export const enviarContato = (nome: string, email: string, mensagem: string) =>
  apiFetch<{ sucesso: boolean; mensagem: string }>('mobile/contato.php', {
    method: 'POST',
    body: JSON.stringify({ nome, email, mensagem }),
  });

import { apiFetch } from './api';

export type MensagemChat = {
  id_mensagem: number;
  id_usuario: number;
  nm_usuario: string;
  ds_mensagem: string;
  dt_mensagem: string;
  curtidas: number;
  curtiu: boolean;
};

type ListarMensagensResponse = {
  sucesso: true;
  mensagem: string;
  mensagens: MensagemChat[];
};

export function listarMensagens() {
  return apiFetch<ListarMensagensResponse>('chat/listar.php');
}

export function enviarMensagem(mensagem: string) {
  return apiFetch<{ sucesso: true; mensagem: string; id_mensagem: number }>('chat/enviar.php', {
    method: 'POST',
    body: JSON.stringify({ mensagem }),
  });
}

export function reagirMensagem(idMensagem: number) {
  return apiFetch<{ sucesso: true; mensagem: string; curtiu: boolean; curtidas: number }>('chat/reagir.php', {
    method: 'POST',
    body: JSON.stringify({ id_mensagem: idMensagem }),
  });
}

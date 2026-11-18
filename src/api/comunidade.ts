import { File } from 'expo-file-system';
import { API_URL, apiFetch } from './api';

export type Comunidade = {
  id_comunidade: number;
  id_usuario: number;
  nm_comunidade: string;
  ds_comunidade: string | null;
  foto_url: string | null;
  privada: boolean;
  dt_criacao: string;
};

export type MembroComunidade = {
  id_usuario: number;
  nm_usuario: string;
  email_usuario: string;
  tp_cargo: 'criador' | 'administrador' | 'moderador' | 'membro';
  dt_entrada: string;
};

export type SolicitacaoComunidade = {
  id_solicitacao: number;
  id_usuario: number;
  nm_usuario: string;
  email_usuario: string;
  criado_em: string;
};

type MinhaComunidadeResponse = {
  sucesso: true;
  mensagem: string;
  comunidade: Comunidade | null;
  membros: MembroComunidade[];
  solicitacoes: SolicitacaoComunidade[];
};

export function carregarMinhaComunidade() {
  return apiFetch<MinhaComunidadeResponse>('comunidade/minha.php');
}

export async function salvarComunidade(params: {
  nome: string;
  descricao: string;
  privada: boolean;
  foto?: { uri: string; name?: string | null; mimeType?: string | null } | null;
  criarNova?: boolean;
}) {
  const form = new FormData();
  form.append('nome', params.nome);
  form.append('descricao', params.descricao);
  form.append('privada', params.privada ? '1' : '0');
  form.append('criar_nova', params.criarNova ? '1' : '0');

  if (params.foto?.uri) {
    form.append('foto', new File(params.foto.uri), params.foto.name || 'comunidade.jpg');
  }

  return apiFetch<{ sucesso: true; mensagem: string; id_comunidade: number }>('comunidade/salvar.php', {
    method: 'POST',
    body: form,
  });
}

export function adicionarMembro(identificador: string) {
  return apiFetch<{ sucesso: true; mensagem: string }>('comunidade/adicionar-membro.php', {
    method: 'POST',
    body: JSON.stringify({ identificador }),
  });
}

export function removerMembro(idUsuario: number) {
  return apiFetch<{ sucesso: true; mensagem: string }>('comunidade/remover-membro.php', {
    method: 'POST',
    body: JSON.stringify({ id_usuario: idUsuario }),
  });
}

export function responderSolicitacao(idSolicitacao: number, acao: 'aprovar' | 'recusar') {
  return apiFetch<{ sucesso: true; mensagem: string }>('comunidade/responder-solicitacao.php', {
    method: 'POST',
    body: JSON.stringify({ id_solicitacao: idSolicitacao, acao }),
  });
}


export type ComunidadeLista = Comunidade & {
  criador_nome: string;
  total_membros: number;
  eh_membro: boolean;
};

export function listarComunidades() {
  return apiFetch<{ sucesso: true; mensagem: string; comunidades: ComunidadeLista[] }>('comunidade/listar.php');
}

export function fotoComunidadeUrl(caminho?: string | null) {
  if (!caminho) return null;
  if (/^https?:\/\//i.test(caminho)) return caminho;
  return `${API_URL}/${caminho.replace(/^\/+/, '')}`;
}

import { apiFetch } from './api';

export type LocalAcessivel = {
  id_lugar: number;
  id_usuario: number;
  nm_lugar: string;
  ds_endereco_lugar: string;
  ds_lugar: string;
  tp_local: string;
  recursos_acessibilidade: string | null;
  criado_em: string;
  recomendado_por: string;
};

export function listarLocais() {
  return apiFetch<{ sucesso: true; mensagem: string; locais: LocalAcessivel[] }>('locais/listar.php');
}

export function criarLocal(dados: {
  nome: string;
  endereco: string;
  descricao: string;
  tipo: string;
  recursos_acessibilidade: string;
}) {
  return apiFetch<{ sucesso: true; mensagem: string; id_lugar: number }>('locais/criar.php', {
    method: 'POST',
    body: JSON.stringify(dados),
  });
}

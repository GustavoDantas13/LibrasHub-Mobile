import { buscarToken } from './token';
import { fetch as expoFetch } from 'expo/fetch';

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.1.11/librashub-api';
export const MEDIA_URL = process.env.EXPO_PUBLIC_MEDIA_URL ?? API_URL.replace(/\/librashub-api\/?$/, '');

export function criarUrlArquivo(caminho: string) {
  if (/^https?:\/\//i.test(caminho)) return caminho;
  return encodeURI(`${MEDIA_URL.replace(/\/$/, '')}/${caminho.replace(/^\/+/, '')}`);
}

type ApiOptions = RequestInit & { autenticado?: boolean };

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiFetch<T>(endpoint: string, { autenticado = true, ...options }: ApiOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');
  if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  if (autenticado) {
    const token = await buscarToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await expoFetch(`${API_URL}/${endpoint}`, {
      ...options,
      headers,
    });
  } catch (erro) {
    console.error(
      'Falha na requisição:',
      erro,
      'URL:',
      `${API_URL}/${endpoint}`,
    );

    throw new ApiError(
      erro instanceof Error
        ? erro.message
        : 'Não foi possível acessar a API.',
      0,
    );
  }

  const texto = await response.text();
  let dados: any = {};
  if (texto) {
    try { dados = JSON.parse(texto); }
    catch { throw new ApiError('A API retornou uma resposta inválida.', response.status); }
  }
  if (!response.ok || dados.sucesso === false) {
    throw new ApiError(dados.mensagem ?? 'Erro ao comunicar com o servidor.', response.status);
  }
  return dados as T;
}

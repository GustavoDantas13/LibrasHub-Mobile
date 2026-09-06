import { buscarToken } from './token';

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
    response = await fetch(`${API_URL}/${endpoint}`, { ...options, headers });
  } catch {
    throw new ApiError('Não foi possível acessar a API. Verifique o XAMPP, o IP e a rede Wi-Fi.', 0);
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

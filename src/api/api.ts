import { buscarToken } from './token';
import { fetch as expoFetch } from 'expo/fetch';

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.1.11/librashub-api';
export const MEDIA_URL = process.env.EXPO_PUBLIC_MEDIA_URL ?? API_URL.replace(/\/librashub-api\/?$/, '');

/** Normaliza imagens do web para o caminho HTTP efetivamente servido pelo Apache.
 * EXPO_PUBLIC_MEDIA_URL = origem web que contém /static (XAMPP: http://IP/librashub).
 */
export function criarUrlArquivo(caminho: string): string {
  const source = caminho.trim().replace(/\\/g, '/');
  const marker = source.toLowerCase().indexOf('static/uploads/');
  const isAbsolute = /^https?:\/\//i.test(source);
  if (isAbsolute && marker < 0) return encodeURI(source);

  let relative = marker >= 0
    ? source.slice(marker)
    : source.replace(/^(?:\.\.\/|\.\/)+/, '').replace(/^\/+/, '');
  if (/^(?:uploads\/|avatars\/|profiles\/)/i.test(relative)) {
    relative = 'static/' + (/^uploads\//i.test(relative) ? relative : 'uploads/' + relative);
  }

  const apiOrigin = API_URL.match(/^https?:\/\/[^/]+/i)?.[0] || '';
  const host = apiOrigin.replace(/^https?:\/\//i, '');
  const isLocal = /^(?:localhost|127\.0\.0\.1|192\.168\.|10\.|172\.(?:1[6-9]|2\d|3[01])\.)/i.test(host);
  const configuredRoot = MEDIA_URL.replace(/\/+$/, '');
  // Com a API local em /librashub-api e a instalação web em /librashub,
  // o endereço /static sozinho não corresponde ao diretório XAMPP do usuário.
  const root = isLocal && configuredRoot === apiOrigin
    ? configuredRoot + '/librashub'
    : configuredRoot;
  return encodeURI(`${root}/${relative.replace(/^\/+/, '')}`);
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

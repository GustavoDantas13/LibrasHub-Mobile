import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'librashub_api_token';

export const salvarToken = (token: string) => SecureStore.setItemAsync(TOKEN_KEY, token);
export const buscarToken = () => SecureStore.getItemAsync(TOKEN_KEY);
export const removerToken = () => SecureStore.deleteItemAsync(TOKEN_KEY);

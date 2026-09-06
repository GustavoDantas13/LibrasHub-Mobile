import { HistoryItem } from '../types';
export const MOCK_USER = { name: 'Ggg', email: 'ggg@librazhub.com', type: 'Usuário Simples', since: '20/05/2026' };
export const INITIAL_HISTORY: HistoryItem[] = [
  { id: 1, text: 'Olá, como você está?', date: '15/05/2026 19:32', method: 'Câmera' },
  { id: 2, text: 'Bom dia!', date: '14/05/2026 10:14', method: 'Upload' },
  { id: 3, text: 'Obrigado pela ajuda', date: '13/05/2026 16:45', method: 'Câmera' },
  { id: 4, text: 'Até logo', date: '10/05/2026 12:00', method: 'Upload' },
];

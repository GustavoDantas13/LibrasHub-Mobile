import React from 'react';
export type Page = 'landing' | 'login' | 'cadastro' | 'esqueci-senha' | 'social' | 'leitor' | 'upload' | 'historico' | 'ajuda' | 'perfil' | 'configuracoes';
export type FontSize = 'normal' | 'large' | 'extra';
export type IconType = React.ComponentType<any>;
export type HistoryItem = { id: number; text: string; date: string; method: 'Câmera' | 'Upload' };

export type Usuario = {
  id_usuario: number;
  nm_usuario: string;
  email_usuario: string;
  tp_usuario: string;
  dt_usuario?: string;
};

export type RegistroHistorico = {
  id_historico: number;
  id_gesto: number;
  nm_gesto: string | null;
  url_arquivo: string | null;
  texto_resultado: string | null;
  criado_em: string;
};

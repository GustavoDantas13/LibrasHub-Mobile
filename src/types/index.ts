import React from 'react';
export type Page = 'landing' | 'login' | 'cadastro' | 'esqueci-senha' | 'social' | 'leitor' | 'upload' | 'historico' | 'ajuda' | 'perfil' | 'editar-perfil' | 'configuracoes' | 'locais' | 'gerenciar-comunidade';
export type FontSize = 'normal' | 'large' | 'extra' | 'huge';
export type IconType = React.ComponentType<any>;
export type HistoryItem = { id: number; text: string; date: string; method: 'Câmera' | 'Upload' };

export type Usuario = {
  id_usuario: number;
  nm_usuario: string;
  email_usuario: string;
  tp_usuario: string;
  dt_usuario?: string;
  foto_perfil?: string | null;
  banner_perfil?: string | null;
  status_visibilidade?: 'visivel' | 'oculto';
};

export type RegistroHistorico = {
  id_historico: number;
  id_gesto: number;
  nm_gesto: string | null;
  url_arquivo: string | null;
  texto_resultado: string | null;
  criado_em: string;
};

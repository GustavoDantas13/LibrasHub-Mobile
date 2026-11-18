import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { cadastrar as cadastrarApi, login as loginApi, logout as logoutApi, TipoCadastro } from '../api/auth';
import { buscarToken, removerToken, salvarToken } from '../api/token';
import { atualizarUsuario, buscarUsuario, excluirUsuario } from '../api/usuario';
import { Usuario } from '../types';
import { salvarPerfilCompleto, AnexoPerfil } from '../api/perfil';

type AuthContextValue = {
  usuario: Usuario | null;
  carregando: boolean;
  entrar: (email: string, senha: string) => Promise<void>;
  cadastrar: (nome: string, email: string, senha: string, tipoUsuario: TipoCadastro) => Promise<void>;
  sair: () => Promise<void>;
  atualizarPerfil: (nome: string, email: string) => Promise<void>;
  excluirConta: () => Promise<void>;
  atualizarPerfilCompleto: (nome:string,email:string,visibilidade:'visivel'|'oculto',foto?:AnexoPerfil|null,capa?:AnexoPerfil|null) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function restaurarSessao() {
      try {
        const token = await buscarToken();
        if (!token) return;
        setUsuario((await buscarUsuario()).usuario);
      } catch {
        await removerToken();
      } finally {
        setCarregando(false);
      }
    }
    restaurarSessao();
  }, []);

  async function entrar(email: string, senha: string) {
    const resposta = await loginApi(email, senha);
    await salvarToken(resposta.token);
    setUsuario(resposta.usuario);
  }
  async function cadastrar(nome: string, email: string, senha: string, tipoUsuario: TipoCadastro) {
    await cadastrarApi(nome, email, senha, tipoUsuario);
    await entrar(email, senha);
  }
  async function sair() {
    try { await logoutApi(); }
    finally { await removerToken(); setUsuario(null); }
  }
  async function atualizarPerfil(nome: string, email: string) {
    setUsuario((await atualizarUsuario(nome, email)).usuario);
  }
  async function atualizarPerfilCompleto(nome:string,email:string,visibilidade:'visivel'|'oculto',foto?:AnexoPerfil|null,capa?:AnexoPerfil|null) {
    const resultado=await salvarPerfilCompleto(nome,email,visibilidade,foto,capa);
    setUsuario(resultado.usuario);
  }
  async function excluirConta() {
    await excluirUsuario();
    await removerToken();
    setUsuario(null);
  }

  const valor = useMemo(() => ({ usuario, carregando, entrar, cadastrar, sair, atualizarPerfil, atualizarPerfilCompleto, excluirConta }), [usuario, carregando]);
  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  return contexto;
}

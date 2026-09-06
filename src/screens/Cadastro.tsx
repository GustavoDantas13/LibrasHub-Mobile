import React, { useState } from 'react';
import { Alert } from 'react-native';
import Text from '../components/AppText';
import { useAuth } from '../contexts/AuthContext';
import { Page } from '../types';
import AuthLayout from '../components/AuthLayout';
import Button from '../components/Button';
import Field from '../components/Field';
import { Mail, User, UserPlus } from '../components/Icons';
import { styles } from '../styles/styles';

export default function Cadastro({ setPage }: { setPage: (p: Page) => void }) {
  const { cadastrar } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function handleCadastro() {
    if (!name.trim() || !email.trim() || !pass) {
      Alert.alert('Campos obrigatórios', 'Preencha nome, email e senha.');
      return;
    }
    setEnviando(true);
    try {
      await cadastrar(name.trim(), email.trim(), pass);
      setPage('social');
    } catch (error) {
      Alert.alert('Não foi possível criar a conta', error instanceof Error ? error.message : 'Tente novamente.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AuthLayout onBack={() => setPage('landing')}>
      <Text style={styles.authTitle}>Criar conta</Text>
      <Text style={styles.centerMuted}>Junte-se à comunidade LIBRAS</Text>
      <Field label="Nome completo" value={name} onChangeText={setName} placeholder="Seu nome" icon={User} />
      <Field label="Email" value={email} onChangeText={setEmail} placeholder="seuemail@exemplo.com" icon={Mail} />
      <Field label="Senha" value={pass} onChangeText={setPass} placeholder="Mínimo de 8 caracteres" secureTextEntry />
      <Button title={enviando ? 'Criando conta...' : 'Criar Conta'} icon={UserPlus} disabled={enviando} onPress={handleCadastro} />
      <Text style={styles.centerMuted}>Já tem conta? <Text style={styles.link} onPress={() => setPage('login')}>Entrar</Text></Text>
    </AuthLayout>
  );
}

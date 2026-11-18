import React, { useState } from 'react';
import { Alert, TouchableOpacity } from 'react-native';
import Text from '../components/AppText';
import { useAuth } from '../contexts/AuthContext';
import { Page } from '../types';
import AuthLayout from '../components/AuthLayout';
import Button from '../components/Button';
import Field from '../components/Field';
import { Mail } from '../components/Icons';
import { styles } from '../styles/styles';

export default function Login({ setPage }: { setPage: (p: Page) => void }) {
  const { entrar } = useAuth();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !pass) {
      Alert.alert('Campos obrigatórios', 'Preencha o email e a senha.');
      return;
    }
    setEnviando(true);
    try {
      await entrar(email.trim(), pass);
      setPage('social');
    } catch (error) {
      Alert.alert('Não foi possível entrar', error instanceof Error ? error.message : 'Tente novamente.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AuthLayout onBack={() => setPage('landing')}>
      <Text style={styles.authTitle}>Bem-vindo de volta</Text>
      <Text style={styles.centerMuted}>Acesse sua conta para continuar</Text>
      <Field label="Email" value={email} onChangeText={setEmail} placeholder="seuemail@exemplo.com" icon={Mail} />
      <Field label="Senha" value={pass} onChangeText={setPass} placeholder="••••••••" secureTextEntry />
      <TouchableOpacity onPress={() => setPage('esqueci-senha')}><Text style={styles.linkRight}>Esqueci minha senha</Text></TouchableOpacity>
      <Button title={enviando ? 'Entrando...' : 'Entrar'} disabled={enviando} onPress={handleLogin} />
      <Text style={styles.centerMuted}>Não tem conta? <Text style={styles.link} onPress={() => setPage('cadastro')}>Cadastre-se</Text></Text>
    </AuthLayout>
  );
}

import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import Text from '../components/AppText';
import { Page } from '../types';
import AuthLayout from '../components/AuthLayout';
import Button from '../components/Button';
import Field from '../components/Field';
import { Mail } from '../components/Icons';
import { useAppTheme } from '../contexts/ThemeContext';

export default function EsqueciSenha({ setPage }: { setPage: (p: Page) => void }) {
  const { colors, styles } = useAppTheme();
  const [email, setEmail] = useState('');
  return <AuthLayout onBack={() => setPage('login')}>
    <View style={styles.largeIconCircle}><Mail size={30} color={colors.primary} /></View>
    <Text style={styles.authTitle}>Esqueci minha senha</Text>
    <Text style={styles.centerMuted}>Informe o email utilizado em sua conta.</Text>
    <Field label="Email cadastrado" value={email} onChangeText={setEmail} placeholder="seuemail@exemplo.com" icon={Mail} />
    <Button title="Enviar link de recuperação" disabled={!email.trim()} onPress={() => Alert.alert('Recuperação ainda não configurada', 'O envio será habilitado quando um serviço de email for conectado à API.')} />
  </AuthLayout>;
}

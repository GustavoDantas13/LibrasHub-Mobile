import React, { useState } from 'react';
import { Alert, TouchableOpacity, View } from 'react-native';
import Text from '../components/AppText';
import { useAuth } from '../contexts/AuthContext';
import { Page } from '../types';
import { TipoCadastro } from '../api/auth';
import AuthLayout from '../components/AuthLayout';
import Button from '../components/Button';
import Field from '../components/Field';
import { Mail, User, UserPlus } from '../components/Icons';
import { styles } from '../styles/styles';

const TIPOS: { valor: TipoCadastro; titulo: string; descricao: string }[] = [
  {
    valor: 'Usuário comum',
    titulo: 'Usuário comum',
    descricao: 'Use o leitor, histórico, social e locais acessíveis.',
  },
  {
    valor: 'Usuário comunitário',
    titulo: 'Usuário comunitário',
    descricao: 'Além das funções comuns, pode gerenciar comunidade e recomendar locais.',
  },
];

export default function Cadastro({ setPage }: { setPage: (p: Page) => void }) {
  const { cadastrar } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState<TipoCadastro>('Usuário comum');
  const [enviando, setEnviando] = useState(false);

  async function handleCadastro() {
    if (!name.trim() || !email.trim() || !pass) {
      Alert.alert('Campos obrigatórios', 'Preencha nome, email e senha.');
      return;
    }

    setEnviando(true);
    try {
      await cadastrar(name.trim(), email.trim(), pass, tipoUsuario);
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

      <View style={{ marginTop: 5 }}>
        <Text style={styles.fieldLabel}>Tipo de usuário</Text>
        {TIPOS.map((tipo) => {
          const ativo = tipoUsuario === tipo.valor;
          return (
            <TouchableOpacity
              key={tipo.valor}
              accessibilityRole="radio"
              accessibilityState={{ selected: ativo }}
              accessibilityLabel={tipo.titulo}
              accessibilityHint={tipo.descricao}
              onPress={() => setTipoUsuario(tipo.valor)}
              style={[styles.option, ativo && styles.optionActive]}
            >
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={styles.cardHeading}>{tipo.titulo}</Text>
                <Text style={styles.tinyMuted}>{tipo.descricao}</Text>
              </View>
              <View style={[styles.radio, ativo && styles.radioActive]}>
                {ativo && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <Button title={enviando ? 'Criando conta...' : 'Criar Conta'} icon={UserPlus} disabled={enviando} onPress={handleCadastro} />
      <Text style={styles.centerMuted}>Já tem conta? <Text style={styles.link} onPress={() => setPage('login')}>Entrar</Text></Text>
    </AuthLayout>
  );
}

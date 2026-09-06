import React, { useEffect, useState } from 'react';
import { Alert, TouchableOpacity, View } from 'react-native';
import Text from '../components/AppText';
import { listarTraducoes } from '../api/traducao';
import { useAuth } from '../contexts/AuthContext';
import { Page } from '../types';
import Button from '../components/Button';
import Field from '../components/Field';
import Stat from '../components/Stat';
import { AlertTriangle, Clock, LogOut, Settings, Trash2 } from '../components/Icons';
import { styles } from '../styles/styles';

function formatarData(valor?: string) {
  if (!valor) return '—';
  const data = new Date(valor.replace(' ', 'T'));
  return Number.isNaN(data.getTime()) ? valor : data.toLocaleDateString('pt-BR');
}

export default function Perfil({ setPage }: { setPage: (p: Page) => void }) {
  const { usuario, sair, atualizarPerfil, excluirConta } = useAuth();
  const [name, setName] = useState(usuario?.nm_usuario ?? '');
  const [email, setEmail] = useState(usuario?.email_usuario ?? '');
  const [editing, setEditing] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [stats, setStats] = useState({ total: 0, camera: 0, uploads: 0 });

  useEffect(() => { setName(usuario?.nm_usuario ?? ''); setEmail(usuario?.email_usuario ?? ''); }, [usuario]);
  useEffect(() => {
    listarTraducoes().then(({ historico }) => setStats({
      total: historico.length,
      camera: historico.filter((item) => !item.url_arquivo).length,
      uploads: historico.filter((item) => Boolean(item.url_arquivo)).length,
    })).catch(() => undefined);
  }, []);

  if (!usuario) return null;

  async function salvar() {
    if (!editing) { setEditing(true); return; }
    setSalvando(true);
    try {
      await atualizarPerfil(name.trim(), email.trim());
      setEditing(false);
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso.');
    } catch (error) {
      Alert.alert('Erro ao atualizar', error instanceof Error ? error.message : 'Tente novamente.');
    } finally { setSalvando(false); }
  }
  async function handleSair() { await sair(); setPage('landing'); }
  function confirmarExclusao() {
    Alert.alert('Excluir conta', 'Esta ação é irreversível.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        try { await excluirConta(); setPage('landing'); }
        catch (error) { Alert.alert('Erro ao excluir conta', error instanceof Error ? error.message : 'Tente novamente.'); }
      } },
    ]);
  }

  return <View>
    <View style={styles.card}>
      <View style={styles.avatarLarge}><Text style={styles.avatarLargeText}>{name.charAt(0).toUpperCase()}</Text></View>
      <Text style={styles.profileName}>{usuario.nm_usuario}</Text><Text style={styles.muted}>{usuario.email_usuario}</Text>
      <View style={styles.stats}><Stat v={String(stats.total)} l="Traduções"/><Stat v={String(stats.camera)} l="Câmera"/><Stat v={String(stats.uploads)} l="Uploads"/></View>
      <Button title="Histórico" icon={Clock} secondary onPress={() => setPage('historico')} />
      <Button title="Configurações" icon={Settings} secondary onPress={() => setPage('configuracoes')} />
      <Button title="Sair da Conta" icon={LogOut} secondary onPress={handleSair} />
    </View>
    <View style={[styles.card, { marginTop: 12 }]}>
      <View style={styles.rowBetween}><Text style={styles.cardHeading}>Informações da Conta</Text><TouchableOpacity disabled={salvando} onPress={salvar}><Text style={styles.link}>{salvando ? 'Salvando...' : editing ? 'Salvar' : 'Editar'}</Text></TouchableOpacity></View>
      {editing ? <><Field label="Nome Completo" value={name} onChangeText={setName} placeholder="Nome" /><Field label="Email" value={email} onChangeText={setEmail} placeholder="Email" /></> : <><Text style={styles.fieldLabel}>Nome Completo</Text><Text style={styles.infoBox}>{usuario.nm_usuario}</Text><Text style={styles.fieldLabel}>Email</Text><Text style={styles.infoBox}>{usuario.email_usuario}</Text></>}
      <Text style={styles.fieldLabel}>Tipo de Usuário</Text><Text style={styles.infoBox}>{usuario.tp_usuario}</Text>
      <Text style={styles.tinyMuted}>Membro desde {formatarData(usuario.dt_usuario)}</Text>
    </View>
    <View style={styles.dangerCard}><View style={styles.sectionTitleRow}><AlertTriangle size={17} color="#B42318" /><Text style={styles.dangerText}>Zona de Perigo</Text></View><Button title="Excluir Conta" icon={Trash2} danger onPress={confirmarExclusao} /></View>
  </View>;
}

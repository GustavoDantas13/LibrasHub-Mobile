import { View, TouchableOpacity, TextInput } from '../components/AccessiblePrimitives';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Text from '../components/AppText';
import Button from '../components/Button';
import ScreenTitle from '../components/ScreenTitle';
import SettingSwitch from '../components/SettingSwitch';
import { COLORS } from '../constants/colors';
import { CheckCircle, ImageIcon, Trash2, User, UserPlus } from '../components/Icons';
import { styles } from '../styles/styles';
import {
  adicionarMembro,
  carregarMinhaComunidade,
  Comunidade,
  fotoComunidadeUrl,
  MembroComunidade,
  removerMembro,
  responderSolicitacao,
  salvarComunidade,
  SolicitacaoComunidade,
} from '../api/comunidade';

export default function GerenciarComunidade() {
  const [comunidade, setComunidade] = useState<Comunidade | null>(null);
  const [membros, setMembros] = useState<MembroComunidade[]>([]);
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoComunidade[]>([]);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [privada, setPrivada] = useState(false);
  const [foto, setFoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [identificador, setIdentificador] = useState('');
  const [aba, setAba] = useState<'solicitacoes' | 'membros'>('membros');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [criandoOutra, setCriandoOutra] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const resposta = await carregarMinhaComunidade();
      setComunidade(criandoOutra ? null : resposta.comunidade);
      setMembros(resposta.membros);
      setSolicitacoes(resposta.solicitacoes);
      setNome(criandoOutra ? '' : resposta.comunidade?.nm_comunidade ?? '');
      setDescricao(criandoOutra ? '' : resposta.comunidade?.ds_comunidade ?? '');
      setPrivada(criandoOutra ? false : Boolean(resposta.comunidade?.privada));
    } catch (error) {
      Alert.alert('Comunidade', error instanceof Error ? error.message : 'Não foi possível carregar a comunidade.');
    } finally {
      setCarregando(false);
    }
  }, [criandoOutra]);

  useEffect(() => { void carregar(); }, [carregar]);

  async function escolherFoto() {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert('Permissão necessária', 'Permita o acesso às fotos para escolher a imagem da comunidade.');
      return;
    }
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!resultado.canceled && resultado.assets[0]) setFoto(resultado.assets[0]);
  }

  async function salvar() {
    if (!nome.trim()) {
      Alert.alert('Nome obrigatório', 'Informe o nome da comunidade.');
      return;
    }
    setSalvando(true);
    try {
      await salvarComunidade({
        nome: nome.trim(),
        descricao: descricao.trim(),
        privada,
        foto,
        criarNova: criandoOutra,
      });
      setFoto(null);
      setCriandoOutra(false);
      await carregar();
      Alert.alert('Sucesso', 'Informações da comunidade salvas.');
    } catch (error) {
      Alert.alert('Não foi possível salvar', error instanceof Error ? error.message : 'Tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  async function adicionar() {
    if (!identificador.trim()) return;
    try {
      await adicionarMembro(identificador.trim());
      setIdentificador('');
      await carregar();
    } catch (error) {
      Alert.alert('Não foi possível adicionar', error instanceof Error ? error.message : 'Tente novamente.');
    }
  }

  function confirmarRemocao(membro: MembroComunidade) {
    Alert.alert('Remover membro', `Remover ${membro.nm_usuario} da comunidade?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          try {
            await removerMembro(membro.id_usuario);
            await carregar();
          } catch (error) {
            Alert.alert('Erro', error instanceof Error ? error.message : 'Não foi possível remover o membro.');
          }
        },
      },
    ]);
  }

  async function responder(idSolicitacao: number, acao: 'aprovar' | 'recusar') {
    try {
      await responderSolicitacao(idSolicitacao, acao);
      await carregar();
    } catch (error) {
      Alert.alert('Erro', error instanceof Error ? error.message : 'Não foi possível responder à solicitação.');
    }
  }

  if (carregando) {
    return <View style={{ paddingVertical: 60, alignItems: 'center' }}><ActivityIndicator color={COLORS.primary} size="large" /></View>;
  }

  const fotoAtual = foto?.uri || fotoComunidadeUrl(comunidade?.foto_url);

  return (
    <View>
      <ScreenTitle title={comunidade ? "Gerenciar comunidade" : "Criar comunidade"} subtitle={comunidade ? "Edite sua comunidade, membros e solicitações." : "Crie sua comunidade e comece a reunir membros."} />

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>INFORMAÇÕES</Text>
        <Text style={styles.fieldLabel}>Nome</Text>
        <TextInput
          accessibilityLabel="Nome da comunidade"
          value={nome}
          onChangeText={setNome}
          placeholder="Nome da comunidade"
          placeholderTextColor="#7B8495"
          style={styles.inputSimple}
        />

        <Text style={[styles.fieldLabel, { marginTop: 10 }]}>Descrição</Text>
        <TextInput
          accessibilityLabel="Descrição da comunidade"
          value={descricao}
          onChangeText={setDescricao}
          placeholder="Descreva o objetivo da comunidade"
          placeholderTextColor="#7B8495"
          multiline
          style={[styles.inputSimple, styles.textarea]}
        />

        <Text style={[styles.fieldLabel, { marginTop: 10 }]}>Foto da comunidade</Text>
        {fotoAtual ? <Image source={{ uri: fotoAtual }} style={styles.communityPhoto} /> : null}
        <Button title={fotoAtual ? 'Trocar foto' : 'Escolher foto'} icon={ImageIcon} secondary onPress={escolherFoto} />
        <Text style={styles.tinyMuted}>Opcional. JPG, PNG ou WebP, até 5 MB.</Text>

        <SettingSwitch
          title="Comunidade privada"
          subtitle="Entrada de novos membros pode depender de aprovação"
          value={privada}
          onValueChange={setPrivada}
        />
        <Button title={salvando ? 'Salvando...' : comunidade ? 'Salvar informações' : 'Criar comunidade'} disabled={salvando} onPress={salvar} />
      </View>

      {comunidade && !criandoOutra && <View style={{ marginTop: 10 }}><Button title="Criar outra comunidade" secondary onPress={() => { setCriandoOutra(true); setComunidade(null); setNome(''); setDescricao(''); setPrivada(false); setFoto(null); }} /></View>}

      {!criandoOutra && <View style={[styles.card, { marginTop: 12 }]}>
        <Text style={styles.sectionLabel}>MEMBROS</Text>
        <Text style={styles.muted}>Adicione pelo @ID ou pelo email do usuário.</Text>
        <View style={styles.memberAddRow}>
          <TextInput
            accessibilityLabel="ID ou email do usuário"
            value={identificador}
            onChangeText={setIdentificador}
            placeholder="@ID ou email"
            placeholderTextColor="#7B8495"
            autoCapitalize="none"
            style={[styles.inputSimple, { flex: 1, marginBottom: 0 }]}
          />
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Adicionar membro" onPress={adicionar} style={styles.memberAddButton}>
            <UserPlus size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.communityTabs}>
          <TouchableOpacity
            accessibilityRole="tab"
            accessibilityState={{ selected: aba === 'solicitacoes' }}
            onPress={() => setAba('solicitacoes')}
            style={[styles.communityTab, aba === 'solicitacoes' && styles.communityTabActive]}
          >
            <Text style={[styles.tabText, aba === 'solicitacoes' && styles.tabTextActive]}>Solicitações ({solicitacoes.length})</Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="tab"
            accessibilityState={{ selected: aba === 'membros' }}
            onPress={() => setAba('membros')}
            style={[styles.communityTab, aba === 'membros' && styles.communityTabActive]}
          >
            <Text style={[styles.tabText, aba === 'membros' && styles.tabTextActive]}>Membros ({membros.length})</Text>
          </TouchableOpacity>
        </View>

        {aba === 'membros' ? (
          membros.length === 0 ? <Text style={styles.muted}>Nenhum membro cadastrado.</Text> : membros.map((membro) => (
            <View key={membro.id_usuario} style={styles.memberRow}>
              <View style={styles.avatarSmall}><User size={16} color={COLORS.primary} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardHeading}>{membro.nm_usuario}</Text>
                <Text style={styles.tinyMuted}>@{membro.id_usuario} · {membro.tp_cargo}</Text>
              </View>
              {membro.tp_cargo !== 'criador' && (
                <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Remover ${membro.nm_usuario}`} onPress={() => confirmarRemocao(membro)} style={styles.deleteIcon}>
                  <Trash2 size={17} color={COLORS.danger} />
                </TouchableOpacity>
              )}
            </View>
          ))
        ) : (
          solicitacoes.length === 0 ? <Text style={styles.muted}>Nenhuma solicitação pendente.</Text> : solicitacoes.map((solicitacao) => (
            <View key={solicitacao.id_solicitacao} style={styles.requestCard}>
              <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                <View style={styles.avatarSmall}><User size={16} color={COLORS.primary} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardHeading}>{solicitacao.nm_usuario}</Text>
                  <Text style={styles.tinyMuted}>@{solicitacao.id_usuario}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                <TouchableOpacity onPress={() => responder(solicitacao.id_solicitacao, 'aprovar')} style={[styles.smallAction, { flex: 1 }]}>
                  <CheckCircle size={16} color={COLORS.primary} /><Text style={styles.link}>Aprovar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => responder(solicitacao.id_solicitacao, 'recusar')} style={[styles.smallAction, { flex: 1 }]}>
                  <Trash2 size={16} color={COLORS.danger} /><Text style={{ color: COLORS.danger, fontWeight: '800' }}>Recusar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>}
    </View>
  );
}

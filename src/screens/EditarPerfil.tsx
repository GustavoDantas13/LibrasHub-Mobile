import { View, TouchableOpacity } from '../components/AccessiblePrimitives';
import React, { useEffect, useState } from 'react';
import { Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Ionicons from '../components/AccessibleIonicons';
import { obterPerfilSocial, arquivoWeb } from '../api/mobileSocial';
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
  const { usuario, sair, atualizarPerfilCompleto, excluirConta } = useAuth();
  const [name, setName] = useState(usuario?.nm_usuario ?? '');
  const [email, setEmail] = useState(usuario?.email_usuario ?? '');
  const [editing, setEditing] = useState(false);
  const [foto,setFoto]=useState<ImagePicker.ImagePickerAsset|null>(null);
  const [capa,setCapa]=useState<ImagePicker.ImagePickerAsset|null>(null);
  const [fotoAtual,setFotoAtual]=useState<string|null>(null);
  const [capaAtual,setCapaAtual]=useState<string|null>(null);
  const [visibilidade,setVisibilidade]=useState<'visivel'|'oculto'>('visivel');
  const [salvando, setSalvando] = useState(false);
  const [stats, setStats] = useState({ total: 0, camera: 0, uploads: 0 });

  useEffect(() => { setName(usuario?.nm_usuario ?? ''); setEmail(usuario?.email_usuario ?? ''); }, [usuario]);
  useEffect(() => {if(!usuario)return;let active=true;obterPerfilSocial(usuario.id_usuario).then(({profile})=>{if(active){setFotoAtual(arquivoWeb(profile.foto_perfil));setCapaAtual(arquivoWeb(profile.banner_perfil));setVisibilidade(profile.status_visibilidade==='oculto'?'oculto':'visivel')}}).catch(()=>{});return()=>{active=false};},[usuario?.id_usuario]);
  async function selecionarImagem(tipo:'foto'|'capa'){const r=await ImagePicker.launchImageLibraryAsync({mediaTypes:['images'],quality:0.85});if(!r.canceled){if(tipo==='foto')setFoto(r.assets[0]);else setCapa(r.assets[0]);}}
  useEffect(() => {
    listarTraducoes().then(({ historico }) => setStats({
      total: historico.length,
      camera: historico.filter((item) => !item.url_arquivo).length,
      uploads: historico.filter((item) => Boolean(item.url_arquivo)).length,
    })).catch(() => undefined);
  }, []);

  if (!usuario) return null;

  async function salvar(force=false) {
    if (!editing && !force) { setEditing(true); return; }
    setSalvando(true);
    try {
      await atualizarPerfilCompleto(name.trim(), email.trim(), visibilidade, foto, capa);
      setFoto(null);setCapa(null);
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
    <TouchableOpacity accessibilityRole="button" onPress={()=>setPage('perfil')} style={{flexDirection:'row',alignItems:'center',gap:8,paddingVertical:12,marginBottom:5}}><Ionicons name="arrow-back" size={21} color="#183366"/><Text style={{color:'#183366',fontWeight:'800'}}>Voltar ao perfil</Text></TouchableOpacity>
    <View style={styles.card}>
      <View style={[styles.avatarLarge,{overflow:"hidden"}]}>{foto?.uri||fotoAtual||arquivoWeb(usuario.foto_perfil)?<Image source={{uri:foto?.uri||fotoAtual||arquivoWeb(usuario.foto_perfil)!}} style={{width:"100%",height:"100%"}}/>:<Text style={styles.avatarLargeText}>{name.charAt(0).toUpperCase()}</Text>}</View>
      <Text style={styles.profileName}>{usuario.nm_usuario}</Text><Text style={styles.muted}>{usuario.email_usuario}</Text>
      <View style={styles.stats}><Stat v={String(stats.total)} l="Traduções"/><Stat v={String(stats.camera)} l="Câmera"/><Stat v={String(stats.uploads)} l="Uploads"/></View>
      <Button title="Histórico" icon={Clock} secondary onPress={() => setPage('historico')} />
      <Button title="Configurações" icon={Settings} secondary onPress={() => setPage('configuracoes')} />
      <Button title="Sair da Conta" icon={LogOut} secondary onPress={handleSair} />
    </View>
    <View style={[styles.card, { marginTop: 12 }]}>
      <View style={styles.rowBetween}><Text style={styles.cardHeading}>Informações da Conta</Text><TouchableOpacity disabled={salvando} onPress={()=>void salvar()}><Text style={styles.link}>{salvando ? 'Salvando...' : editing ? 'Salvar' : 'Editar'}</Text></TouchableOpacity></View>
      <View style={{marginBottom:14,gap:9}}>
       <Text style={styles.fieldLabel}>Foto de perfil</Text>
       <TouchableOpacity accessibilityRole="button" accessibilityLabel="Escolher foto de perfil" onPress={()=>void selecionarImagem('foto')} style={{flexDirection:'row',alignItems:'center',gap:12,padding:10,borderWidth:1,borderRadius:12,borderColor:'#D6E2F4'}}>
        {foto?.uri||fotoAtual?<Image source={{uri:foto?.uri||fotoAtual||''}} style={{width:56,height:56,borderRadius:28}}/>:<Ionicons name="person-circle-outline" size={45} color="#426DA9"/>}
        <Text style={{color:'#19437D',fontWeight:'700'}}>Alterar foto de perfil</Text>
       </TouchableOpacity>
       <Text style={styles.fieldLabel}>Imagem de capa</Text>
       <TouchableOpacity accessibilityRole="button" accessibilityLabel="Escolher imagem de capa" onPress={()=>void selecionarImagem('capa')} style={{minHeight:96,borderRadius:12,borderWidth:1,borderColor:'#D6E2F4',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
        {capa?.uri||capaAtual?<Image source={{uri:capa?.uri||capaAtual||''}} style={{width:'100%',height:115}} resizeMode="cover"/>:<Ionicons name="image-outline" size={36} color="#426DA9"/>}
       </TouchableOpacity>
       <Text style={styles.tinyMuted}>JPG, PNG ou WebP. Limite de 5 MB por imagem.</Text>
       <Text style={styles.fieldLabel}>Visibilidade online</Text>
       <TouchableOpacity accessibilityRole="button" onPress={()=>setVisibilidade(v=>v==='visivel'?'oculto':'visivel')} style={{padding:12,backgroundColor:'#EDF3FC',borderRadius:10,flexDirection:'row',gap:8,alignItems:'center'}}>
        <Ionicons name={visibilidade==='visivel'?'eye-outline':'eye-off-outline'} size={18} color="#1D4F96"/>
        <Text style={{color:'#1D4F96',fontWeight:'700'}}>{visibilidade==='visivel'?'Mostrar quando estou online':'Ocultar presença online'}</Text>
       </TouchableOpacity>
      </View>
      {editing ? <><Field label="Nome Completo" value={name} onChangeText={setName} placeholder="Nome" /><Field label="Email" value={email} onChangeText={setEmail} placeholder="Email" /></> : <><Text style={styles.fieldLabel}>Nome Completo</Text><Text style={styles.infoBox}>{usuario.nm_usuario}</Text><Text style={styles.fieldLabel}>Email</Text><Text style={styles.infoBox}>{usuario.email_usuario}</Text></>}
      <Text style={styles.fieldLabel}>Tipo de Usuário</Text><Text style={styles.infoBox}>{usuario.tp_usuario}</Text>
      <Text style={styles.tinyMuted}>Membro desde {formatarData(usuario.dt_usuario)}</Text>
    </View>
    <View style={{marginTop:12}}><Button title={salvando?'Salvando...':'Salvar foto, capa e visibilidade'} onPress={()=>void salvar(true)} /></View>
    <View style={styles.dangerCard}><View style={styles.sectionTitleRow}><AlertTriangle size={17} color="#B42318" /><Text style={styles.dangerText}>Zona de Perigo</Text></View><Button title="Excluir Conta" icon={Trash2} danger onPress={confirmarExclusao} /></View>
  </View>;
}

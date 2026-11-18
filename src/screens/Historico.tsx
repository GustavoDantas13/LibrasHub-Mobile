import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import Text from '../components/AppText';
import * as Speech from 'expo-speech';
import { useVideoPlayer, VideoView } from 'expo-video';
import { criarUrlArquivo } from '../api/api';
import { excluirTraducao, listarTraducoes } from '../api/traducao';
import { COLORS } from '../constants/colors';
import { RegistroHistorico } from '../types';
import ScreenTitle from '../components/ScreenTitle';
import { Camera, ChevronDown, Trash2, Upload, Volume2 } from '../components/Icons';
import { styles } from '../styles/styles';

function formatarData(valor: string) {
  const data = new Date(valor.replace(' ', 'T'));
  return Number.isNaN(data.getTime()) ? valor : data.toLocaleString('pt-BR');
}

function nomeArquivo(caminho: string | null) {
  if (!caminho) return 'Não disponível';
  return caminho.replace(/\\/g, '/').split('/').pop() || caminho;
}

function tipoMidia(caminho: string | null): 'video' | 'imagem' | null {
  const extensao = caminho?.split('.').pop()?.toLowerCase();
  if (extensao && ['mp4', 'avi', 'mov', 'mkv'].includes(extensao)) return 'video';
  if (extensao && ['jpg', 'jpeg', 'png', 'webp'].includes(extensao)) return 'imagem';
  return null;
}

function VideoHistorico({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri);
  return <VideoView player={player} style={localStyles.media} nativeControls contentFit="contain" />;
}

function Detalhes({ item }: { item: RegistroHistorico }) {
  const texto = item.texto_resultado || item.nm_gesto || 'Sem resultado';
  const metodo = item.url_arquivo ? 'Upload' : 'Câmera';
  const midia = tipoMidia(item.url_arquivo);
  const uri = item.url_arquivo ? criarUrlArquivo(item.url_arquivo) : null;

  function ouvir() {
    Speech.stop();
    Speech.speak(texto, { language: 'pt-BR', rate: 1 });
  }

  return (
    <View style={localStyles.detailBox}>
      {uri && midia === 'imagem' && <Image source={{ uri }} style={localStyles.media} resizeMode="contain" />}
      {uri && midia === 'video' && <VideoHistorico uri={uri} />}

      <View style={localStyles.detailTitleRow}>
        <Text style={localStyles.detailTitle}>Detalhes da tradução</Text>
        <TouchableOpacity onPress={ouvir} accessibilityLabel="Ouvir tradução" style={localStyles.voiceButton}>
          <Volume2 size={19} color={COLORS.primary} />
          <Text style={localStyles.voiceText}>Ouvir</Text>
        </TouchableOpacity>
      </View>

      <Text style={localStyles.translation}>{texto}</Text>
      <DetailRow label="Data" value={formatarData(item.criado_em)} />
      <DetailRow label="Origem" value={metodo} />
      <DetailRow label="Gesto" value={item.nm_gesto || 'Não associado'} />
      <DetailRow label="Arquivo" value={nomeArquivo(item.url_arquivo)} />
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return <View style={localStyles.detailRow}><Text style={localStyles.detailLabel}>{label}</Text><Text style={localStyles.detailValue}>{value}</Text></View>;
}

export default function Historico() {
  const [items, setItems] = useState<RegistroHistorico[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [selecionado, setSelecionado] = useState<number | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try { setItems((await listarTraducoes()).historico); }
    catch (error) { Alert.alert('Erro ao carregar histórico', error instanceof Error ? error.message : 'Tente novamente.'); }
    finally { setCarregando(false); }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  function confirmarExclusao(item: RegistroHistorico) {
    Alert.alert('Excluir tradução', 'Deseja remover este registro do histórico?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        try {
          await excluirTraducao(item.id_historico);
          setItems((atuais) => atuais.filter((x) => x.id_historico !== item.id_historico));
          if (selecionado === item.id_historico) setSelecionado(null);
        } catch (error) {
          Alert.alert('Erro ao excluir', error instanceof Error ? error.message : 'Tente novamente.');
        }
      } },
    ]);
  }

  return <View>
    <ScreenTitle title="Histórico" subtitle="Toque em uma tradução para visualizar os detalhes." />
    {carregando ? <ActivityIndicator color={COLORS.primary} /> : items.length === 0 ? <Text style={styles.centerMuted}>Nenhuma tradução ainda</Text> : items.map((item) => {
      const aberto = selecionado === item.id_historico;
      const MethodIcon = item.url_arquivo ? Upload : Camera;
      const metodo = item.url_arquivo ? 'Upload' : 'Câmera';
      return <View key={item.id_historico} style={[localStyles.itemShell, aberto && localStyles.itemSelected]}>
        <TouchableOpacity activeOpacity={0.75} onPress={() => setSelecionado(aberto ? null : item.id_historico)} style={styles.historyRow}>
          <View style={styles.historyIcon}><MethodIcon size={17} color={COLORS.primary} /></View>
          <View style={{ flex: 1 }}><Text style={styles.cardHeading}>{item.texto_resultado || item.nm_gesto || 'Sem resultado'}</Text><Text style={styles.tinyMuted}>{formatarData(item.criado_em)} · {metodo}</Text></View>
          <TouchableOpacity onPress={(event) => { event.stopPropagation(); confirmarExclusao(item); }} style={styles.deleteIcon} accessibilityLabel="Excluir tradução"><Trash2 size={17} color="#7B8495" /></TouchableOpacity>
          <ChevronDown size={18} color={COLORS.primary} style={{ transform: [{ rotate: aberto ? '180deg' : '0deg' }] }} />
        </TouchableOpacity>
        {aberto && <Detalhes item={item} />}
      </View>;
    })}
  </View>;
}

const localStyles = StyleSheet.create({
  itemShell: { marginBottom: 9, borderRadius: 16 },
  itemSelected: { borderWidth: 2, borderColor: COLORS.primary, backgroundColor: '#F7F9FF' },
  detailBox: { marginTop: -10, padding: 14, paddingTop: 18, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: '#FFFFFF', borderBottomLeftRadius: 14, borderBottomRightRadius: 14 },
  media: { width: '100%', height: 220, backgroundColor: '#071020', borderRadius: 13, marginBottom: 14 },
  detailTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  detailTitle: { flex: 1, color: COLORS.text, fontSize: 16, fontWeight: '900' },
  voiceButton: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: '#CCD5EB', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10 },
  voiceText: { color: COLORS.primary, fontWeight: '800', fontSize: 12 },
  translation: { color: COLORS.primary, fontSize: 19, lineHeight: 27, fontWeight: '800', paddingVertical: 14 },
  detailRow: { flexDirection: 'row', gap: 12, paddingVertical: 9, borderTopWidth: 1, borderTopColor: '#EDF0F4' },
  detailLabel: { width: 65, color: COLORS.muted, fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  detailValue: { flex: 1, color: COLORS.text, fontSize: 13, fontWeight: '600' },
});

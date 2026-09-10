import React, { useState } from 'react';
import { Alert, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Speech from 'expo-speech';
import Text from '../components/AppText';
import Button from '../components/Button';
import ScreenTitle from '../components/ScreenTitle';
import { CheckCircle, FileVideo, ImageIcon, Trash2, Upload, Volume2 } from '../components/Icons';
import { analisarMidias, MidiaSelecionada, ResultadoMidia } from '../api/traducao';
import { styles } from '../styles/styles';

function tipoMidia(asset: ImagePicker.ImagePickerAsset) {
  if (asset.mimeType) return asset.mimeType;
  return asset.type === 'video' ? 'video/mp4' : 'image/jpeg';
}

export default function UploadPage() {
  const [files, setFiles] = useState<MidiaSelecionada[]>([]);
  const [loading, setLoading] = useState(false);
  const [resultados, setResultados] = useState<ResultadoMidia[]>([]);
  const [frase, setFrase] = useState('');

  const pick = async () => {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert('Permissão necessária', 'Permita o acesso às fotos e vídeos para selecionar arquivos.');
      return;
    }
    const selecao = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!selecao.canceled) {
      setFiles(selecao.assets.map((asset, indice) => ({
        uri: asset.uri,
        nome: asset.fileName || `midia_${indice + 1}.${asset.type === 'video' ? 'mp4' : 'jpg'}`,
        tipo: tipoMidia(asset),
        tamanho: asset.fileSize,
      })));
      setResultados([]);
      setFrase('');
    }
  };

  const translate = async () => {
    setLoading(true);
    try {
      const resposta = await analisarMidias(files);
      setResultados(resposta.resultados || []);
      setFrase(resposta.frase || '');
      if (!resposta.resultados?.length) Alert.alert('Sem resultado', 'Nenhuma tradução foi retornada.');
    } catch (error: any) {
      Alert.alert('Erro na tradução', error?.message || 'Não foi possível processar os arquivos.');
    } finally { setLoading(false); }
  };

  const limpar = () => { setFiles([]); setResultados([]); setFrase(''); Speech.stop(); };

  return <View>
    <ScreenTitle title="Upload" subtitle="Envie imagens ou vídeos para tradução" />
    <TouchableOpacity onPress={pick} disabled={loading} style={styles.uploadBox}>
      {files.length ? <CheckCircle size={42} color="#16A34A" /> : <View style={styles.fileIcons}><FileVideo size={34} color="#7B8495" /><ImageIcon size={34} color="#7B8495" /></View>}
      <Text style={styles.cardHeading}>{files.length ? `${files.length} arquivo(s) selecionado(s)` : 'Toque para selecionar arquivos'}</Text>
      <Text style={styles.muted}>JPG, JPEG, PNG, WEBP, MP4, AVI, MOV e MKV</Text>
    </TouchableOpacity>
    {files.map((arquivo, indice) => <View key={`${arquivo.uri}-${indice}`} style={styles.selectedFileRow}>
      {arquivo.tipo.startsWith('video/') ? <FileVideo size={20} color="#7B8495" /> : <ImageIcon size={20} color="#7B8495" />}
      <View style={{ flex: 1 }}><Text style={styles.cardHeading} numberOfLines={1}>{arquivo.nome}</Text>{arquivo.tamanho ? <Text style={styles.tinyMuted}>{(arquivo.tamanho / 1024 / 1024).toFixed(2)} MB</Text> : null}</View>
      <TouchableOpacity disabled={loading} onPress={() => setFiles((atuais) => atuais.filter((_, i) => i !== indice))}><Trash2 size={18} color="#B42318" /></TouchableOpacity>
    </View>)}
    {files.length > 0 && <View style={styles.row}>
      <View style={{ flex: 1 }}><Button title={loading ? 'Processando...' : 'Traduzir arquivos'} icon={Upload} disabled={loading} onPress={translate} /></View>
      <TouchableOpacity disabled={loading} onPress={limpar} style={styles.squareButton}><Trash2 size={17} /><Text style={styles.squareButtonText}>Limpar</Text></TouchableOpacity>
    </View>}
    {resultados.length > 0 && <View style={[styles.card, { marginTop: 12 }]}>
      <Text style={styles.fieldLabel}>Resultados</Text>
      {resultados.map((item, indice) => <View key={`${item.arquivo}-${indice}`} style={styles.translationResultRow}>
        <Text style={styles.tinyMuted} numberOfLines={1}>{item.arquivo || files[indice]?.nome || `Arquivo ${indice + 1}`}</Text>
        <Text style={[styles.resultText, item.valido === false && { color: '#B42318' }]}>{item.gesto || item.erro || 'Não reconhecido'}{Number.isFinite(Number(item.confianca)) ? ` (${Number(item.confianca).toFixed(2)}%)` : ''}</Text>
      </View>)}
    </View>}
    {frase ? <View style={[styles.card, { marginTop: 12 }]}><Text style={styles.fieldLabel}>Frase completa</Text><Text style={styles.resultText}>{frase}</Text><Button title="Ouvir frase" icon={Volume2} secondary onPress={() => Speech.speak(frase, { language: 'pt-BR' })} /></View> : null}
  </View>;
}

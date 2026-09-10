import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import * as Speech from 'expo-speech';
import Text from '../components/AppText';
import Button from '../components/Button';
import ScreenTitle from '../components/ScreenTitle';
import { Camera, Trash2, Volume2 } from '../components/Icons';
import { COLORS } from '../constants/colors';
import { enviarFrame, limparTraducao, RespostaFrame } from '../api/traducao';
import { styles } from '../styles/styles';

const INTERVALO_CAPTURA_MS = 600;

export default function Reader() {
  const cameraRef = useRef<CameraView>(null);
  const sessaoRef = useRef(`mobile-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ativoRef = useRef(false);
  const enviandoRef = useRef(false);
  const cameraProntaRef = useRef(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [active, setActive] = useState(false);
  const [facing, setFacing] = useState<CameraType>('front');
  const [palavra, setPalavra] = useState('–');
  const [frase, setFrase] = useState('');
  const [status, setStatus] = useState('Câmera inativa');
  const [maoDetectada, setMaoDetectada] = useState(false);
  const [processando, setProcessando] = useState(false);

  const tratarResposta = useCallback((dados: RespostaFrame) => {
    switch (dados.status) {
      case 'analisando':
        if (dados.gesto) setPalavra(dados.gesto);
        if (dados.texto?.trim()) setFrase(dados.texto);
        setStatus(dados.confirmacao ? `Gesto detectado (${dados.confirmacao})` : 'Gesto detectado');
        setMaoDetectada(true);
        break;
      case 'traduzido':
        if (dados.gesto) setPalavra(dados.gesto);
        if (dados.texto?.trim()) setFrase(dados.texto);
        setStatus('Gesto reconhecido');
        setMaoDetectada(true);
        break;
      case 'invalido':
        setPalavra('Gesto inválido');
        setStatus(Number.isFinite(Number(dados.confianca)) ? `Gesto inválido (${Number(dados.confianca).toFixed(2)}%)` : 'Gesto inválido');
        setMaoDetectada(false);
        break;
      case 'aguardando':
        setPalavra('–');
        setStatus('Nenhuma mão detectada');
        setMaoDetectada(false);
        break;
      case 'erro':
        setStatus(dados.error || dados.mensagem || 'Erro na tradução');
        setMaoDetectada(false);
        break;
    }
  }, []);

  const capturarRef = useRef<() => Promise<void>>(async () => {});
  const agendarCaptura = useCallback(() => {
    if (!ativoRef.current) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      void capturarRef.current();
    }, INTERVALO_CAPTURA_MS);
  }, []);

  capturarRef.current = async () => {
    if (!ativoRef.current || enviandoRef.current || !cameraRef.current || !cameraProntaRef.current) {
      agendarCaptura();
      return;
    }
    enviandoRef.current = true;
    setProcessando(true);
    try {
      const foto = await cameraRef.current.takePictureAsync({ quality: 0.55 });
      if (foto?.uri && ativoRef.current) tratarResposta(await enviarFrame(foto.uri, sessaoRef.current));
    } catch (error: any) {
      if (ativoRef.current) setStatus(error?.message || 'Erro de comunicação com a tradução.');
    } finally {
      enviandoRef.current = false;
      setProcessando(false);
      agendarCaptura();
    }
  };

  const parar = useCallback(() => {
    ativoRef.current = false;
    setActive(false);
    setProcessando(false);
    setStatus('Câmera inativa');
    setMaoDetectada(false);
    cameraProntaRef.current = false;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  useEffect(() => () => {
    ativoRef.current = false;
    if (timerRef.current) clearTimeout(timerRef.current);
    Speech.stop();
    void limparTraducao(sessaoRef.current).catch(() => {});
  }, []);

  const iniciar = async () => {
    let permitido = permission?.granted;
    if (!permitido) permitido = (await requestPermission()).granted;
    if (!permitido) {
      Alert.alert('Permissão necessária', 'Permita o acesso à câmera para realizar a tradução.');
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    cameraProntaRef.current = false;
    ativoRef.current = true;
    setActive(true);
    setStatus('Iniciando câmera...');
  };

  const limpar = async () => {
    setPalavra('–');
    setFrase('');
    setMaoDetectada(false);
    try { await limparTraducao(sessaoRef.current); }
    catch (error: any) { Alert.alert('Não foi possível limpar', error?.message || 'Tente novamente.'); }
  };

  return <View>
    <ScreenTitle title="Leitor" subtitle="Traduza gestos LIBRAS em tempo real" />
    <View style={styles.cameraBox}>
      {permission?.granted
        ? <CameraView
            ref={cameraRef}
            style={styles.cameraPreview}
            facing={facing}
            mirror={facing === 'front'}
            active={active}
            onCameraReady={() => {
              cameraProntaRef.current = true;
              setStatus('Aguardando gesto...');

              if (ativoRef.current && !timerRef.current) {
                timerRef.current = setTimeout(() => {
                  timerRef.current = null;
                  void capturarRef.current();
                }, 350);
              }
            }}
            onMountError={(erro) => {
              cameraProntaRef.current = false;
              console.error('Erro ao abrir a câmera:', erro);
              setStatus(erro.message || 'Não foi possível abrir a câmera.');
            }}
          />
        : <><Camera size={58} color="rgba(255,255,255,0.35)" /><Text style={styles.cameraText}>Autorize a câmera para começar</Text></>}
      {active && <View style={styles.recDot} />}
      {processando && <ActivityIndicator style={styles.cameraLoading} color="#fff" />}
    </View>
    <View style={styles.cameraStatusRow}>
      <View style={[styles.statusDot, active && styles.statusDotOn]} /><Text style={styles.tinyMuted}>{active ? 'Câmera ativa' : 'Câmera inativa'}</Text>
      <View style={[styles.statusDot, maoDetectada && styles.statusDotOn]} /><Text style={styles.tinyMuted}>{status}</Text>
    </View>
    <View style={styles.row}>
      <View style={{ flex: 1 }}><Button title={active ? 'Parar Câmera' : 'Iniciar Câmera'} icon={Camera} danger={active} onPress={active ? parar : iniciar} /></View>
      <TouchableOpacity onPress={() => {
        cameraProntaRef.current = false;
        setFacing((atual) => atual === 'front' ? 'back' : 'front');
      }} style={styles.squareButton}><Camera size={17} color={COLORS.text} /><Text style={styles.squareButtonText}>Alternar</Text></TouchableOpacity>
      <TouchableOpacity onPress={limpar} style={styles.squareButton}><Trash2 size={17} color={COLORS.text} /><Text style={styles.squareButtonText}>Limpar</Text></TouchableOpacity>
    </View>
    <View style={[styles.card, { marginTop: 12 }]}><Text style={styles.fieldLabel}>Palavra atual</Text><Text style={styles.currentWord}>{palavra}</Text></View>
    <View style={[styles.card, { marginTop: 12 }]}>
      <Text style={styles.fieldLabel}>Frase completa</Text><Text style={styles.resultText}>{frase || 'A tradução aparecerá aqui.'}</Text>
      <Button title="Ouvir frase" icon={Volume2} secondary disabled={!frase} onPress={() => Speech.speak(frase, { language: 'pt-BR' })} />
    </View>
  </View>;
}

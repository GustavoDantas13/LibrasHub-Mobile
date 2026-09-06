import React, { useState } from 'react';
import { Alert, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import Text from '../components/AppText';
import { COLORS } from '../constants/colors';
import { INITIAL_HISTORY, MOCK_USER } from '../constants/data';
import { FontSize, Page } from '../types';
import AuthLayout from '../components/AuthLayout';
import Button from '../components/Button';
import Field from '../components/Field';
import Logo from '../components/Logo';
import ScreenTitle from '../components/ScreenTitle';
import SettingSwitch from '../components/SettingSwitch';
import Stat from '../components/Stat';
import { AlertTriangle, ArrowRight, Camera, CheckCircle, ChevronDown, Clock, Eye, FileVideo, Heart, HelpCircle, ImageIcon, LogOut, Mail, Search, Send, Settings, Sparkles, Trash2, Upload, User, UserPlus } from '../components/Icons';
import { styles } from '../styles/styles';
export default function UploadPage() {
  const [file, setFile] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const pick = () => setFile('video-libras.mp4');
  const translate = () => { setLoading(true); setTimeout(() => { setLoading(false); setResult('Olá, bom dia, como vai você?'); }, 1200); };
  return <View>
    <ScreenTitle title="Upload" subtitle="Envie um arquivo para tradução" />
    <TouchableOpacity onPress={pick} style={styles.uploadBox}>
      {file ? <CheckCircle size={42} color="#16A34A" /> : <View style={styles.fileIcons}><FileVideo size={34} color="#7B8495" /><ImageIcon size={34} color="#7B8495" /></View>}
      <Text style={styles.cardHeading}>{file || 'Toque para selecionar um arquivo'}</Text>
      <Text style={styles.muted}>JPG, PNG, MP4, AVI, MOV</Text>
    </TouchableOpacity>
    {file && <Button title={loading ? 'Processando...' : 'Traduzir Arquivo'} icon={Upload} disabled={loading} onPress={translate} />}
    {result ? <View style={[styles.card, { marginTop: 12 }]}><Text style={styles.fieldLabel}>Resultado</Text><Text style={styles.resultText}>{result}</Text></View> : null}
  </View>;
}



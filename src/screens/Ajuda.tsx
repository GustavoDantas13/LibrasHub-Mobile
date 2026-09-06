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
export default function HelpPage() {
  const [open, setOpen] = useState<number | null>(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [sent, setSent] = useState(false);
  const faqs = [
    ['Como usar a câmera?', "Acesse 'Leitor', toque em 'Iniciar Câmera' e mantenha as mãos dentro do enquadramento."],
    ['Como enviar vídeos?', "Vá até 'Upload', selecione o arquivo e toque em 'Traduzir Arquivo'."],
    ['Problemas com a câmera?', 'Verifique a permissão de câmera nas configurações do celular.'],
    ['Quais formatos são suportados?', 'Imagens JPG/PNG e vídeos MP4/AVI/MOV.'],
  ];
  return <View>
    <ScreenTitle title="Ajuda" subtitle="Encontre respostas rápidas ou entre em contato." />
    <View style={styles.card}>
      <View style={styles.sectionTitleRow}><HelpCircle size={17} color={COLORS.primary} /><Text style={styles.cardHeading}>Perguntas Frequentes</Text></View>
      {faqs.map(([q, a], i) => <TouchableOpacity key={q} onPress={() => setOpen(open === i ? null : i)} style={styles.faq}>
        <View style={styles.rowBetween}><Text style={[styles.cardHeading, { flex: 1 }]}>{q}</Text><ChevronDown size={17} color="#7B8495" style={{ transform: [{ rotate: open === i ? '180deg' : '0deg' }] }} /></View>
        {open === i && <Text style={[styles.muted, { marginTop: 8 }]}>{a}</Text>}
      </TouchableOpacity>)}
    </View>
    <View style={[styles.card, { marginTop: 12 }]}><Text style={styles.cardHeading}>Dicas de precisão</Text><Text style={styles.muted}>• Use boa iluminação{`\n`}• Mantenha as mãos bem visíveis{`\n`}• Faça gestos claros e pausados{`\n`}• Evite deixar a câmera muito longe</Text></View>
    <View style={[styles.card, { marginTop: 12 }]}>
      <View style={styles.sectionTitleRow}><Mail size={17} color={COLORS.primary} /><Text style={styles.cardHeading}>Entre em contato</Text></View>
      {sent ? <View style={styles.sentWrap}><CheckCircle size={38} color="#16A34A" /><Text style={styles.success}>Mensagem enviada!</Text></View> : <>
        <Field label="Nome" value={nome} onChangeText={setNome} placeholder="Seu nome" />
        <Field label="Email" value={email} onChangeText={setEmail} placeholder="seuemail@exemplo.com" />
        <Field label="Mensagem" value={msg} onChangeText={setMsg} placeholder="Descreva sua dúvida..." multiline />
        <Button title="Enviar Mensagem" icon={Send} onPress={() => setSent(true)} />
      </>}
    </View>
  </View>;
}



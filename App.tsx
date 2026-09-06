import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StatusBar, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import IconButton from './src/components/IconButton';
import Logo from './src/components/Logo';
import { Clock, Eye, HelpCircle, Menu, Settings, Share2, Upload, User } from './src/components/Icons';
import { COLORS } from './src/constants/colors';
import Ajuda from './src/screens/Ajuda';
import Cadastro from './src/screens/Cadastro';
import Configuracoes from './src/screens/Configuracoes';
import EsqueciSenha from './src/screens/EsqueciSenha';
import Historico from './src/screens/Historico';
import Landing from './src/screens/Landing';
import Leitor from './src/screens/Leitor';
import Login from './src/screens/Login';
import Perfil from './src/screens/Perfil';
import Social from './src/screens/Social';
import UploadPage from './src/screens/Upload';
import { styles } from './src/styles/styles';
import { FontSize, IconType, Page } from './src/types';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import Text from './src/components/AppText';

const NAV: { page: Page; label: string; icon: IconType }[] = [
  { page: 'social', label: 'Social', icon: Share2 }, { page: 'leitor', label: 'Leitor', icon: Eye },
  { page: 'upload', label: 'Upload', icon: Upload }, { page: 'historico', label: 'Histórico', icon: Clock },
];
function MainApp() {
  const insets = useSafeAreaInsets();
  const { usuario, carregando } = useAuth();
  const [page, setPage] = useState<Page>('landing');
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>('normal');
  const [highContrast, setHighContrast] = useState(false);

  const theme = useMemo(() => ({
    bg: darkMode ? '#0A101C' : COLORS.bg,
  }), [darkMode, highContrast]);

  useEffect(() => {
    const paginasPublicas: Page[] = ['landing', 'login', 'cadastro', 'esqueci-senha'];
    if (!carregando && usuario && paginasPublicas.includes(page)) setPage('social');
    if (!carregando && !usuario && !paginasPublicas.includes(page)) setPage('landing');
  }, [usuario, carregando, page]);

  if (carregando) {
    return <View style={[styles.app, { alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.navy }]}><ActivityIndicator color={COLORS.yellow} size="large" /></View>;
  }

  if (page === 'landing') return <Landing setPage={setPage} />;
  if (page === 'login') return <Login setPage={setPage} />;
  if (page === 'cadastro') return <Cadastro setPage={setPage} />;
  if (page === 'esqueci-senha') return <EsqueciSenha setPage={setPage} />;

  const content = (() => {
    switch (page) {
      case 'social': return <Social />;
      case 'leitor': return <Leitor />;
      case 'upload': return <UploadPage />;
      case 'historico': return <Historico />;
      case 'ajuda': return <Ajuda />;
      case 'perfil': return <Perfil setPage={setPage} />;
      case 'configuracoes': return <Configuracoes darkMode={darkMode} setDarkMode={setDarkMode} fontSize={fontSize} setFontSize={setFontSize} highContrast={highContrast} setHighContrast={setHighContrast} />;
      default: return <Social />;
    }
  })();

  const menuItems = [
    ...NAV,
    { page: 'ajuda' as Page, label: 'Ajuda', icon: HelpCircle },
    { page: 'configuracoes' as Page, label: 'Configurações', icon: Settings },
    { page: 'perfil' as Page, label: 'Usuário', icon: User },
  ];

  return (
    <View style={[styles.app, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy} />

      <SafeAreaView edges={['top']} style={styles.topSafeArea}>
        <View style={styles.header}>
          <IconButton icon={Menu} onPress={() => setMenuOpen(!menuOpen)} />
          <Logo dark />
          <TouchableOpacity onPress={() => setPage('perfil')} style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>{usuario?.nm_usuario.charAt(0).toUpperCase() ?? '?'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {menuOpen && <>
        <TouchableOpacity activeOpacity={1} onPress={() => setMenuOpen(false)} style={styles.menuOverlay} />
        <View style={[styles.menu, { paddingTop: insets.top + 18, paddingBottom: Math.max(insets.bottom, 16) }]}>
          <Logo dark />
          <Text style={styles.menuSubtitle}>Comunicação, tradução e comunidade em um só lugar.</Text>
          {menuItems.map((n) => {
            const Icon = n.icon;
            const active = page === n.page;
            return <TouchableOpacity key={n.page} onPress={() => { setPage(n.page); setMenuOpen(false); }} style={[styles.menuItem, active && styles.menuItemActive]}>
              <View style={[styles.menuIconBox, active && styles.menuIconBoxActive]}><Icon size={18} color={active ? COLORS.primary : '#fff'} strokeWidth={2} /></View>
              <Text style={[styles.menuItemText, active && styles.menuItemTextActive]}>{n.label}</Text>
            </TouchableOpacity>;
          })}
        </View>
      </>}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.content, { paddingBottom: 96 + insets.bottom }]}
        keyboardShouldPersistTaps="handled"
      >
        {content}
      </ScrollView>

      <View style={[styles.bottomNav, { bottom: Math.max(insets.bottom, 8) }]}>
        {NAV.map((n) => {
          const Icon = n.icon;
          const active = page === n.page;
          return <TouchableOpacity key={n.page} onPress={() => setPage(n.page)} style={[styles.navItem, active && styles.navItemActive]}>
            <Icon size={19} color={active ? COLORS.primary : '#A8B2C2'} strokeWidth={2} />
            <Text style={[styles.navLabel, active && styles.navLabelActive]}>{n.label}</Text>
          </TouchableOpacity>;
        })}
      </View>
    </View>
  );
}


export default function App() {
  return <SafeAreaProvider><AuthProvider><MainApp /></AuthProvider></SafeAreaProvider>;
}

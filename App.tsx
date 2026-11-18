import { View, TouchableOpacity } from './src/components/AccessiblePrimitives';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StatusBar, RefreshControl, Modal } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import IconButton from './src/components/IconButton';
import Logo from './src/components/Logo';
import { Clock, Eye, HelpCircle, Location, Mail, Menu, Settings, Share2, Upload, User, UserPlus, People } from './src/components/Icons';
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
import EditarPerfil from './src/screens/EditarPerfil';
import Locais from './src/screens/Locais';
import GerenciarComunidade from './src/screens/GerenciarComunidade';
import Social, { SocialSection, PostCard } from './src/screens/Social';
import NotificationBridge from './src/components/NotificationBridge';
import UploadPage from './src/screens/Upload';
import { styles } from './src/styles/styles';
import { IconType, Page } from './src/types';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import Text from './src/components/AppText';
import { arquivoWeb, obterPostPorId, Post } from './src/api/mobileSocial';
import { ehUsuarioComunitario } from './src/utils/usuario';
import { useAccessibilityPreferences } from './src/accessibility/preferences';
import { useFontSizePreference } from './src/accessibility/fontPreference';

const READER_NAV: { page: Page; label: string; icon: IconType }[] = [
  { page: 'leitor', label: 'Leitor', icon: Eye },
  { page: 'upload', label: 'Upload', icon: Upload },
  { page: 'historico', label: 'Histórico', icon: Clock },
];

const SOCIAL_NAV: { section: SocialSection; label: string; icon: IconType }[] = [
  { section: 'feed', label: 'Social', icon: People },
  { section: 'comunidades', label: 'Comunidades', icon: UserPlus },
  { section: 'chat', label: 'Chat', icon: Mail },
];

function MainApp() {
  const insets = useSafeAreaInsets();
  const { usuario, carregando } = useAuth();
  const [page, setPage] = useState<Page>('landing');
  const [profileTarget,setProfileTarget]=useState<number|null>(null);
  const [profileReturn,setProfileReturn]=useState<Page>('social');
  const openUserProfile=(id:number)=>{if(page!=='perfil')setProfileReturn(page);setProfileTarget(id);setPage('perfil')};
  const openOwnProfile=()=>{setProfileReturn(page);setProfileTarget(null);setPage('perfil')};
  const [socialSection, setSocialSection] = useState<SocialSection>('feed');
  const [notificationChatId,setNotificationChatId]=useState(0);
  const [notificationPostId,setNotificationPostId]=useState(0);
  const [notificationPost,setNotificationPost]=useState<Post|null>(null);
  const [notificationPostError,setNotificationPostError]=useState('');
  const [notificationPostLoading,setNotificationPostLoading]=useState(false);
  const loadNotificationPost=useCallback(async(id:number)=>{
    setNotificationPostLoading(true);
    try {
      const result=await obterPostPorId(id);
      setNotificationPost(result.post);
      setNotificationPostError('');
    }catch(e){setNotificationPost(null);setNotificationPostError(e instanceof Error?e.message:'Publicação indisponível.');}
    finally{setNotificationPostLoading(false)}
  },[]);
  const openNotificationPost=useCallback((id:number)=>{
    if(id<=0)return;
    setNotificationPostId(id);
    setNotificationPost(null);
    void loadNotificationPost(id);
  },[loadNotificationPost]);
  const openNotificationChat=useCallback((id:number)=>{setNotificationChatId(id);setPage('social');setSocialSection('chat');},[]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [feedScrolled, setFeedScrolled] = useState(false);
  const [postOpenSignal, setPostOpenSignal] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const [refreshVersion,setRefreshVersion] = useState(0);
  const [refreshing,setRefreshing] = useState(false);
  const refreshCurrent = () => {
    setRefreshing(true);
    setRefreshVersion(v=>v+1);
    scrollRef.current?.scrollTo({y:0,animated:true});
    setFeedScrolled(false);
    setTimeout(()=>setRefreshing(false),650);
  };
  const navigateReader = (target: Page) => {
    if (page === target) refreshCurrent();
    else {setPage(target);scrollRef.current?.scrollTo({y:0,animated:false});}
  };
  const navigateSocial = (target: SocialSection) => {
    if (page === 'social' && socialSection === target) refreshCurrent();
    else {setPage('social');setSocialSection(target);setFeedScrolled(false);scrollRef.current?.scrollTo({y:0,animated:false});}
  };
  const { darkMode, highContrast, setDarkMode, setHighContrast } = useAccessibilityPreferences();
  const { fontSize, setFontSize } = useFontSizePreference();

  const theme = useMemo(() => ({
    bg: highContrast ? (darkMode ? '#000000' : '#FFFFFF') : darkMode ? '#0A101C' : COLORS.bg,
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
      case 'social': return <Social openChatId={notificationChatId} refreshSignal={refreshVersion} section={socialSection} onGerenciarComunidade={() => setPage('gerenciar-comunidade')} onOpenChat={() => setSocialSection('chat')} openPostSignal={postOpenSignal} onOpenProfile={openUserProfile} />;
      case 'leitor': return <Leitor key={`leitor-${refreshVersion}`} />;
      case 'upload': return <UploadPage key={`upload-${refreshVersion}`} />;
      case 'historico': return <Historico key={`historico-${refreshVersion}`} />;
      case 'ajuda': return <Ajuda key={`ajuda-${refreshVersion}`} />;
      case 'perfil': return <Perfil key={`perfil-${refreshVersion}`} setPage={setPage} userId={profileTarget} onBack={()=>{setPage(profileReturn);setProfileTarget(null)}} onOpenProfile={openUserProfile} />;
      case 'editar-perfil': return <EditarPerfil setPage={setPage} />;
      case 'configuracoes': return <Configuracoes key={`configuracoes-${refreshVersion}`} darkMode={darkMode} setDarkMode={setDarkMode} fontSize={fontSize} setFontSize={setFontSize} highContrast={highContrast} setHighContrast={setHighContrast} />;
      case 'locais': return <Locais key={`locais-${refreshVersion}`} />;
      case 'gerenciar-comunidade': return <Social refreshSignal={refreshVersion} section="comunidades" onGerenciarComunidade={() => setPage('gerenciar-comunidade')} onOpenChat={() => {setPage('social');setSocialSection('chat')}} onOpenProfile={openUserProfile} />;
      default: return <Social section="feed" onGerenciarComunidade={() => setPage('gerenciar-comunidade')} onOpenChat={() => setSocialSection('chat')} />;
    }
  })();

  const menuItems: { page: Page; label: string; icon: IconType }[] = [
    { page: 'social', label: 'Social', icon: People },
    { page: 'leitor', label: 'Leitor', icon: Eye },
    { page: 'locais', label: 'Locais', icon: Location },
    { page: 'ajuda', label: 'Ajuda', icon: HelpCircle },
    { page: 'configuracoes', label: 'Configurações', icon: Settings },
    { page: 'perfil', label: 'Perfil', icon: User },
  ];

  const readerPages: Page[] = ['leitor', 'upload', 'historico'];
  const readerSectionOpen = readerPages.includes(page);

  return (
    <View style={[styles.app, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy} />
      <NotificationBridge onOpenChat={openNotificationChat} onOpenPost={openNotificationPost} />
      <Modal visible={notificationPostId>0} animationType="slide" onRequestClose={()=>setNotificationPostId(0)}>
        <SafeAreaView style={{flex:1,backgroundColor:darkMode?'#0A101C':'#F3F6FC'}}>
          <View style={{flexDirection:'row',alignItems:'center',paddingHorizontal:16,paddingVertical:12,justifyContent:'space-between',borderBottomWidth:1,borderColor:darkMode?'#44516B':'#DCE4F0'}}>
            <Text style={{fontSize:18,fontWeight:'700'}}>Publicação</Text>
            <TouchableOpacity accessibilityLabel="Fechar publicação" accessibilityRole="button" onPress={()=>setNotificationPostId(0)} style={{padding:8}}><Ionicons name="close" size={27} color={darkMode?'#FFFFFF':'#233454'}/></TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{padding:14,paddingBottom:40}}>
            {notificationPostLoading&&<ActivityIndicator size="large" color={COLORS.primary}/>} 
            {!!notificationPostError&&<Text style={{padding:18,color:'#BC3434'}}>{notificationPostError}</Text>}
            {notificationPost&&<PostCard key={notificationPost.id_post} post={{...notificationPost,__current_user:Number(usuario?.id_usuario||0)} as Post} own={Number(notificationPost.id_usuario)===Number(usuario?.id_usuario)} refresh={()=>void loadNotificationPost(notificationPost.id_post)} onOpenProfile={(id)=>{setNotificationPostId(0);openUserProfile(id)}}/>}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <SafeAreaView edges={['top']} style={styles.topSafeArea}>
        <View style={styles.header}>
          <IconButton icon={Menu} onPress={() => setMenuOpen(!menuOpen)} />
          <Logo dark />
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Abrir perfil" onPress={openOwnProfile} style={styles.headerAvatar}>
            {arquivoWeb(usuario?.foto_perfil)?<Image source={{uri:arquivoWeb(usuario?.foto_perfil)!}} style={{width:'100%',height:'100%',borderRadius:100}}/>:<Text style={styles.headerAvatarText}>{usuario?.nm_usuario.charAt(0).toUpperCase() ?? '?'}</Text>}
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
            const active = n.page === 'leitor' ? readerSectionOpen : page === n.page;
            return <TouchableOpacity accessibilityRole="button" accessibilityLabel={n.label} key={n.page} onPress={() => {
              if(n.page==='social') navigateSocial('feed');
              else if(n.page==='perfil') {if(page==='perfil')refreshCurrent();else openOwnProfile();}
              else if(page===n.page)refreshCurrent();else {setPage(n.page);scrollRef.current?.scrollTo({y:0,animated:false});}
              setMenuOpen(false);
            }} style={[styles.menuItem, active && styles.menuItemActive]}>
              <View style={[styles.menuIconBox, active && styles.menuIconBoxActive]}><Icon size={18} color={active ? COLORS.primary : '#fff'} strokeWidth={2} /></View>
              <Text style={[styles.menuItemText, active && styles.menuItemTextActive]}>{n.label}</Text>
            </TouchableOpacity>;
          })}
        </View>
      </>}

      {page === 'social' && (socialSection === 'chat' || socialSection === 'comunidades') ? (
        <View style={{ flex: 1, paddingBottom: 76 + Math.max(insets.bottom, 8) }}>{content}</View>
      ) : (
        <ScrollView
          ref={scrollRef}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshCurrent} tintColor={COLORS.primary} />}
          style={{ flex: 1 }}
          contentContainerStyle={[styles.content, { paddingBottom: 96 + insets.bottom }]}
          keyboardShouldPersistTaps="handled"
          scrollEventThrottle={80}
          onScroll={page === 'social' && socialSection === 'feed' ? (event) => {const y=event.nativeEvent.contentOffset.y;setFeedScrolled(prev=>prev=== (y>175)?prev:y>175);} : undefined}
        >
          {content}
        </ScrollView>
      )}

      {page === 'social' && socialSection === 'feed' && feedScrolled && !menuOpen && (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Criar publicação"
          onPress={() => setPostOpenSignal(n => n + 1)}
          activeOpacity={0.88}
          style={{position:'absolute',right:22,bottom:104+Math.max(insets.bottom,8),width:58,height:58,borderRadius:29,backgroundColor:COLORS.primary,alignItems:'center',justifyContent:'center',elevation:8,shadowColor:'#000',shadowOpacity:0.23,shadowRadius:8,shadowOffset:{width:0,height:4}}}
        >
          <Ionicons name="add" size={32} color="#fff" />
        </TouchableOpacity>
      )}

      {readerSectionOpen && <View style={[styles.bottomNav, { bottom: Math.max(insets.bottom, 8) }]}>
        {READER_NAV.map((n) => {
          const Icon = n.icon;
          const active = page === n.page;
          return <TouchableOpacity accessibilityRole="button" accessibilityLabel={n.label} accessibilityState={{ selected: active }} key={n.page} onPress={() => navigateReader(n.page)} style={[styles.navItem, active && styles.navItemActive]}>
            <Icon size={19} color={active ? COLORS.primary : '#A8B2C2'} strokeWidth={2} />
            <Text style={[styles.navLabel, active && styles.navLabelActive]}>{n.label}</Text>
          </TouchableOpacity>;
        })}
      </View>}

      {page === 'social' && <View style={[styles.bottomNav, { bottom: Math.max(insets.bottom, 8) }]}>
        {SOCIAL_NAV.map((n) => {
          const Icon = n.icon;
          const active = socialSection === n.section;
          return <TouchableOpacity accessibilityRole="button" accessibilityLabel={n.label} accessibilityState={{ selected: active }} key={n.section} onPress={() => navigateSocial(n.section)} style={[styles.navItem, active && styles.navItemActive]}>
            <Icon size={19} color={active ? COLORS.primary : '#A8B2C2'} strokeWidth={2} />
            <Text style={[styles.navLabel, active && styles.navLabelActive]}>{n.label}</Text>
          </TouchableOpacity>;
        })}
      </View>}
    </View>
  );
}

export default function App() {
  return <SafeAreaProvider><AuthProvider><MainApp /></AuthProvider></SafeAreaProvider>;
}

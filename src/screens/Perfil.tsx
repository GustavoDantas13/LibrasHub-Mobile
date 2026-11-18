import { View, TouchableOpacity } from '../components/AccessiblePrimitives';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, RefreshControl, ScrollView } from 'react-native';
import Ionicons from '../components/AccessibleIonicons';
import Text from '../components/AppText';
import { COLORS } from '../constants/colors';
import { useAuth } from '../contexts/AuthContext';
import { Page } from '../types';
import { PostCard, DenunciaModal, DenunciaAlvo } from './Social';
import { arquivoWeb, obterPerfilSocial, Post, PerfilSocial, seguir } from '../api/mobileSocial';

const azul = '#152958';
const muted = '#64748B';
const card = {backgroundColor:'#FFFFFF',borderRadius:18,borderColor:'#E2E9F5',borderWidth:1} as const;
function formatDate(value?:string|null) {
 if (!value) return '—';
 const date = new Date(value.replace(' ','T'));
 return Number.isNaN(date.getTime()) ? value.slice(0,10) : date.toLocaleDateString('pt-BR');
}
function Stat({value,label}:{value:number;label:string}) {
 return <View style={{alignItems:'center',flex:1,paddingVertical:12}}><Text style={{fontSize:21,fontWeight:'800',color:azul}}>{value}</Text><Text style={{fontSize:12,color:muted}}>{label}</Text></View>;
}
export default function Perfil({setPage,userId,onBack,onOpenProfile}:{setPage:(page:Page)=>void;userId?:number|null;onBack?:()=>void;onOpenProfile?:(id:number)=>void}) {
 const {usuario} = useAuth();
 const targetId = Number(userId || usuario?.id_usuario || 0);
 const isOwner = targetId === Number(usuario?.id_usuario || 0);
 const [following,setFollowing]=useState<boolean|null>(null);
 const [data,setData] = useState<PerfilSocial|null>(null);
 const [loading,setLoading] = useState(true);
 const [refreshing,setRefreshing] = useState(false);
 const [error,setError] = useState('');
 const [denunciaAlvo,setDenunciaAlvo] = useState<DenunciaAlvo|null>(null);
 const load = useCallback(async (silent=false)=>{
   if(!usuario)return;
   if(silent)setRefreshing(true);else setLoading(true);
   setError('');
   try {const value=await obterPerfilSocial(targetId);setData(value);setFollowing(Boolean(value.is_following));}
   catch(e){setError(e instanceof Error ? e.message : 'Não foi possível carregar o perfil.');}
   finally{setLoading(false);setRefreshing(false);}
 },[targetId]);
 useEffect(()=>{void load();},[load]);
 const profile=data?.profile;
 const posts=data?.posts||[];
 const photo=arquivoWeb(profile?.foto_perfil);
 const banner=arquivoWeb(profile?.banner_perfil);
 const initials=(profile?.nm_usuario||(isOwner?usuario?.nm_usuario:undefined)||'U').slice(0,1).toUpperCase();
 if(!usuario)return null;
 return <View style={{gap:14,paddingBottom:24}}>
  <DenunciaModal alvo={denunciaAlvo} onClose={()=>setDenunciaAlvo(null)}/>
  <View style={{flexDirection:'row',alignItems:'center',gap:12,marginBottom:2}}>
   <TouchableOpacity accessibilityRole="button" accessibilityLabel="Voltar ao Social" onPress={()=>onBack ? onBack() : setPage('social')} style={{width:44,height:44,justifyContent:'center',alignItems:'center',backgroundColor:'#fff',borderRadius:22,borderWidth:1,borderColor:'#DCE5F3'}}><Ionicons name="arrow-back" size={23} color={azul}/></TouchableOpacity>
   <View style={{flex:1}}><Text style={{fontSize:20,fontWeight:'800',color:azul}}>{isOwner?'Meu perfil':'Perfil'}</Text><Text style={{color:muted,fontSize:12}}>{posts.length} {posts.length===1?'publicação':'publicações'}</Text></View>
   {!isOwner&&!!data?.profile&&<TouchableOpacity accessibilityRole="button" accessibilityLabel="Denunciar este usuário" onPress={()=>setDenunciaAlvo({tipo:'usuario',id:targetId,titulo:profile?.nm_usuario||'Usuário'})} style={{flexDirection:'row',alignItems:'center',gap:5,padding:9,borderRadius:12,borderWidth:1,borderColor:'#D7A4A4'}}><Ionicons name="flag-outline" size={19} color="#B42318"/><Text style={{color:'#B42318',fontSize:12,fontWeight:'700'}}>Denunciar</Text></TouchableOpacity>}
   <TouchableOpacity accessibilityRole="button" accessibilityLabel="Atualizar perfil" onPress={()=>void load(true)} style={{padding:10}}><Ionicons name="refresh-outline" size={23} color={azul}/></TouchableOpacity>
  </View>
  {loading && <ActivityIndicator size="large" color={COLORS.primary}/>}
  {!!error && <View style={[card,{padding:16,gap:10}]}><Text style={{color:'#B42318'}}>{error}</Text><TouchableOpacity onPress={()=>void load()}><Text style={{color:COLORS.primary,fontWeight:'800'}}>Tentar novamente</Text></TouchableOpacity></View>}
  <View style={[card,{overflow:'hidden'}]}>
   <View style={{height:134,backgroundColor:'#142D63',overflow:'hidden'}}>{banner && <Image source={{uri:banner}} style={{height:'100%',width:'100%'}} resizeMode="cover"/>}</View>
   <View style={{paddingHorizontal:16,paddingBottom:18}}>
    <View style={{height:58,flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start'}}>
     <View style={{width:88,height:88,marginTop:-40,borderRadius:44,borderWidth:4,borderColor:'#fff',backgroundColor:'#DCEBFF',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
       {photo?<Image source={{uri:photo}} style={{width:'100%',height:'100%'}}/>:<Text style={{fontSize:33,fontWeight:'800',color:COLORS.primary}}>{initials}</Text>}
     </View>
     {isOwner ? <TouchableOpacity accessibilityRole="button" accessibilityLabel="Editar perfil" onPress={()=>setPage('editar-perfil')} style={{marginTop:10,borderRadius:22,paddingVertical:10,paddingHorizontal:15,borderWidth:1,borderColor:'#B7CCE9',flexDirection:'row',alignItems:'center',gap:7}}><Ionicons name="create-outline" size={17} color={azul}/><Text style={{color:azul,fontWeight:'800',fontSize:13}}>Editar perfil</Text></TouchableOpacity> : <TouchableOpacity accessibilityRole="button" accessibilityLabel="Seguir ou deixar de seguir" onPress={async()=>{try{const r=await seguir(targetId);setFollowing(r.following);await load(true)}catch(e){setError(e instanceof Error?e.message:"Não foi possível seguir.")}}} style={{marginTop:10,borderRadius:22,paddingVertical:10,paddingHorizontal:15,backgroundColor:COLORS.primary}}><Text style={{color:"#fff",fontWeight:"800"}}>{following===true?"Seguindo":following===false?"Seguir":"Seguir"}</Text></TouchableOpacity>}
    </View>
    <Text style={{fontSize:23,fontWeight:'800',color:azul,marginTop:4}}>{profile?.nm_usuario||(isOwner?usuario.nm_usuario:'Perfil')}</Text>
    <Text style={{color:COLORS.primary,fontSize:14,fontWeight:'700',marginTop:3}}>@{profile?.social_handle||'u'+targetId}</Text>
    <Text style={{color:muted,fontSize:13,marginTop:5}}>{profile?.tp_usuario||(isOwner?usuario.tp_usuario:'')}</Text>
    <View style={{flexDirection:'row',alignItems:'center',gap:6,marginTop:12}}><Ionicons name="ellipse" size={9} color={profile?.online?'#15935D':'#8390A8'}/><Text style={{color:muted,fontSize:13}}>{profile?.online?'Online':'Offline'}</Text></View>
    <View style={{flexDirection:'row',gap:6,alignItems:'center',marginTop:7}}><Ionicons name="calendar-outline" size={16} color={muted}/><Text style={{color:muted,fontSize:13}}>Membro desde {formatDate(profile?.dt_usuario||(isOwner?usuario.dt_usuario:undefined))}</Text></View>
    <View style={{flexDirection:'row',marginTop:15,borderTopWidth:1,borderColor:'#EEF2F8'}}>
     <Stat value={Number(data?.followers||0)} label="Seguidores"/><Stat value={Number(data?.following||0)} label="Seguindo"/><Stat value={posts.length} label="Publicações"/>
    </View>
   </View>
  </View>
  <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:3,marginTop:4,marginBottom:2}}><Text style={{fontSize:19,fontWeight:'800',color:azul}}>Publicações</Text><Text style={{fontSize:12,color:muted}}>Mais recentes primeiro</Text></View>
  {!loading && !error && posts.length===0 && <View style={[card,{padding:24,alignItems:'center',gap:9}]}><Ionicons name="chatbubble-ellipses-outline" size={32} color={COLORS.primary}/><Text style={{fontWeight:'800',color:azul}}>Nenhuma publicação visível</Text><Text style={{textAlign:'center',color:muted}}>As publicações visíveis aparecerão aqui.</Text></View>}
  {posts.map(post=><PostCard key={post.id_post} post={{...post,__current_user:usuario.id_usuario} as Post} own={Number(post.id_usuario)===Number(usuario.id_usuario)} refresh={()=>void load(true)} onOpenProfile={onOpenProfile}/>)}
 </View>;
}

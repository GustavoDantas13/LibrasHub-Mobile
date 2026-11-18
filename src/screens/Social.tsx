import { useAccessibilityPreferences } from '../accessibility/preferences';
import { View, TouchableOpacity, TextInput } from '../components/AccessiblePrimitives';
import React,{useCallback,useEffect,useRef,useState} from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Modal, Platform, Linking, ScrollView, Share, RefreshControl, useWindowDimensions } from 'react-native';
import Ionicons from '../components/AccessibleIonicons';
import * as ImagePicker from 'expo-image-picker';
import { File, Paths } from 'expo-file-system';
import { StorageAccessFramework, writeAsStringAsync, EncodingType } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { VideoView, useVideoPlayer } from 'expo-video';
import Text from '../components/AppText';
import ScreenTitle from '../components/ScreenTitle';
import {COLORS} from '../constants/colors';
import {styles} from '../styles/styles';
import {useAuth} from '../contexts/AuthContext';
import {ehUsuarioComunitario} from '../utils/usuario';
import {Post,Comentario,Pessoa,Comunidade,Chat,Mensagem,arquivoWeb,listarFeed,publicar,editarPost,excluirPost,curtirPost,comentariosPost,comentar,editarComentario,excluirComentario,curtirComentario,denunciar,buscarPessoas,seguir,listarComunidadesReais,criarComunidadeReal,entrarComunidade,sairComunidade,membrosComunidade,acaoMembro,adicionarMembroReal,listarChats,iniciarPrivado,listarMensagensReais,enviarMensagemReal,editarMensagemReal,Membro,alterarRelacao,consultarRelacao,ArquivoPost,listarBloqueados} from '../api/mobileSocial';
export type SocialSection='feed'|'comunidades'|'chat';
type Props={section:SocialSection;onGerenciarComunidade:()=>void;onOpenChat:()=>void;openPostSignal?:number;refreshSignal?:number;openChatId?:number;onOpenProfile?:(id:number)=>void};
const message=(e:unknown)=>e instanceof Error?e.message:'Não foi possível concluir a operação.';
const stamp=(date:string)=>date?date.slice(0,16).replace('T',' '):'';
const styles2={line:{flexDirection:'row' as const,alignItems:'center' as const,gap:8,flexWrap:'wrap' as const},box:{backgroundColor:'#fff',borderRadius:16,padding:15,marginBottom:12,borderWidth:1,borderColor:'#E0E6F2'},button:{backgroundColor:COLORS.primary,paddingVertical:10,paddingHorizontal:13,borderRadius:10,alignItems:'center' as const,marginVertical:4},secondary:{paddingVertical:8,paddingHorizontal:12,borderRadius:10,backgroundColor:'#EDF3FC',marginVertical:4},input:{borderWidth:1,borderColor:'#B9C9E3',borderRadius:10,padding:11,backgroundColor:'#fff',color:'#14213D',marginVertical:7},muted:{color:'#65738C',fontSize:13},heading:{fontSize:17,fontWeight:'800' as const,color:'#112656'},buttonText:{color:'#fff',fontWeight:'700' as const}};
function Button({title,onPress,sub=false,disabled=false}:{title:string;onPress:()=>void;sub?:boolean;disabled?:boolean}){return <TouchableOpacity accessibilityRole="button" disabled={disabled} onPress={onPress} style={[sub?styles2.secondary:styles2.button,disabled&&{opacity:.5}]}><Text style={sub?{color:COLORS.primary,fontWeight:'700'}:styles2.buttonText}>{title}</Text></TouchableOpacity>}
function PostActionIcon({icon,label,onPress,color=COLORS.primary,count,disabled=false}:{icon:React.ComponentProps<typeof Ionicons>['name'];label:string;onPress:()=>void;color?:string;count?:number;disabled?:boolean}){return <TouchableOpacity accessibilityRole="button" accessibilityLabel={label} accessibilityHint={label} disabled={disabled} onPress={onPress} style={{minWidth:43,minHeight:43,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:5,paddingHorizontal:8,marginVertical:3,borderRadius:12,backgroundColor:'#EDF3FC',opacity:disabled?.5:1}}><Ionicons name={icon} size={20} color={color}/>{count!==undefined&&<Text style={{fontSize:13,fontWeight:'700',color}}>{count}</Text>}</TouchableOpacity>}

type Confirmation={title:string;description:string;confirmLabel:string;onConfirm:()=>void};
function ConfirmModal({value,onClose,working=false}:{value:Confirmation|null;onClose:()=>void;working?:boolean}){
 const {darkMode}=useAccessibilityPreferences();
 const fg=darkMode?'#F5F8FF':'#172D50';
 return <Modal visible={!!value} transparent animationType="fade" onRequestClose={onClose}>
  <View style={{flex:1,backgroundColor:'rgba(0,0,0,.55)',justifyContent:'center',padding:22}}>
   <View style={{borderRadius:20,padding:20,gap:14,backgroundColor:darkMode?'#1A263C':'#FFFFFF',borderWidth:1,borderColor:darkMode?'#647A9D':'#D7E0EF'}}>
    <View style={{flexDirection:'row',alignItems:'center',gap:10}}><Ionicons name="alert-circle-outline" size={25} color="#C64A42"/><Text style={{color:fg,fontSize:19,fontWeight:'800',flex:1}}>{value?.title}</Text></View>
    <Text style={{color:fg,fontSize:15,lineHeight:22}}>{value?.description}</Text>
    <View style={{flexDirection:'row',gap:10,justifyContent:'flex-end'}}>
     <TouchableOpacity accessibilityRole="button" disabled={working} onPress={onClose} style={{padding:12,borderRadius:12,backgroundColor:darkMode?'#30415F':'#E8EFF8'}}><Text style={{color:fg,fontWeight:'700'}}>Cancelar</Text></TouchableOpacity>
     <TouchableOpacity accessibilityRole="button" disabled={working} onPress={()=>{const action=value?.onConfirm;onClose();action?.()}} style={{padding:12,borderRadius:12,backgroundColor:'#B83035',opacity:working?.55:1}}><Text style={{color:'#FFFFFF',fontWeight:'800'}}>{value?.confirmLabel||'Confirmar'}</Text></TouchableOpacity>
    </View>
   </View>
  </View>
 </Modal>;
}
/** Faz uma cópia privada de cada arquivo selecionado; URIs temporárias de provedores Android
 * podem perder READ permission antes que expo/fetch leia o multipart. */
async function selecionarArquivosParaCache(maximo:number):Promise<ArquivoPost[]> {
 const escolha=await File.pickFileAsync({multipleFiles:true});
 if(escolha.canceled)return [];
 const selecionados:ArquivoPost[]=[];
 for(const [indice,origem] of escolha.result.entries()) {
  if(indice>=maximo)break;
  const nome=origem.name||`arquivo-${indice}`;
  const destino=new File(Paths.cache,`librashub-${Date.now()}-${indice}-${nome.replace(/[^a-zA-Z0-9._-]/g,'_')}`);
  try {
   await origem.copy(destino);
   selecionados.push({uri:destino.uri,fileName:nome,mimeType:origem.type||'application/octet-stream',size:destino.size||0});
  } catch(e) {
   throw new Error(`Não foi possível copiar ${nome} para o cache. Selecione o arquivo novamente. ${message(e)}`);
  }
 }
 return selecionados;
}

export type DenunciaAlvo = { tipo:'post'|'comentario'|'usuario'|'comunidade'|'local'; id:number; titulo:string };
const MOTIVOS_DENUNCIA = [
 {id:'spam',label:'Spam ou conteúdo repetitivo',description:'Divulgação abusiva, fraude ou conteúdo repetido.'},
 {id:'odio',label:'Discurso de ódio',description:'Ataque a pessoas ou grupos com base em características protegidas.'},
 {id:'assedio',label:'Assédio ou intimidação',description:'Ameaças, perseguição, humilhação ou ataques direcionados.'},
 {id:'violencia',label:'Violência ou ameaça',description:'Ameaça de agressão, incentivo à violência ou conteúdo perigoso.'},
 {id:'conteudo_improprio',label:'Conteúdo impróprio',description:'Conteúdo sexual, gráfico ou inadequado para a plataforma.'},
 {id:'outro',label:'Outro motivo',description:'Descreva a situação no campo de detalhes.'},
] as const;
export function DenunciaModal({alvo,onClose,onSuccess}:{alvo:DenunciaAlvo|null;onClose:()=>void;onSuccess?:()=>void}) {
 const {darkMode}=useAccessibilityPreferences();
 const [motivo,setMotivo]=useState('');
 const [detalhes,setDetalhes]=useState('');
 const [enviando,setEnviando]=useState(false);
 const [evidencias,setEvidencias]=useState<ArquivoPost[]>([]);
 const close=()=>{if(enviando)return;setMotivo('');setDetalhes('');setEvidencias([]);onClose()};
 const enviar=async()=>{
  if(!alvo||!motivo||enviando||motivo==='outro'&&detalhes.trim().length<10)return;
  setEnviando(true);
  try {await denunciar(alvo.tipo,alvo.id,motivo,detalhes.trim(),evidencias);closeAfterSuccess();}
  catch(e){Alert.alert('Não foi possível denunciar',message(e));}
  finally{setEnviando(false)}
 };
 const closeAfterSuccess=()=>{setMotivo('');setDetalhes('');setEvidencias([]);onClose();onSuccess?.();Alert.alert('Denúncia enviada','Sua denúncia foi encaminhada para análise.');};
 return <Modal visible={!!alvo} animationType="slide" presentationStyle="pageSheet" onRequestClose={close}>
  <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={{flex:1,backgroundColor:darkMode?'#111827':'#FFFFFF'}}>
   <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',padding:18,borderBottomWidth:1,borderBottomColor:darkMode?'#475569':'#E2E8F0'}}>
    <View style={{flexDirection:'row',alignItems:'center',gap:9,flex:1}}><Ionicons name="flag-outline" size={23} color={darkMode?'#F8FAFC':'#142B61'}/><View style={{flex:1}}><Text style={{fontSize:19,fontWeight:'800',color:darkMode?'#FFFFFF':'#142B61'}}>Fazer denúncia</Text><Text numberOfLines={1} style={{fontSize:12,color:darkMode?'#D4DEEF':'#64748B'}}>{alvo?.titulo||''}</Text></View></View>
    <TouchableOpacity accessibilityRole="button" accessibilityLabel="Fechar denúncia" onPress={close} style={{padding:8}}><Ionicons name="close" size={25} color={darkMode?'#FFFFFF':'#142B61'}/></TouchableOpacity>
   </View>
   <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{padding:18,paddingBottom:32}}>
    <Text style={{color:darkMode?'#E2E8F0':'#334155',marginBottom:16}}>A denúncia será enviada à moderação. O conteúdo denunciado não verá quem enviou a denúncia.</Text>
    <Text style={{fontWeight:'800',fontSize:16,color:darkMode?'#FFFFFF':'#142B61',marginBottom:10}}>O que aconteceu?</Text>
    {MOTIVOS_DENUNCIA.map(m=><TouchableOpacity key={m.id} accessibilityRole="radio" accessibilityState={{checked:motivo===m.id}} onPress={()=>setMotivo(m.id)} style={{flexDirection:'row',alignItems:'center',gap:12,padding:14,marginBottom:9,borderWidth:motivo===m.id?2:1,borderColor:motivo===m.id?'#4C91FA':darkMode?'#6B7D99':'#CBD5E1',borderRadius:14,backgroundColor:darkMode?'#1E293B':'#F8FAFC'}}>
     <View style={{flex:1}}><Text style={{fontWeight:'700',color:darkMode?'#F8FAFC':'#142B61'}}>{m.label}</Text><Text style={{fontSize:12,color:darkMode?'#D4DEEF':'#64748B',marginTop:3}}>{m.description}</Text></View><Ionicons name={motivo===m.id?'radio-button-on':'radio-button-off'} size={23} color={motivo===m.id?'#4C91FA':darkMode?'#D4DEEF':'#64748B'}/>
    </TouchableOpacity>)}
    <Text style={{fontWeight:'700',color:darkMode?'#FFFFFF':'#142B61',marginTop:10}}>Detalhes {motivo==='outro'?'(obrigatório)':'(opcional)'}</Text>
    <TextInput accessibilityLabel="Detalhes da denúncia" multiline textAlignVertical="top" maxLength={1000} value={detalhes} onChangeText={setDetalhes} placeholder="Explique o que aconteceu..." style={{minHeight:110,borderWidth:1,borderColor:darkMode?'#94A3B8':'#CBD5E1',borderRadius:12,padding:12,marginTop:8,backgroundColor:darkMode?'#1E293B':'#FFFFFF',color:darkMode?'#FFFFFF':'#142B61'}}/>
    <Text style={{alignSelf:'flex-end',fontSize:12,color:darkMode?'#D4DEEF':'#64748B'}}>{detalhes.length}/1000</Text>
    {alvo?.tipo==='comunidade'&&<View style={{gap:8,marginTop:12}}><TouchableOpacity onPress={()=>void selecionarArquivosParaCache(5).then(v=>{if(v.length)setEvidencias(old=>[...old,...v].slice(0,5))}).catch(e=>Alert.alert('Não foi possível anexar',message(e)))} accessibilityLabel="Anexar provas da denúncia" style={{padding:12,borderWidth:1,borderColor:'#7D98BF',borderRadius:12}}><Text>Anexar arquivos de comprovação (até 5)</Text></TouchableOpacity>{evidencias.map((f,i)=><TouchableOpacity key={`${f.uri}-${i}`} accessibilityLabel={`Remover ${f.fileName}`} onPress={()=>setEvidencias(old=>old.filter((_,index)=>index!==i))}><Text>{f.fileName} ×</Text></TouchableOpacity>)}</View>}
    {motivo==='outro'&&detalhes.trim().length<10&&<Text style={{color:darkMode?'#FFB4B4':'#B42318',fontSize:12}}>Informe ao menos 10 caracteres para Outro motivo.</Text>}
    <TouchableOpacity accessibilityRole="button" accessibilityLabel="Enviar denúncia" disabled={!motivo||enviando||motivo==='outro'&&detalhes.trim().length<10} onPress={()=>void enviar()} style={{marginTop:20,borderRadius:14,backgroundColor:'#245FC1',padding:15,alignItems:'center',opacity:!motivo||enviando||motivo==='outro'&&detalhes.trim().length<10?.5:1}}>{enviando?<ActivityIndicator color="#fff"/>:<Text style={{color:'#FFFFFF',fontWeight:'800'}}>Enviar denúncia</Text>}</TouchableOpacity>
   </ScrollView>
  </KeyboardAvoidingView>
 </Modal>;
}

// Preserva a relação pai -> resposta recebida da API, sem depender da ordem do SELECT.
type ThreadItem={comment:Comentario;depth:number;childrenCount:number};
export function ordenarComentariosEmArvore(comments:Comentario[],collapsed:Record<number,boolean>={}):ThreadItem[]{
 const byId=new Map<number,Comentario>();
 for(const c of comments)byId.set(Number(c.id_comentario),c);
 const ordered=[...byId.values()].sort((a,b)=>Number(a.id_comentario)-Number(b.id_comentario));
 const children=new Map<number,Comentario[]>();
 const roots:Comentario[]=[];
 for(const c of ordered){
  const parentId=Number(c.id_comentario_pai||0);
  if(parentId>0&&parentId!==Number(c.id_comentario)&&byId.has(parentId)){
   const siblings=children.get(parentId)||[];siblings.push(c);children.set(parentId,siblings);
  }else roots.push(c);
 }
 const result:ThreadItem[]=[];
 const seen=new Set<number>();
 function visit(c:Comentario,depth:number){
  const id=Number(c.id_comentario);
  if(seen.has(id))return;seen.add(id);
  const replies=children.get(id)||[];
  result.push({comment:c,depth,childrenCount:replies.length});
  if(!collapsed[id])for(const reply of replies)visit(reply,depth+1);
 }
 for(const c of roots)visit(c,0);
 // Contabiliza descendentes ocultos para não reaparecerem como comentários soltos.
 const covered=new Set<number>();
 function mark(c:Comentario){
  const id=Number(c.id_comentario);
  if(covered.has(id))return;covered.add(id);
  for(const child of children.get(id)||[])mark(child);
 }
 for(const c of roots)mark(c);
 // Apenas componentes com relações circulares continuam visíveis como raízes independentes.
 for(const c of ordered)if(!covered.has(Number(c.id_comentario))){visit(c,0);mark(c);}

 return result;
}
// O player é um componente separado para manter a ordem dos hooks estável.
function VideoAmpliado({url}:{url:string}){
 const player=useVideoPlayer(url);
 return <VideoView player={player} nativeControls contentFit="contain" style={{width:'100%',height:'100%'}} />;
}

type MidiaVisual={url:string;nome:string;mime:string};
async function baixarAnexo(item:MidiaVisual){
 const original=(item.nome||'anexo').replace(/[\\/:*?"<>|\x00-\x1F]/g,'_').slice(0,120);
 const nome=`${Date.now()}-${original||'anexo'}`;
 const arquivo=await File.downloadFileAsync(item.url,new File(Paths.cache,nome));
 if(Platform.OS==='android'){
  // Android SAF grava o arquivo na pasta escolhida, sem usar a folha de compartilhamento.
  const pasta=await StorageAccessFramework.requestDirectoryPermissionsAsync();
  if(!pasta.granted)return false;
  const titulo=original.replace(/\.[^.]+$/, '')||'anexo';
  const extensao=original.match(/\.([^.]+)$/)?.[1]||'';
  const mime=item.mime||'application/octet-stream';
  const destino=await StorageAccessFramework.createFileAsync(pasta.directoryUri,extensao?titulo:original,mime);
  try{
   await writeAsStringAsync(destino,await arquivo.base64(),{encoding:EncodingType.Base64});
  }catch(e){
   // Não anuncia sucesso para gravação parcial ou interrompida.
   throw e;
  }
  return true;
 }
 // iOS: exportação pelo seletor de destino do sistema, sem alegar gravação automática.
 if(await Sharing.isAvailableAsync()){
  await Sharing.shareAsync(arquivo.uri,{dialogTitle:`Exportar ${original}`,mimeType:item.mime||'application/octet-stream',UTI:'public.data'});
  return true;
 }
 throw new Error('Não foi possível abrir o seletor de destino para o arquivo.');
}

function CarrosselAnexos({post}:{post:Post}) {
 const {width:larguraTela}=useWindowDimensions();
 const [largura,setLargura]=useState(0);
 const [indice,setIndice]=useState(0);
 const [indiceAmpliado,setIndiceAmpliado]=useState<number|null>(null);
 const modalScroll=useRef<ScrollView>(null);
 const [baixando,setBaixando]=useState(false);
 const itens=post.anexos?.length?post.anexos:post.midia_url?[{caminho:post.midia_url,nome_arquivo:'Mídia da publicação',mime_type:post.midia_tipo==='video'?'video/mp4':'image/jpeg'}]:[];
 if(!itens.length)return null;
 const pagina=Math.max(220,largura||Math.min(larguraTela-60,380));
 const icone=(mime:string)=>mime==='application/pdf'?'document-text-outline':mime.startsWith('audio/')?'musical-notes-outline':mime.startsWith('video/')?'videocam-outline':'document-attach-outline';
 const abrir=(item:MidiaVisual,i:number)=>{if(item.mime.startsWith('image/')||item.mime.startsWith('video/'))setIndiceAmpliado(i);else void baixar(item)};
 const midias=itens.map((arquivo,i)=>({url:arquivoWeb(arquivo.caminho)||'',nome:arquivo.nome_arquivo||`Arquivo ${i+1}`,mime:arquivo.mime_type||'application/octet-stream'}));
 const ampliado=indiceAmpliado===null?null:midias[indiceAmpliado];
 const baixar=async(item:MidiaVisual)=>{if(baixando)return;setBaixando(true);try{const salvo=await baixarAnexo(item);if(salvo&&Platform.OS==='android')Alert.alert('Download concluído','Arquivo salvo na pasta selecionada.');}catch(e){Alert.alert('Falha no download',message(e));}finally{setBaixando(false)}};
 return <View onLayout={event=>setLargura(event.nativeEvent.layout.width)} style={{width:'100%',marginTop:10,marginBottom:12}}>
  <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} nestedScrollEnabled accessibilityLabel={`Anexos da publicação: ${itens.length} arquivo(s)`}
   onMomentumScrollEnd={event=>setIndice(Math.min(itens.length-1,Math.max(0,Math.round(event.nativeEvent.contentOffset.x/pagina))))}>
   {itens.map((arquivo,i)=>{
    const url=arquivoWeb(arquivo.caminho);
    const mime=arquivo.mime_type||'application/octet-stream';
    const nome=arquivo.nome_arquivo||`Arquivo ${i+1}`;
    const midia=url?{url,nome,mime}:null;
    return <View key={`${arquivo.caminho}-${i}`} style={{width:pagina,paddingHorizontal:2,justifyContent:'center'}}>
     {midia&&mime.startsWith('image/')?<TouchableOpacity accessibilityRole="button" accessibilityLabel={`Ampliar ${nome}`} onPress={()=>abrir(midia,i)}>
       <Image source={{uri:url!}} resizeMode="contain" style={{width:'100%',height:220,backgroundColor:'#F0F4FB',borderRadius:12}}/>
      </TouchableOpacity>:
      <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Abrir ${nome}`} disabled={!midia} onPress={()=>midia&&abrir(midia,i)}
       style={{height:220,backgroundColor:'#EDF3FC',borderRadius:12,borderWidth:1,borderColor:'#BED0E8',alignItems:'center',justifyContent:'center',padding:20,gap:12}}>
       <Ionicons name={icone(mime)} size={44} color="#2054A4"/>
       <Text style={{textAlign:'center',fontWeight:'700',color:'#193762'}} numberOfLines={2}>{nome}</Text>
       <Text style={{color:'#42618C',fontSize:12}}>{mime.startsWith('video/')?'Toque para assistir em tela cheia':'Toque para abrir ou salvar o anexo'}</Text>
      </TouchableOpacity>}
     {!!midia&&<TouchableOpacity accessibilityRole="button" accessibilityLabel={`Baixar anexo ${nome}`} disabled={baixando} onPress={()=>void baixar(midia)} style={{alignSelf:'flex-end',paddingVertical:10,paddingHorizontal:12,flexDirection:'row',gap:7,alignItems:'center'}}>
       <Ionicons name="download-outline" size={19} color="#2054A4"/><Text style={{color:'#2054A4',fontWeight:'700'}}>{baixando?'Baixando...':'Baixar anexo'}</Text>
      </TouchableOpacity>}
    </View>;
   })}
  </ScrollView>
  {itens.length>1&&<View style={{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:7,marginTop:10}}>
   {itens.slice(0,10).map((arquivo,i)=><View key={`${arquivo.caminho}-${i}`} accessibilityLabel={`Anexo ${i+1} de ${itens.length}`} style={{width:i===indice?17:7,height:7,borderRadius:4,backgroundColor:i===indice?'#245FC1':'#AAB9D0'}}/>)}
   <Text style={{fontSize:12,color:'#4A6080',marginLeft:6}}>{indice+1}/{itens.length}</Text>
  </View>}
  <Modal visible={indiceAmpliado!==null} animationType="fade" statusBarTranslucent onRequestClose={()=>setIndiceAmpliado(null)} onShow={()=>requestAnimationFrame(()=>modalScroll.current?.scrollTo({x:(indiceAmpliado||0)*larguraTela,animated:false}))}>
   <View style={{flex:1,backgroundColor:'#05070C',paddingTop:Platform.OS==='android'?42:60}}>
    <View style={{flexDirection:'row',alignItems:'center',paddingHorizontal:15,justifyContent:'space-between',gap:12}}>
     <TouchableOpacity accessibilityRole="button" accessibilityLabel="Fechar visualização" onPress={()=>setIndiceAmpliado(null)} style={{padding:10}}><Ionicons name="close" size={28} color="#FFFFFF"/></TouchableOpacity>
     <View style={{flex:1}}>
      <Text numberOfLines={1} style={{color:'#FFFFFF',fontWeight:'700'}}>{ampliado?.nome||'Mídia'}</Text>
      <Text style={{color:'#B9C4D8',fontSize:12}}>{(indiceAmpliado??0)+1} de {midias.length} · Arraste para o lado</Text>
     </View>
     <TouchableOpacity accessibilityRole="button" accessibilityLabel="Baixar arquivo ampliado" disabled={!ampliado||baixando} onPress={()=>ampliado&&void baixar(ampliado)} style={{padding:10}}><Ionicons name="download-outline" size={25} color="#FFFFFF"/></TouchableOpacity>
    </View>
    <ScrollView ref={modalScroll} horizontal pagingEnabled nestedScrollEnabled showsHorizontalScrollIndicator={false} style={{flex:1}} onMomentumScrollEnd={event=>setIndiceAmpliado(Math.min(midias.length-1,Math.max(0,Math.round(event.nativeEvent.contentOffset.x/larguraTela))))}>
     {midias.map((arquivo,i)=><View key={`ampliado-${i}`} style={{width:larguraTela,flex:1,alignItems:'center',justifyContent:'center'}}>
      {arquivo.mime.startsWith('image/')?<Image source={{uri:arquivo.url}} resizeMode="contain" style={{width:larguraTela,height:'100%'}}/>:
       arquivo.mime.startsWith('video/')?(indiceAmpliado===i?<VideoAmpliado url={arquivo.url}/>:<Ionicons name="videocam-outline" size={55} color="#FFFFFF"/>):
       <View style={{alignItems:'center',gap:12,padding:30}}><Ionicons name="document-text-outline" size={64} color="#FFFFFF"/><Text style={{color:'#FFFFFF'}}>{arquivo.nome}</Text><Button title="Baixar este anexo" onPress={()=>void baixar(arquivo)}/></View>}
     </View>)}
    </ScrollView>
   </View>
  </Modal>
 </View>;
}

export function PostCard({post,own,refresh,onOpenProfile}:{post:Post;own:boolean;refresh:()=>void;onOpenProfile?:(id:number)=>void}){
 const {darkMode}=useAccessibilityPreferences();
 const [denunciaAlvo,setDenunciaAlvo]=useState<DenunciaAlvo|null>(null);
 const [confirmation,setConfirmation]=useState<Confirmation|null>(null);
 const [expanded,setExpanded]=useState(false),[comments,setComments]=useState<Comentario[]>([]),[text,setText]=useState(''),[edit,setEdit]=useState(false),[draft,setDraft]=useState(post.conteudo),[busy,setBusy]=useState(false),[replyComment,setReplyComment]=useState<Comentario|null>(null),[editingComment,setEditingComment]=useState<Comentario|null>(null),[commentDraft,setCommentDraft]=useState(''),[collapsedComments,setCollapsedComments]=useState<Record<number,boolean>>({});
 const fetchComments=async()=>{try{const r=await comentariosPost(post.id_post);setComments(r.comments);}catch(e){Alert.alert('Comentários',message(e));}};
 const run=async(fn:()=>Promise<unknown>)=>{setBusy(true);try{await fn();refresh();if(expanded)await fetchComments();}catch(e){Alert.alert('Não foi possível concluir',message(e));}finally{setBusy(false)}};
 return <View style={styles2.box}>
  <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Abrir perfil de ${post.nm_usuario}`} disabled={!onOpenProfile} onPress={()=>onOpenProfile?.(Number(post.id_usuario))} style={{flexDirection:'row',alignItems:'center',gap:9}}>
   <View style={{height:36,width:36,borderRadius:18,backgroundColor:'#E0EAFB',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>{arquivoWeb(post.foto_perfil)?<Image source={{uri:arquivoWeb(post.foto_perfil)!}} style={{width:36,height:36}}/>:<Ionicons name="person-outline" size={19} color={COLORS.primary}/>}</View>
   <View style={{flex:1,minWidth:0,justifyContent:'center'}}>
    <Text numberOfLines={1} style={styles2.heading}>{post.nm_usuario}</Text>
    <Text numberOfLines={1} style={styles2.muted}>{stamp(post.criado_em)}{post.comunidade_nome?' · '+post.comunidade_nome:''}</Text>
   </View>
  </TouchableOpacity>
  {!!post.conteudo&&<Text style={{fontSize:15,color:'#253650',marginVertical:10}}>{post.conteudo}</Text>}
  <CarrosselAnexos post={post}/>

  <View style={[styles2.line,{gap:5,justifyContent:'space-between'}]}>
   <Button sub title={`${Number(post.curtiu)?'♥':'♡'} ${post.total_curtidas||0}`} onPress={()=>void run(()=>curtirPost(post.id_post))}/>
   <PostActionIcon icon={expanded?'chatbubble':'chatbubble-outline'} label={`Comentários: ${post.total_comentarios||0}. ${expanded?'Ocultar':'Mostrar'} comentários`} count={Number(post.total_comentarios||0)} onPress={()=>{setExpanded(!expanded);if(!expanded)void fetchComments();}}/>
   <PostActionIcon icon="share-social-outline" label="Compartilhar publicação" onPress={()=>void Share.share({message:post.conteudo||'LibrasHub'})}/>
   {!own&&<PostActionIcon icon="flag-outline" label="Denunciar publicação" onPress={()=>setDenunciaAlvo({tipo:'post',id:post.id_post,titulo:`Publicação de ${post.nm_usuario}`})}/>}
   {own&&<PostActionIcon icon="create-outline" label="Editar publicação" onPress={()=>{setDraft(post.conteudo||'');setEdit(true)}}/>}
   {own&&<PostActionIcon icon="trash-outline" color="#B42318" label="Excluir publicação" onPress={()=>setConfirmation({title:'Excluir publicação',description:'Deseja realmente excluir esta publicação? Essa ação não poderá ser desfeita.',confirmLabel:'Excluir',onConfirm:()=>void run(()=>excluirPost(post.id_post))})}/>}
  </View>
  <Modal visible={edit} animationType="slide" presentationStyle="pageSheet" onRequestClose={()=>{if(!busy)setEdit(false)}}>
   <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={{flex:1,backgroundColor:darkMode?'#172033':'#fff'}}>
    <View style={{padding:18,borderBottomWidth:1,borderColor:'#E3EAF4',flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
     <TouchableOpacity onPress={()=>setEdit(false)} disabled={busy} accessibilityLabel="Cancelar edição"><Text style={{color:'#44536E',fontSize:16}}>Cancelar</Text></TouchableOpacity>
     <Text style={{color:'#152956',fontWeight:'800',fontSize:17}}>Editar publicação</Text>
     <TouchableOpacity accessibilityLabel="Salvar publicação" disabled={busy||(!draft.trim()&&!post.midia_url)} onPress={()=>void run(async()=>{await editarPost(post.id_post,draft.trim());setEdit(false)})} style={{paddingHorizontal:16,paddingVertical:9,borderRadius:22,backgroundColor:COLORS.primary,opacity:busy||(!draft.trim()&&!post.midia_url)?.4:1}}>
      {busy?<ActivityIndicator size="small" color="#fff"/>:<Text style={{color:'#fff',fontWeight:'800'}}>Salvar</Text>}
     </TouchableOpacity>
    </View>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{padding:20,flexGrow:1}}>
     <Text style={{fontWeight:'800',color:'#162C56',marginBottom:12}}>{post.nm_usuario}</Text>
     <TextInput accessibilityLabel="Texto da publicação" multiline autoFocus textAlignVertical="top" maxLength={4000} placeholder="O que está acontecendo?" value={draft} onChangeText={setDraft} style={{fontSize:19,minHeight:180,color:'#172B4D'}}/>
     <CarrosselAnexos post={post}/>
     <Text style={{textAlign:'right',color:'#6C7890',marginTop:12}}>{draft.length}/4000</Text>
    </ScrollView>
   </KeyboardAvoidingView>
  </Modal>
  {expanded&&<View style={{marginTop:12,borderTopWidth:1,borderColor:'#E0E6F2',paddingTop:12}}>
   {comments.length===0&&<Text style={styles2.muted}>Nenhum comentário ainda.</Text>}
   {ordenarComentariosEmArvore(comments,collapsedComments).map(({comment:c,depth,childrenCount})=>{
    const isMine=Number(c.id_usuario)===Number((post as any).__current_user);
    const parent=comments.find(other=>Number(other.id_comentario)===Number(c.id_comentario_pai));
    return <View key={c.id_comentario} style={{marginVertical:5,marginLeft:Math.min(depth,5)*11,padding:11,borderLeftWidth:depth?3:1,borderWidth:1,borderLeftColor:depth?COLORS.primary:'#E5EAF4',borderColor:'#E5EAF4',borderRadius:13,backgroundColor:depth?'#F3F7FF':'#FAFCFF'}}>
     <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Abrir perfil de ${c.nm_usuario}`} disabled={!onOpenProfile} onPress={()=>onOpenProfile?.(Number(c.id_usuario))} style={{flexDirection:'row',alignItems:'center',gap:7}}><View style={{height:30,width:30,borderRadius:15,backgroundColor:'#DFEAFB',overflow:'hidden',alignItems:'center',justifyContent:'center'}}>{arquivoWeb(c.foto_perfil)?<Image source={{uri:arquivoWeb(c.foto_perfil)!}} style={{width:30,height:30}}/>:<Ionicons name="person-outline" size={17} color={COLORS.primary}/>}</View><Text style={{fontWeight:'700',color:'#152956'}}>{c.nm_usuario}</Text></TouchableOpacity>
     {parent&&<Text style={{fontSize:12,color:'#687894',marginTop:3}}>Em resposta a {parent.nm_usuario}</Text>}
     <Text style={{color:'#243653',marginTop:5,marginBottom:7}}>{c.conteudo}</Text>
     <View style={{flexDirection:'row',alignItems:'center',flexWrap:'wrap',gap:6}}>
      <PostActionIcon icon="heart-outline" label={`Curtir comentário de ${c.nm_usuario}. ${c.total_curtidas||0} curtidas`} count={Number(c.total_curtidas||0)} disabled={busy} onPress={()=>void run(()=>curtirComentario(c.id_comentario))}/>
      <PostActionIcon icon="arrow-undo-outline" label={`Responder comentário de ${c.nm_usuario}`} disabled={busy} onPress={()=>setReplyComment(c)}/>
      <PostActionIcon icon="share-social-outline" label={`Compartilhar comentário de ${c.nm_usuario}`} onPress={()=>void Share.share({message:`${c.nm_usuario}: ${c.conteudo}`})}/>
      {isMine?<>
       <PostActionIcon icon="create-outline" label="Editar comentário" disabled={busy} onPress={()=>{setEditingComment(c);setCommentDraft(c.conteudo)}}/>
       <PostActionIcon icon="trash-outline" label="Excluir comentário" color="#B42318" disabled={busy} onPress={()=>setConfirmation({title:'Excluir comentário',description:'Deseja excluir este comentário e removê-lo da conversa?',confirmLabel:'Excluir',onConfirm:()=>void run(()=>excluirComentario(c.id_comentario))})}/>
      </>:<PostActionIcon icon="flag-outline" label="Denunciar comentário" disabled={busy} onPress={()=>setDenunciaAlvo({tipo:'comentario',id:c.id_comentario,titulo:`Comentário de ${c.nm_usuario}`})}/>}
     </View>
     {childrenCount>0&&<TouchableOpacity accessibilityRole="button" accessibilityLabel={`${collapsedComments[c.id_comentario]?'Mostrar':'Ocultar'} ${childrenCount} respostas`} onPress={()=>setCollapsedComments(v=>({...v,[c.id_comentario]:!v[c.id_comentario]}))} style={{alignSelf:'flex-start',flexDirection:'row',alignItems:'center',gap:5,marginTop:7,paddingVertical:6,paddingHorizontal:9,borderRadius:18,backgroundColor:'#E7F0FF'}}><Ionicons name={collapsedComments[c.id_comentario]?'chevron-down':'chevron-up'} size={13} color={COLORS.primary}/><Text style={{fontSize:12,color:COLORS.primary}}>{collapsedComments[c.id_comentario]?'Mostrar':'Ocultar'} {childrenCount} {childrenCount===1?'resposta':'respostas'}</Text></TouchableOpacity>}
    </View>;
   })}
   {replyComment&&<View style={{flexDirection:'row',alignItems:'center',backgroundColor:'#EDF3FC',borderRadius:10,padding:10,marginTop:8,gap:8}}><Ionicons name="arrow-undo-outline" size={18} color={COLORS.primary}/><Text style={{flex:1,color:'#385171'}} numberOfLines={1}>Respondendo a {replyComment.nm_usuario}</Text><TouchableOpacity accessibilityRole="button" accessibilityLabel="Cancelar resposta" onPress={()=>setReplyComment(null)}><Ionicons name="close-circle-outline" size={22} color="#65738C"/></TouchableOpacity></View>}
   <View style={{flexDirection:'row',alignItems:'center',gap:8,marginTop:8}}>
    <TextInput style={[styles2.input,{flex:1,marginVertical:0,maxHeight:125}]} value={text} onChangeText={setText} placeholder={replyComment?`Responder a ${replyComment.nm_usuario}`:'Escreva um comentário'} multiline maxLength={1200}/>
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={replyComment?'Enviar resposta':'Enviar comentário'} disabled={busy||!text.trim()} onPress={()=>void run(async()=>{await comentar(post.id_post,text.trim(),replyComment?.id_comentario);setText('');setReplyComment(null);})} style={{backgroundColor:COLORS.primary,borderRadius:24,width:44,height:44,alignItems:'center',justifyContent:'center',opacity:busy||!text.trim()?.5:1}}><Ionicons name="send" size={20} color="#fff"/></TouchableOpacity>
   </View>
   <Modal visible={editingComment!==null} animationType="slide" presentationStyle="pageSheet" onRequestClose={()=>{if(!busy)setEditingComment(null)}}>
    <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={{flex:1,backgroundColor:darkMode?'#172033':'#fff'}}>
     <View style={{paddingHorizontal:18,paddingVertical:16,borderBottomWidth:1,borderColor:'#E3EAF4',flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
      <TouchableOpacity disabled={busy} accessibilityLabel="Cancelar edição do comentário" onPress={()=>setEditingComment(null)}><Text style={{color:'#44536E'}}>Cancelar</Text></TouchableOpacity>
      <Text style={{fontSize:17,fontWeight:'800',color:'#152956'}}>Editar comentário</Text>
      <TouchableOpacity disabled={busy||!commentDraft.trim()} accessibilityLabel="Salvar comentário" onPress={()=>{if(editingComment)void run(async()=>{await editarComentario(editingComment.id_comentario,commentDraft.trim());setEditingComment(null)})}} style={{backgroundColor:COLORS.primary,borderRadius:20,paddingHorizontal:15,paddingVertical:9,opacity:busy||!commentDraft.trim()?.5:1}}><Text style={{color:'#fff',fontWeight:'800'}}>Salvar</Text></TouchableOpacity>
     </View>
     <TextInput autoFocus accessibilityLabel="Texto do comentário" multiline maxLength={1200} textAlignVertical="top" style={{fontSize:18,color:'#1B2D4D',margin:20,minHeight:150}} value={commentDraft} onChangeText={setCommentDraft}/>
     <Text style={{textAlign:'right',marginHorizontal:20,color:'#65738C'}}>{commentDraft.length}/1200</Text>
    </KeyboardAvoidingView>
   </Modal>
  </View>}
  <ConfirmModal value={confirmation} onClose={()=>setConfirmation(null)} working={busy}/>
  <DenunciaModal alvo={denunciaAlvo} onClose={()=>setDenunciaAlvo(null)}/>
 </View>;
}
export default function Social({section,onGerenciarComunidade,onOpenChat,openPostSignal=0,refreshSignal=0,openChatId=0,onOpenProfile}:Props){
 const {usuario}=useAuth();const uid=Number(usuario?.id_usuario||0);
 const {darkMode}=useAccessibilityPreferences();
 const {width:screenWidth}=useWindowDimensions();
 const [posts,setPosts]=useState<Post[]>([]),[mode,setMode]=useState<'public'|'following'>('public'),[loading,setLoading]=useState(false),[loadMore,setLoadMore]=useState(false),[texto,setTexto]=useState(''),[photo,setPhoto]=useState<ArquivoPost[]>([]),[publishing,setPublishing]=useState(false);
 const [search,setSearch]=useState(''),[users,setUsers]=useState<Pessoa[]>([]),[communityList,setCommunityList]=useState<Comunidade[]>([]),[canCreate,setCanCreate]=useState(false),[selected,setSelected]=useState<Comunidade|null>(null);
 const [creating,setCreating]=useState(false);const [communityPosts,setCommunityPosts]=useState<Post[]>([]),[communityText,setCommunityText]=useState(''),[communityPicture,setCommunityPicture]=useState<ArquivoPost[]>([]),[communityEdit,setCommunityEdit]=useState(false),[communityName,setCommunityName]=useState(''),[communityDesc,setCommunityDesc]=useState(''),[communityPrivate,setCommunityPrivate]=useState(false),[communityImage,setCommunityImage]=useState<ImagePicker.ImagePickerAsset|null>(null),[members,setMembers]=useState<Membro[]>([]),[memberQuery,setMemberQuery]=useState('');
 const [chats,setChats]=useState<Chat[]>([]),[activeChat,setActiveChat]=useState<Chat|null>(null),[chatMessages,setChatMessages]=useState<Mensagem[]>([]),[chatText,setChatText]=useState(''),[chatPicture,setChatPicture]=useState<ImagePicker.ImagePickerAsset|null>(null);
 const [composerTarget,setComposerTarget]=useState<'public'|number|null>(null);
 const [communityMenu,setCommunityMenu]=useState(false);
 const [communityConfirmation,setCommunityConfirmation]=useState<Confirmation|null>(null);
 const [chatMenu,setChatMenu]=useState(false);
 const [blockedOpen,setBlockedOpen]=useState(false);
 const [blockedUsers,setBlockedUsers]=useState<{id_usuario:number;nm_usuario:string;foto_perfil:string|null}[]>([]);
 const [relation,setRelation]=useState({bloqueado:false,silenciado:false});
 const [reportTarget,setReportTarget]=useState<DenunciaAlvo|null>(null);

 const [communityScrolled,setCommunityScrolled]=useState(false);
 const communityScroll=useRef<ScrollView>(null);
 const communityListScroll=useRef<ScrollView>(null);
 const conversationsScroll=useRef<ScrollView>(null);
 const composerBottom=useRef(280);
 const lastRefreshSignal=useRef(refreshSignal);
 const [pulling,setPulling]=useState(false);
 const lastPostSignal=useRef(openPostSignal);
 useEffect(()=>{if(openPostSignal!==lastPostSignal.current){lastPostSignal.current=openPostSignal;setComposerTarget('public')}},[openPostSignal]);
 const [chatScrolled,setChatScrolled]=useState(false);
 const [showJumpToEnd,setShowJumpToEnd]=useState(false);
 const [chatReady,setChatReady]=useState(false);
 const chatViewportReady=useRef(false);
 const chatInitialScrollPending=useRef(true);
 const [newChatOpen,setNewChatOpen]=useState(false);
 const [editMessage,setEditMessage]=useState<number|null>(null);const [working,setWorking]=useState(false),[error,setError]=useState('');
 const chatScroll=useRef<ScrollView>(null);
 const lastChatMessageId=useRef<number|null>(null);
 const scrollOnNewMessage=useRef(true);
 const nearChatBottom=useRef(true);
 const [replyTo,setReplyTo]=useState<Mensagem|null>(null);
 const [editMessageText,setEditMessageText]=useState('');
 const execute=async(fn:()=>Promise<unknown>,done?:()=>void)=>{setWorking(true);try{await fn();done?.();}catch(e){Alert.alert('Operação não realizada',message(e));}finally{setWorking(false)}};
 const reloadFeed=useCallback(async()=>{setLoading(true);setError('');try{setPosts((await listarFeed(mode)).posts);}catch(e){setError(message(e));}finally{setLoading(false)}},[mode]);
 const reloadCommunities=useCallback(async()=>{setLoading(true);setError('');try{const r=await listarComunidadesReais();setCommunityList(r.communities);setCanCreate(r.can_create);}catch(e){setError(message(e));}finally{setLoading(false)}},[]);
 const reloadChats=useCallback(async()=>{setLoading(true);setError('');try{setChats((await listarChats()).chats);}catch(e){setError(message(e));}finally{setLoading(false)}},[]);
 const reloadCommunityPosts=async(id:number)=>{try{setCommunityPosts((await listarFeed('public',undefined,id)).posts);}catch(e){Alert.alert('Comunidade',message(e));}};
 const pullSocial=async()=>{setPulling(true);try{if(section==='feed')await reloadFeed();else if(section==='chat'){if(activeChat)await reloadMessages(activeChat.id_chat);else await reloadChats();}else if(selected)await reloadCommunityPosts(selected.id_comunidade);else await reloadCommunities();}finally{setPulling(false)}};
 const reloadMembers=async(id:number)=>{try{setMembers((await membrosComunidade(id)).members);}catch(e){Alert.alert('Membros',message(e));}};
 const reloadMessages=useCallback(async(id:number,silent=false)=>{
  try{
   const result=await listarMensagensReais(id);
   const lastId=result.messages.length?Number(result.messages[result.messages.length-1].id_mensagem):null;
   if(lastId!==lastChatMessageId.current){
    scrollOnNewMessage.current=lastChatMessageId.current===null||nearChatBottom.current;
    lastChatMessageId.current=lastId;
   }
   setChatMessages(result.messages);
  }catch(e){if(!silent)setError(message(e));}
 },[]);
 // Repeated tap on the active navigation tab: scroll to the top and refresh
 // without remounting this screen (and losing an opened community/chat).
 useEffect(()=>{
  if(lastRefreshSignal.current===refreshSignal)return;
  lastRefreshSignal.current=refreshSignal;
  if(section==='comunidades'){
   if(selected) communityScroll.current?.scrollTo({y:0,animated:true});
   else communityListScroll.current?.scrollTo({y:0,animated:true});
   setCommunityScrolled(false);
   if(selected){void reloadCommunityPosts(selected.id_comunidade);if(communityEdit)void reloadMembers(selected.id_comunidade);}
   else void reloadCommunities();
  }else if(section==='chat'){
   if(activeChat){void reloadMessages(activeChat.id_chat);}
   else{conversationsScroll.current?.scrollTo({y:0,animated:true});setChatScrolled(false);void reloadChats();}
  }else void reloadFeed();
 },[refreshSignal]);
 useEffect(()=>{setError('');if(section==='feed')void reloadFeed();if(section==='comunidades')void reloadCommunities();if(section==='chat')void reloadChats();},[section,reloadFeed,reloadCommunities,reloadChats]);
 useEffect(()=>{
  lastChatMessageId.current=null;nearChatBottom.current=true;scrollOnNewMessage.current=false;
  chatInitialScrollPending.current=true;chatViewportReady.current=false;setChatReady(false);setShowJumpToEnd(false);
 },[activeChat?.id_chat]);
 const finalizeInitialChatScroll=()=>{
  if(!chatInitialScrollPending.current||!chatViewportReady.current||chatMessages.length===0)return;
  // Faz o scroll após o Android medir todas as mensagens; não expõe o início da conversa.
  chatScroll.current?.scrollToEnd({animated:false});
  requestAnimationFrame(()=>{
   chatScroll.current?.scrollToEnd({animated:false});
   requestAnimationFrame(()=>{
    chatScroll.current?.scrollToEnd({animated:false});
    chatInitialScrollPending.current=false;
    nearChatBottom.current=true;
    scrollOnNewMessage.current=false;
    setChatReady(true);
   });
  });
 };
 useEffect(()=>{if(!openChatId||section!=='chat')return;let active=true;
  void listarChats().then(({chats})=>{if(!active)return;const chat=chats.find(c=>Number(c.id_chat)===openChatId);if(chat){setChatReady(false);chatInitialScrollPending.current=true;setActiveChat(chat);setChatMessages([])}}).catch(()=>{});
  return()=>{active=false};
 },[openChatId,section]);
 useEffect(()=>{if(section!=='chat'||!activeChat)return;void reloadMessages(activeChat.id_chat);const timer=setInterval(()=>void reloadMessages(activeChat.id_chat,true),5000);return()=>clearInterval(timer)},[section,activeChat,reloadMessages]);
 useEffect(()=>{if(search.trim().length<2){setUsers([]);return;}let enabled=true;const timer=setTimeout(()=>{void buscarPessoas(search.trim()).then(r=>{if(enabled)setUsers(r.users)}).catch(()=>{if(enabled)setUsers([])})},350);return()=>{enabled=false;clearTimeout(timer)}},[search]);
 const choosePosts=async(setter:React.Dispatch<React.SetStateAction<ArquivoPost[]>>)=>{
  try{const anexos=await selecionarArquivosParaCache(10);if(anexos.length)setter(old=>[...old,...anexos].slice(0,10));}
  catch(e){Alert.alert('Arquivo indisponível',message(e));}
 };
 const choose=async(setter:(a:ImagePicker.ImagePickerAsset|null)=>void)=>{const result=await ImagePicker.launchImageLibraryAsync({mediaTypes:['images','videos'],quality:.8});if(!result.canceled)setter(result.assets[0]);};
 const refresh=()=>{if(selected)void reloadCommunityPosts(selected.id_comunidade);else void reloadFeed()};
 const postCard=(p:Post)=><PostCard key={p.id_post} post={{...p,__current_user:uid} as Post} own={Number(p.id_usuario)===uid} refresh={refresh} onOpenProfile={onOpenProfile}/>;
 const userSearch=<>
  <TextInput accessibilityLabel="Buscar pessoas" style={[styles2.input,{fontSize:16,minHeight:50}]} value={search} onChangeText={setSearch} placeholder="Pesquisar nome ou @usuário"/>
  {users.map(p=><View key={p.id_usuario} style={[styles2.box,{padding:14}]}>
   <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Ver perfil de ${p.nm_usuario}`} onPress={()=>onOpenProfile?.(Number(p.id_usuario))} style={{flexDirection:'row',alignItems:'center',gap:12,marginBottom:12}}>
    <View style={{width:46,height:46,borderRadius:23,overflow:'hidden',backgroundColor:'#DFEAFB',alignItems:'center',justifyContent:'center'}}>{arquivoWeb(p.foto_perfil)?<Image source={{uri:arquivoWeb(p.foto_perfil)!}} style={{width:46,height:46}}/>:<Ionicons name="person-outline" size={23} color={COLORS.primary}/>}</View>
    <View style={{flex:1,minWidth:0}}><Text numberOfLines={2} style={[styles2.heading,{flexShrink:1}]}>{p.nm_usuario}</Text><Text numberOfLines={1} style={styles2.muted}>@{p.social_handle}</Text></View>
    <Ionicons name="chevron-forward" size={19} color="#71819A"/>
   </TouchableOpacity>
   <View style={{flexDirection:'row',gap:10,flexWrap:'wrap'}}>
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Seguir ou deixar de seguir ${p.nm_usuario}`} onPress={()=>void execute(()=>seguir(p.id_usuario))} style={{flex:1,minWidth:125,borderRadius:12,padding:12,backgroundColor:'#E7EFFC',flexDirection:'row',alignItems:'center',justifyContent:'center',gap:7}}><Ionicons name="person-add-outline" size={19} color={COLORS.primary}/><Text numberOfLines={1} style={{color:COLORS.primary,fontWeight:'700'}}>Seguir / Deixar</Text></TouchableOpacity>
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Conversar com ${p.nm_usuario}`} onPress={()=>void execute(async()=>{const r=await iniciarPrivado(p.id_usuario);setChatReady(false);chatInitialScrollPending.current=true;setChatMessages([]);setActiveChat({id_chat:r.chat,tipo:'privado',titulo:p.nm_usuario,ultima_mensagem:null,outro_usuario_id:Number(p.id_usuario),foto_perfil:p.foto_perfil});setSearch('');setNewChatOpen(false);onOpenChat();})} style={{flex:1,minWidth:125,borderRadius:12,padding:12,backgroundColor:'#245FC1',flexDirection:'row',alignItems:'center',justifyContent:'center',gap:7}}><Ionicons name="chatbubble-ellipses-outline" size={19} color="#FFFFFF"/><Text numberOfLines={1} style={{color:'#FFFFFF',fontWeight:'700'}}>Conversar</Text></TouchableOpacity>
   </View>
  </View>)}
 </>;
 const composer=(community?:number)=>{
  const isOpen=composerTarget===(community??'public');
  const currentText=community?communityText:texto;
  const currentMedia=community?communityPicture:photo;
  const setCurrentText=community?setCommunityText:setTexto;
  const setCurrentMedia=community?setCommunityPicture:setPhoto;
  const close=()=>{if(!publishing)setComposerTarget(null)};
  const submit=async()=>{
   if(publishing||(!currentText.trim()&&!currentMedia.length))return;
   setPublishing(true);
   try{
    await publicar(currentText.trim(),community,currentMedia);
    setCurrentText('');setCurrentMedia([]);setComposerTarget(null);
    if(community)await reloadCommunityPosts(community);else await reloadFeed();
   }catch(e){Alert.alert('Não foi possível publicar',message(e));}
   finally{setPublishing(false)}
  };
  return <>
   <TouchableOpacity accessibilityRole="button" accessibilityLabel="Criar nova publicação" onPress={()=>setComposerTarget(community??'public')} style={{backgroundColor:'#fff',padding:16,borderRadius:18,borderWidth:1,borderColor:'#E0E6F2',marginBottom:14}}>
    <View style={{flexDirection:'row',alignItems:'center',gap:12}}>
     <View style={{width:42,height:42,borderRadius:24,backgroundColor:'#DCE9FC',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>{arquivoWeb(usuario?.foto_perfil)?<Image source={{uri:arquivoWeb(usuario?.foto_perfil)!}} style={{width:42,height:42}}/>:<Text style={{color:COLORS.primary,fontSize:20,fontWeight:'800'}}>{(usuario?.nm_usuario||'U').slice(0,1).toUpperCase()}</Text>}</View>
     <Text style={{color:'#65738C',flex:1,fontSize:15}}>O que está acontecendo?</Text>
     <Text style={{color:COLORS.primary,fontSize:22}}>＋</Text>
    </View>
    <View style={{flexDirection:'row',alignItems:'center',marginTop:12,borderTopWidth:1,borderColor:'#E8EDF6',paddingTop:10,gap:8}}><Ionicons name="images-outline" size={20} color={COLORS.primary}/><Text style={{color:COLORS.primary,fontWeight:'700'}}>Arquivos</Text><Text style={{marginLeft:'auto',color:'#65738C'}}>Publicar</Text></View>
   </TouchableOpacity>
   <Modal visible={isOpen} onRequestClose={close} animationType="slide" presentationStyle="fullScreen">
    <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={{flex:1,backgroundColor:darkMode?'#172033':'#FFFFFF'}}>
     <View style={{paddingTop:Platform.OS==='android'?38:54,paddingHorizontal:18,paddingBottom:14,borderBottomWidth:1,borderColor:'#E8EDF6',flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
      <TouchableOpacity onPress={close} disabled={publishing} accessibilityRole="button"><Text style={{color:'#2D4265',fontSize:16}}>Cancelar</Text></TouchableOpacity>
      <Text style={{fontWeight:'800',fontSize:17,color:'#14284D'}}>{community?'Publicar na comunidade':'Nova publicação'}</Text>
      <TouchableOpacity accessibilityRole="button" onPress={()=>void submit()} disabled={publishing||(!currentText.trim()&&!currentMedia.length)} style={{backgroundColor:COLORS.primary,paddingHorizontal:18,paddingVertical:9,borderRadius:20,opacity:publishing||(!currentText.trim()&&!currentMedia.length)?.45:1}}>
       {publishing?<ActivityIndicator size="small" color="#fff"/>:<Text style={{color:'#fff',fontWeight:'800'}}>Publicar</Text>}
      </TouchableOpacity>
     </View>
     <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{padding:18,flexGrow:1}}>
      <View style={{flexDirection:'row',alignItems:'flex-start',gap:12}}>
       <View style={{width:44,height:44,borderRadius:22,backgroundColor:'#DCE9FC',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>{arquivoWeb(usuario?.foto_perfil)?<Image source={{uri:arquivoWeb(usuario?.foto_perfil)!}} style={{width:44,height:44}}/>:<Text style={{color:COLORS.primary,fontWeight:'800',fontSize:20}}>{(usuario?.nm_usuario||'U').slice(0,1).toUpperCase()}</Text>}</View>
       <View style={{flex:1}}><Text style={{fontWeight:'800',fontSize:16,color:'#122B54'}}>{usuario?.nm_usuario||'Você'}</Text><Text style={{fontSize:12,color:'#65738C',marginTop:3}}>{community?'Publicação na comunidade':'Público'}</Text>
        <TextInput autoFocus multiline textAlignVertical="top" style={{fontSize:19,color:'#14213D',minHeight:160,marginTop:18,padding:0}} placeholder="O que está acontecendo?" placeholderTextColor="#8793A8" maxLength={4000} value={currentText} onChangeText={setCurrentText} accessibilityLabel="Texto da publicação"/>
        {currentMedia.length>0&&<View style={{marginTop:14,gap:9}}>{currentMedia.map((file,index)=><View key={`${file.uri}-${index}`} style={{flexDirection:'row',alignItems:'center',gap:10,padding:9,borderWidth:1,borderColor:'#A9B9D1',borderRadius:12}}>
         {file.mimeType?.startsWith('image/')?<Image source={{uri:file.uri}} style={{width:60,height:60,borderRadius:7}}/>:<Ionicons name="document-attach-outline" size={28} color="#2862A6"/>}
         <Text numberOfLines={2} style={{flex:1}}>{file.fileName||'Arquivo'}</Text><TouchableOpacity accessibilityLabel="Remover arquivo" onPress={()=>setCurrentMedia(old=>old.filter((_,i)=>i!==index))}><Ionicons name="close-circle-outline" size={25} color="#B42318"/></TouchableOpacity></View>)}</View>}
       </View>
      </View>
     </ScrollView>
     <View style={{borderTopWidth:1,borderColor:'#E8EDF6',paddingHorizontal:18,paddingVertical:12,flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingBottom:Platform.OS==='ios'?30:18}}>
      <TouchableOpacity accessibilityRole="button" disabled={publishing} onPress={()=>void choosePosts(setCurrentMedia)} style={{padding:9,flexDirection:'row',alignItems:'center',gap:10}}><Ionicons name="images-outline" size={24} color={COLORS.primary}/><Text style={{color:COLORS.primary,fontWeight:'700'}}>Adicionar mídias e arquivos</Text></TouchableOpacity>
      <Text style={{fontSize:12,color:'#65738C'}}>{currentText.length}/4000</Text>
     </View>
    </KeyboardAvoidingView>
   </Modal>
  </>;
 };
 if(section==='feed')return <View><ScreenTitle title="Social" subtitle="Publicações da comunidade LibrasHub."/>
 {composer()}{userSearch}
 <View style={{flexDirection:'row',backgroundColor:'#fff',borderRadius:15,borderWidth:1,borderColor:'#E0E6F2',marginBottom:12,overflow:'hidden'}}>
  {([['public','Para você'],['following','Seguindo']] as const).map(([tab,label])=><TouchableOpacity key={tab} accessibilityRole="tab" accessibilityState={{selected:mode===tab}} onPress={()=>setMode(tab)} style={{flex:1,alignItems:'center',paddingTop:14,paddingBottom:12,borderBottomWidth:3,borderBottomColor:mode===tab?COLORS.primary:'transparent'}}><Text style={{fontWeight:mode===tab?'800':'500',fontSize:15,color:mode===tab?'#102B58':'#65738C'}}>{label}</Text></TouchableOpacity>)}
 </View>
 {loading&&<ActivityIndicator color={COLORS.primary}/>}
 {!!error&&<Text style={{color:'#B42318'}}>{error}</Text>}{!loading&&!posts.length&&!error&&<Text style={styles2.muted}>Ainda não há publicações neste feed.</Text>}{posts.map(postCard)}
 {posts.length>=50&&<Button sub title={loadMore?'Carregando...':'Carregar mais'} onPress={()=>void execute(async()=>{setLoadMore(true);try{const r=await listarFeed(mode,posts[posts.length-1].id_post);setPosts(v=>[...v,...r.posts])}finally{setLoadMore(false)}})}/>}</View>;
 if(section==='comunidades'){
  if(selected){const joined=selected.meu_status==='ativo';const owner=Number(selected.id_criador)===uid;return <View style={{flex:1,minHeight:0}}>
  <View style={{flexShrink:0,zIndex:2,elevation:3,paddingHorizontal:10,paddingVertical:9,backgroundColor:darkMode?'#172033':'#FFFFFF',borderBottomWidth:1,borderColor:'#8795AC',flexDirection:'row',alignItems:'center',gap:10}}>
   <TouchableOpacity accessibilityRole="button" accessibilityLabel="Voltar para comunidades" onPress={()=>{setSelected(null);setCommunityEdit(false);setCreating(false);void reloadCommunities()}} style={{width:38,height:42,borderRadius:21,justifyContent:'center',alignItems:'center'}}><Ionicons name="arrow-back" size={23} color={darkMode?'#FFFFFF':'#17345E'}/></TouchableOpacity>
   {!!arquivoWeb(selected.imagem_capa)&&<Image source={{uri:arquivoWeb(selected.imagem_capa)!}} style={{width:41,height:41,borderRadius:12}}/>}
   <View style={{flex:1,minWidth:0,gap:3}}>
    <Text numberOfLines={1} style={{color:darkMode?'#FFFFFF':'#142B56',fontWeight:'800',fontSize:15}}>{selected.nome}</Text>
    <Text numberOfLines={1} style={{color:darkMode?'#CFDAED':'#536480',fontSize:11}}>{selected.descricao}</Text>
    <Text numberOfLines={1} style={{color:darkMode?'#C3D4EE':'#536480',fontSize:11}}>{selected.total_membros} membros · {selected.privada?'Privada':'Pública'} · {joined?'Membro':selected.meu_status==='pendente'?'Pendente':'Visitante'}</Text>
   </View>
   <TouchableOpacity accessibilityRole="button" accessibilityLabel="Opções da comunidade" onPress={()=>setCommunityMenu(true)} style={{width:38,height:42,alignItems:'center',justifyContent:'center'}}><Ionicons name="ellipsis-vertical" size={25} color={darkMode?'#F4F8FF':'#142B61'}/></TouchableOpacity>
  </View>
  {!joined&&<View style={{paddingHorizontal:14,paddingTop:10}}><Button title={selected.meu_status==='pendente'?'Reenviar solicitação':'Participar da comunidade'} onPress={()=>void execute(async()=>{await entrarComunidade(selected.id_comunidade);const r=await listarComunidadesReais();setSelected(r.communities.find(c=>c.id_comunidade===selected.id_comunidade)||selected)})}/></View>}
   <Modal visible={communityMenu} transparent animationType="fade" onRequestClose={()=>setCommunityMenu(false)}><View style={{flex:1,backgroundColor:'rgba(0,0,0,.55)',justifyContent:'center',padding:20}}><View style={{backgroundColor:darkMode?'#1A263C':'#FFF',borderRadius:18,padding:18,gap:8}}><Text style={{fontSize:19,fontWeight:'800'}}>Opções da comunidade</Text>
   {owner&&<Button sub title="Gerenciar comunidade e membros" onPress={()=>{setCommunityMenu(false);setCommunityEdit(true);setCommunityName(selected.nome);setCommunityDesc(selected.descricao);setCommunityPrivate(Boolean(selected.privada));void reloadMembers(selected.id_comunidade)}}/>}
   {!owner&&<Button sub title="Denunciar comunidade" onPress={()=>{setCommunityMenu(false);setReportTarget({tipo:'comunidade',id:selected.id_comunidade,titulo:selected.nome})}}/>}
   {joined&&!owner&&<Button sub title="Sair da comunidade" onPress={()=>{setCommunityMenu(false);setCommunityConfirmation({title:"Sair da comunidade",description:`Deseja sair de ${selected.nome}? Você deixará de ser membro e poderá precisar solicitar entrada novamente.`,confirmLabel:"Sair",onConfirm:()=>void execute(async()=>{await sairComunidade(selected.id_comunidade);setSelected(null);await reloadCommunities()})})}}/>}
   <Button sub title="Fechar" onPress={()=>setCommunityMenu(false)}/></View></View></Modal>
   <DenunciaModal alvo={reportTarget} onClose={()=>setReportTarget(null)}/>
   <ConfirmModal value={communityConfirmation} onClose={()=>setCommunityConfirmation(null)} working={working}/>
  <ScrollView ref={communityScroll} refreshControl={<RefreshControl refreshing={pulling} onRefresh={()=>void pullSocial()}/>} style={{flex:1}} contentContainerStyle={{padding:14,paddingBottom:125}} scrollEventThrottle={60} onScroll={e=>setCommunityScrolled(e.nativeEvent.contentOffset.y>composerBottom.current)}>
   <Text style={[styles2.heading,{fontSize:24}]}>{selected.nome}</Text><Text>{selected.descricao}</Text><Text style={styles2.muted}>{selected.total_membros} membros · {selected.privada?'Privada':'Pública'} · {selected.meu_status||'Você ainda não participa'}</Text>
   <Modal visible={communityEdit&&owner} animationType="slide" presentationStyle="pageSheet" onRequestClose={()=>setCommunityEdit(false)}><ScrollView keyboardShouldPersistTaps="handled" style={{flex:1,backgroundColor:darkMode?'#111827':'#F8FAFF'}} contentContainerStyle={{padding:18,paddingBottom:60}}><TouchableOpacity accessibilityLabel="Fechar gerenciamento" onPress={()=>setCommunityEdit(false)} style={{alignSelf:'flex-end',padding:10}}><Ionicons name="close" size={26} color={darkMode?'#FFF':'#152956'}/></TouchableOpacity><View style={styles2.box}><Text style={styles2.heading}>Gerenciar comunidade</Text><TextInput style={styles2.input} value={communityName} onChangeText={setCommunityName} placeholder="Nome"/><TextInput style={[styles2.input,{height:80}]} multiline value={communityDesc} onChangeText={setCommunityDesc} placeholder="Descrição"/>
    <Button sub title={communityPrivate?'Privada ✓':'Pública ✓'} onPress={()=>setCommunityPrivate(v=>!v)}/><Button sub title={communityImage?'Trocar imagem':'Escolher capa'} onPress={()=>void choose(setCommunityImage)}/><Button title="Salvar comunidade" onPress={()=>void execute(async()=>{await criarComunidadeReal(communityName,communityDesc,communityPrivate,communityImage||undefined,selected.id_comunidade);const r=await listarComunidadesReais();setSelected(r.communities.find(c=>c.id_comunidade===selected.id_comunidade)||selected);setCommunityEdit(false)})}/>
    <Text style={styles2.heading}>Adicionar pessoa</Text><TextInput style={styles2.input} placeholder="Nome, @usuário ou ID" value={memberQuery} onChangeText={setMemberQuery}/><Button sub title="Adicionar membro" onPress={()=>void execute(async()=>{await adicionarMembroReal(selected.id_comunidade,memberQuery);setMemberQuery('');await reloadMembers(selected.id_comunidade)})}/>
    {members.map(m=><View key={m.id_usuario} style={{padding:9,borderBottomWidth:1,borderColor:'#eee'}}><Text>{m.nm_usuario} · {m.papel} · {m.status}</Text><View style={styles2.line}>{m.status==='pendente'&&<><Button sub title="Aprovar" onPress={()=>void execute(async()=>{await acaoMembro(selected.id_comunidade,m.id_usuario,'approve');await reloadMembers(selected.id_comunidade)})}/><Button sub title="Recusar" onPress={()=>void execute(async()=>{await acaoMembro(selected.id_comunidade,m.id_usuario,'reject');await reloadMembers(selected.id_comunidade)})}/></>}{m.papel!=='dono'&&<><Button sub title={m.papel==='moderador'?'Tornar membro':'Tornar moderador'} onPress={()=>void execute(async()=>{await acaoMembro(selected.id_comunidade,m.id_usuario,m.papel==='moderador'?'membro':'moderador');await reloadMembers(selected.id_comunidade)})}/><Button sub title="Remover" onPress={()=>void execute(async()=>{await acaoMembro(selected.id_comunidade,m.id_usuario,'remove');await reloadMembers(selected.id_comunidade)})}/></>}</View></View>)}
   </View></ScrollView></Modal>
   {(joined||!selected.privada)&&<><View style={{marginTop:14}} onLayout={event=>{composerBottom.current=event.nativeEvent.layout.y+event.nativeEvent.layout.height;}}>{joined&&composer(selected.id_comunidade)}</View>{communityPosts.map(postCard)}</>}
  </ScrollView>
  {joined&&communityScrolled&&<TouchableOpacity accessibilityRole="button" accessibilityLabel="Publicar na comunidade" onPress={()=>setComposerTarget(selected.id_comunidade)} style={{position:'absolute',right:20,bottom:20,width:58,height:58,borderRadius:29,backgroundColor:COLORS.primary,alignItems:'center',justifyContent:'center',elevation:8}}><Ionicons name="add" size={32} color="#fff"/></TouchableOpacity>}
  </View>}
  return <ScrollView ref={communityListScroll} style={{flex:1}} refreshControl={<RefreshControl refreshing={pulling} onRefresh={()=>void pullSocial()}/>} contentContainerStyle={{paddingHorizontal:14,paddingTop:10,paddingBottom:110}}><ScreenTitle title="Comunidades" subtitle="Participe de grupos e compartilhe publicações."/>
   
   {(canCreate||ehUsuarioComunitario(usuario?.tp_usuario)||String(usuario?.tp_usuario||'').toLowerCase().includes('administrador'))&&<Button title="Criar comunidade" onPress={()=>{setCreating(true);setCommunityEdit(false);setSelected(null);setCommunityName('');setCommunityDesc('');setCommunityPrivate(false);setCommunityImage(null)}}/>}
   <Modal visible={creating} animationType="slide" presentationStyle="fullScreen" onRequestClose={()=>{if(!working)setCreating(false)}}>
    <KeyboardAvoidingView style={{flex:1,backgroundColor:darkMode?'#101827':'#F6F8FC'}} behavior={Platform.OS==='ios'?'padding':undefined}>
     <View style={{paddingTop:Platform.OS==='android'?42:58,paddingHorizontal:18,paddingBottom:16,flexDirection:'row',alignItems:'center',justifyContent:'space-between',borderBottomWidth:1,borderColor:'#8291A9'}}>
      <TouchableOpacity accessibilityLabel="Cancelar criação" onPress={()=>setCreating(false)} disabled={working}><Text style={{fontSize:16}}>Cancelar</Text></TouchableOpacity>
      <Text style={{fontSize:20,fontWeight:'800'}}>Nova comunidade</Text>
      <TouchableOpacity accessibilityLabel="Fechar" onPress={()=>setCreating(false)}><Ionicons name="close" size={25} color={darkMode?'#FFFFFF':'#20365C'}/></TouchableOpacity>
     </View>
     <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{padding:20,paddingBottom:50}}>
      <Text style={styles2.heading}>Nome da comunidade *</Text>
      <TextInput style={styles2.input} maxLength={140} value={communityName} onChangeText={setCommunityName} placeholder="Nome da comunidade"/>
      <Text style={styles2.heading}>Descrição *</Text>
      <TextInput style={[styles2.input,{minHeight:125,textAlignVertical:'top'}]} maxLength={2000} multiline value={communityDesc} onChangeText={setCommunityDesc} placeholder="Qual é o objetivo desta comunidade?"/>
      <Text style={styles2.heading}>Privacidade</Text>
      <TouchableOpacity accessibilityRole="checkbox" accessibilityState={{checked:communityPrivate}} style={[styles2.box,{flexDirection:'row',alignItems:'center',gap:12}]} onPress={()=>setCommunityPrivate(v=>!v)}><Ionicons name={communityPrivate?'checkbox':'square-outline'} size={24} color={darkMode?'#BDD6FF':COLORS.primary}/><View style={{flex:1}}><Text style={{fontWeight:'800'}}>{communityPrivate?'Comunidade privada':'Comunidade pública'}</Text><Text style={styles2.muted}>{communityPrivate?'A entrada depende de aprovação.':'As publicações podem ser vistas por todos.'}</Text></View></TouchableOpacity>
      <Text style={styles2.heading}>Imagem de capa (opcional)</Text>
      {communityImage&&<Image source={{uri:communityImage.uri}} style={{height:185,width:'100%',borderRadius:14,marginVertical:10}} resizeMode="cover"/>}
      <Button sub title={communityImage?'Trocar imagem':'Adicionar imagem'} onPress={()=>void choose(setCommunityImage)}/>
      <Button title={working?'Criando...':'Criar comunidade'} disabled={working||communityName.trim().length<3||communityDesc.trim().length<10} onPress={()=>void execute(async()=>{const r=await criarComunidadeReal(communityName.trim(),communityDesc.trim(),communityPrivate,communityImage||undefined);setCreating(false);setCommunityImage(null);await reloadCommunities();const all=await listarComunidadesReais();setSelected(all.communities.find(c=>c.id_comunidade===r.id)||null);})}/>
     </ScrollView>
    </KeyboardAvoidingView>
   </Modal>
   {loading&&<ActivityIndicator/>}{!!error&&<Text>{error}</Text>}{communityList.map(c=><TouchableOpacity key={c.id_comunidade} onPress={()=>{setSelected(c);setCommunityEdit(false);setCommunityScrolled(false);composerBottom.current=280;setCommunityPosts([]);if(c.meu_status==='ativo'||!c.privada)void reloadCommunityPosts(c.id_comunidade)}} style={styles2.box}><View style={styles2.line}>{arquivoWeb(c.imagem_capa)&&<Image source={{uri:arquivoWeb(c.imagem_capa)!}} style={{width:54,height:54,borderRadius:12}}/>}<View style={{flex:1}}><Text style={styles2.heading}>{c.nome}</Text><Text numberOfLines={2}>{c.descricao}</Text><Text style={styles2.muted}>{c.total_membros} membros · {c.privada?'Privada':'Pública'} · {c.meu_status||'Participar'}</Text></View></View></TouchableOpacity>)}
  </ScrollView>;
 }
 if(activeChat){
  const send=async()=>{
   if(working||(!chatText.trim()&&!chatPicture))return;
   await execute(async()=>{
    await enviarMensagemReal(activeChat.id_chat,chatText.trim(),chatPicture||undefined,replyTo?.id_mensagem);
    setChatText('');setChatPicture(null);setReplyTo(null);
    nearChatBottom.current=true;
    await reloadMessages(activeChat.id_chat);
    requestAnimationFrame(()=>chatScroll.current?.scrollToEnd({animated:true}));
   });
  };
  return <View style={{flex:1,backgroundColor:'#F4F7FC'}}>
   {/* Cabeçalho fora do ScrollView: permanece fixo. */}
   <View style={{backgroundColor:'#fff',borderBottomWidth:1,borderColor:'#DFE7F2',paddingHorizontal:14,paddingVertical:11,flexDirection:'row',alignItems:'center',gap:12}}>
    <TouchableOpacity onPress={()=>{setActiveChat(null);setChatMessages([]);setReplyTo(null);setChatText('');setChatPicture(null);void reloadChats()}} accessibilityRole="button" accessibilityLabel="Voltar para conversas" style={{padding:8}}><Ionicons name="arrow-back" size={24} color="#15345F"/></TouchableOpacity>
    <View style={{height:39,width:39,borderRadius:22,backgroundColor:'#DCE9FC',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>{arquivoWeb(activeChat.foto_perfil)?<Image source={{uri:arquivoWeb(activeChat.foto_perfil)!}} style={{width:39,height:39}}/>:<Ionicons name="person-outline" size={22} color={COLORS.primary}/>}</View>
    <View style={{flex:1}}><Text numberOfLines={1} style={{fontWeight:'800',fontSize:17,color:'#152956'}}>{activeChat.titulo}</Text><Text style={{color:'#74839A',fontSize:12}}>Conversa privada</Text></View>
    {!!activeChat.outro_usuario_id&&<TouchableOpacity accessibilityRole="button" accessibilityLabel="Opções da conversa" onPress={()=>{void consultarRelacao(Number(activeChat.outro_usuario_id)).then(setRelation).catch(()=>{});setChatMenu(true)}} style={{padding:8}}><Ionicons name="ellipsis-vertical" size={25} color={darkMode?'#FFFFFF':'#17345E'}/></TouchableOpacity>}
   </View>
   <Modal visible={chatMenu} transparent animationType="fade" onRequestClose={()=>setChatMenu(false)}><View style={{flex:1,backgroundColor:'rgba(0,0,0,.58)',justifyContent:'center',padding:20}}><View style={{borderRadius:18,padding:18,backgroundColor:darkMode?'#1A263C':'#FFFFFF',gap:9}}>
    <Text style={{fontSize:19,fontWeight:'800'}}>Opções da conversa</Text>
    <Button sub title="Denunciar usuário" onPress={()=>{setChatMenu(false);if(activeChat.outro_usuario_id)setReportTarget({tipo:'usuario',id:Number(activeChat.outro_usuario_id),titulo:activeChat.titulo})}}/>
    <Button sub title={relation.bloqueado?'Desbloquear usuário':'Bloquear usuário'} onPress={()=>{if(!activeChat.outro_usuario_id)return;const target=Number(activeChat.outro_usuario_id);void execute(async()=>{await alterarRelacao(target,'bloqueado',!relation.bloqueado);setChatMenu(false);setRelation(v=>({...v,bloqueado:!v.bloqueado}));if(!relation.bloqueado){setActiveChat(null);setChatMessages([]);await reloadChats();}})}}/>
    <Button sub title={relation.silenciado?'Ativar notificações':'Silenciar notificações'} onPress={()=>{if(!activeChat.outro_usuario_id)return;const target=Number(activeChat.outro_usuario_id);void execute(async()=>{await alterarRelacao(target,'silenciado',!relation.silenciado);setRelation(v=>({...v,silenciado:!v.silenciado}));setChatMenu(false)})}}/>
    <Button sub title="Cancelar" onPress={()=>setChatMenu(false)}/></View></View></Modal>
   <DenunciaModal alvo={reportTarget} onClose={()=>setReportTarget(null)}/>
   {!!error&&<Text style={{color:'#B42318',paddingHorizontal:15}}>{error}</Text>}
   <ScrollView ref={chatScroll} refreshControl={<RefreshControl refreshing={pulling} onRefresh={()=>void pullSocial()}/>} style={{flex:1,opacity:chatReady||chatMessages.length===0?1:0}} onLayout={()=>{chatViewportReady.current=true;finalizeInitialChatScroll()}} contentContainerStyle={{paddingHorizontal:13,paddingTop:16,paddingBottom:18}} keyboardShouldPersistTaps="handled" scrollEventThrottle={100} onScroll={(event)=>{const {contentOffset,contentSize,layoutMeasurement}=event.nativeEvent;const distance=Math.max(0,contentSize.height-contentOffset.y-layoutMeasurement.height);nearChatBottom.current=distance<100;setShowJumpToEnd(distance>350);}} onContentSizeChange={()=>{if(chatInitialScrollPending.current){finalizeInitialChatScroll();}else if(scrollOnNewMessage.current){chatScroll.current?.scrollToEnd({animated:false});scrollOnNewMessage.current=false;}}}>
    {chatMessages.length===0&&<Text style={{color:'#73829A',textAlign:'center',marginTop:30}}>Envie uma mensagem para começar a conversa.</Text>}
    {chatMessages.map(m=>{
     const mine=Number(m.id_usuario)===uid;
     const replyName=m.resposta_autor||'Mensagem';
     const replyText=m.resposta_texto||'Mídia';
     // Largura mínima evita que o nome "Você" e os ícones sejam comprimidos.
     // A largura máxima respeita telas menores e o ajuste de fonte acessível.
     const maxBubbleWidth=Math.max(185,Math.min(screenWidth-42,screenWidth*.84));
     const textLength=(m.texto||'').length;
     const bubbleWidth=(m.id_mensagem_resposta||m.anexo_url)
      ?maxBubbleWidth
      :Math.min(maxBubbleWidth,Math.max(Math.min(220,maxBubbleWidth),textLength*7+66));
     return <View key={m.id_mensagem} style={{width:bubbleWidth,alignSelf:mine?'flex-end':'flex-start',marginBottom:12}}>
      <View style={{width:'100%',backgroundColor:mine?'#D9EAFE':'#FFFFFF',borderColor:mine?'#B7D6F9':'#E1E8F2',borderWidth:1,borderRadius:17,borderTopRightRadius:mine?5:17,borderTopLeftRadius:mine?17:5,paddingHorizontal:12,paddingVertical:10}}>
       <View style={{flexDirection:'row',alignItems:'center',gap:8,marginBottom:4}}>
        <View style={{flex:1,minWidth:0,flexDirection:'row',alignItems:'center',gap:5}}>{arquivoWeb(m.foto_perfil)?<Image source={{uri:arquivoWeb(m.foto_perfil)!}} style={{width:23,height:23,borderRadius:12}}/>:<Ionicons name="person-circle-outline" size={21} color={COLORS.primary}/>}<Text numberOfLines={1} ellipsizeMode="tail" style={{flexShrink:1,color:mine?'#14549D':'#344765',fontWeight:'800',fontSize:13}}>{mine?'Você':m.nm_usuario}</Text></View>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Responder mensagem de ${m.nm_usuario}`} onPress={()=>{setEditMessage(null);setReplyTo(m)}} style={{padding:4,flexShrink:0}}><Ionicons name="arrow-undo-outline" size={18} color="#60718C"/></TouchableOpacity>
        {mine&&!!m.texto&&<TouchableOpacity accessibilityRole="button" accessibilityLabel="Editar mensagem" onPress={()=>{setEditMessage(m.id_mensagem);setEditMessageText(m.texto)}} style={{padding:4,flexShrink:0}}><Ionicons name="pencil-outline" size={17} color="#60718C"/></TouchableOpacity>}
       </View>
       {!!m.id_mensagem_resposta&&<TouchableOpacity accessibilityRole="button" accessibilityLabel="Mensagem respondida" onPress={()=>{const index=chatMessages.findIndex(v=>v.id_mensagem===Number(m.id_mensagem_resposta));if(index>=0)chatScroll.current?.scrollTo({y:Math.max(0,index*88),animated:true})}} style={{borderLeftWidth:3,borderColor:COLORS.primary,backgroundColor:mine?'#C8DFFB':'#F2F5FA',padding:8,borderRadius:6,marginVertical:5}}><Text style={{fontWeight:'800',color:'#22548D',fontSize:12}}>{replyName}</Text><Text numberOfLines={2} style={{color:'#40536D',fontSize:12}}>{replyText}</Text></TouchableOpacity>}
       {!!m.texto&&<Text style={{width:'100%',flexShrink:1,fontSize:15,color:'#1C2C43',lineHeight:21}}>{m.texto}</Text>}
       {!!arquivoWeb(m.anexo_url)&&<Image source={{uri:arquivoWeb(m.anexo_url)!}} resizeMode="contain" style={{width:'100%',height:185,borderRadius:10,marginTop:8}}/>}
       <Text style={{alignSelf:'flex-end',color:'#78859A',fontSize:10,marginTop:6}}>{stamp(m.criado_em)}{m.editado_em?' · editada':''}</Text>
      </View>
     </View>;
    })}
   </ScrollView>
   {showJumpToEnd&&<TouchableOpacity accessibilityRole="button" accessibilityLabel="Ir para as mensagens recentes" onPress={()=>{chatScroll.current?.scrollToEnd({animated:true});nearChatBottom.current=true;setShowJumpToEnd(false)}} style={{position:'absolute',right:18,bottom:104,zIndex:5,elevation:8,width:48,height:48,borderRadius:24,backgroundColor:darkMode?'#263E66':'#FFFFFF',borderColor:darkMode?'#8CA7D7':'#BED0EC',borderWidth:1,alignItems:'center',justifyContent:'center'}}><Ionicons name="arrow-down" size={24} color={darkMode?'#FFFFFF':'#164B9A'}/></TouchableOpacity>}
   <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined}>
    {!!replyTo&&<View style={{paddingHorizontal:14,paddingVertical:9,borderTopWidth:1,borderColor:'#DDE7F5',backgroundColor:'#EFF5FF',flexDirection:'row',alignItems:'center',gap:9}}>
      <Ionicons name="arrow-undo-outline" size={19} color={COLORS.primary}/>
      <View style={{flex:1}}><Text style={{fontSize:12,fontWeight:'800',color:'#17539A'}}>Respondendo a {replyTo.nm_usuario}</Text><Text numberOfLines={1} style={{fontSize:12,color:'#63748E'}}>{replyTo.texto||'Imagem'}</Text></View>
      <TouchableOpacity accessibilityLabel="Cancelar resposta" onPress={()=>setReplyTo(null)} style={{padding:6}}><Ionicons name="close" size={20} color="#63748E"/></TouchableOpacity>
    </View>}
    {!!chatPicture&&<View style={{flexDirection:'row',alignItems:'center',backgroundColor:'#EFF5FF',padding:9,gap:8}}><Ionicons name="image-outline" size={18} color={COLORS.primary}/><Text numberOfLines={1} style={{flex:1,color:'#345073'}}>{chatPicture.fileName||'Imagem selecionada'}</Text><TouchableOpacity accessibilityLabel="Remover imagem" onPress={()=>setChatPicture(null)}><Ionicons name="close-circle-outline" size={21} color="#9D3443"/></TouchableOpacity></View>}
    <View style={{flexDirection:'row',alignItems:'flex-end',gap:9,backgroundColor:'#fff',paddingHorizontal:12,paddingVertical:11,borderTopWidth:1,borderColor:'#E1E7F1'}}>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Adicionar imagem" disabled={working} onPress={()=>void choose(setChatPicture)} style={{padding:10}}><Ionicons name="image-outline" size={25} color={COLORS.primary}/></TouchableOpacity>
      <TextInput accessibilityLabel="Escrever mensagem" multiline placeholder="Mensagem..." placeholderTextColor="#8591A6" value={chatText} onChangeText={setChatText} style={{flex:1,maxHeight:110,minHeight:43,backgroundColor:'#F4F7FC',borderRadius:23,borderWidth:1,borderColor:'#E1E7F2',paddingHorizontal:15,paddingTop:11,paddingBottom:10,fontSize:15,color:'#1C2C43'}}/>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Enviar mensagem" onPress={()=>void send()} disabled={working||(!chatText.trim()&&!chatPicture)} style={{height:44,width:44,alignItems:'center',justifyContent:'center',borderRadius:25,backgroundColor:COLORS.primary,opacity:working||(!chatText.trim()&&!chatPicture)?.45:1}}>{working?<ActivityIndicator color="#fff" size="small"/>:<Ionicons name="send" size={21} color="#fff"/>}</TouchableOpacity>
    </View>
   </KeyboardAvoidingView>
   <Modal visible={editMessage!==null} animationType="slide" transparent onRequestClose={()=>{if(!working)setEditMessage(null)}}>
    <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={{flex:1,backgroundColor:'rgba(11,24,44,.50)',justifyContent:'center',padding:18}}>
     <View style={{backgroundColor:'#fff',borderRadius:20,padding:20}}>
      <View style={{flexDirection:'row',alignItems:'center',gap:9,marginBottom:12}}><Ionicons name="pencil-outline" size={20} color={COLORS.primary}/><Text style={{fontSize:19,fontWeight:'800',color:'#152956'}}>Editar mensagem</Text></View>
      <TextInput accessibilityLabel="Editar texto da mensagem" multiline autoFocus value={editMessageText} onChangeText={setEditMessageText} textAlignVertical="top" maxLength={4000} style={[styles2.input,{minHeight:110,fontSize:16}]}/>
      <View style={{flexDirection:'row',justifyContent:'flex-end',gap:10,marginTop:9}}><Button sub title="Cancelar" disabled={working} onPress={()=>setEditMessage(null)}/><Button title="Salvar" disabled={working||!editMessageText.trim()} onPress={()=>void execute(async()=>{if(editMessage===null)return;await editarMensagemReal(editMessage,editMessageText.trim());setEditMessage(null);await reloadMessages(activeChat.id_chat)})}/></View>
     </View>
    </KeyboardAvoidingView>
   </Modal>
  </View>;
 }
 return <View style={{flex:1}}>
  <ScrollView ref={conversationsScroll} refreshControl={<RefreshControl refreshing={pulling} onRefresh={()=>void pullSocial()}/>} style={{flex:1}} contentContainerStyle={{padding:15,paddingBottom:110}} keyboardShouldPersistTaps="handled" scrollEventThrottle={100} onScroll={e=>setChatScrolled(e.nativeEvent.contentOffset.y>150)}>
   <ScreenTitle title="Conversas" subtitle="Mensagens privadas com outros usuários."/>
   <TouchableOpacity accessibilityRole="button" accessibilityLabel="Gerenciar contas bloqueadas" onPress={()=>{setBlockedOpen(true);void listarBloqueados().then(r=>setBlockedUsers(r.users)).catch(e=>Alert.alert('Contas bloqueadas',message(e)))}} style={{alignSelf:'flex-end',padding:10,flexDirection:'row',alignItems:'center',gap:8}}><Ionicons name="shield-outline" size={20} color={darkMode?'#E1EBFF':'#1E4C92'}/><Text>Contas bloqueadas</Text></TouchableOpacity>
   <Modal visible={blockedOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={()=>setBlockedOpen(false)}><View style={{flex:1,padding:20,backgroundColor:darkMode?'#111827':'#FFFFFF'}}><View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}><Text style={{fontSize:20,fontWeight:'800'}}>Contas bloqueadas</Text><TouchableOpacity onPress={()=>setBlockedOpen(false)} accessibilityLabel="Fechar lista"><Ionicons name="close" size={26} color={darkMode?'#FFF':'#152956'}/></TouchableOpacity></View><ScrollView style={{marginTop:20}}>{blockedUsers.length===0&&<Text>Nenhuma conta bloqueada.</Text>}{blockedUsers.map(v=><View key={v.id_usuario} style={{padding:14,borderWidth:1,borderColor:'#7287A5',marginVertical:6,borderRadius:12,flexDirection:'row',alignItems:'center',gap:8}}><Text style={{flex:1}}>{v.nm_usuario}</Text><Button sub title="Desbloquear" onPress={()=>void execute(async()=>{await alterarRelacao(v.id_usuario,'bloqueado',false);setBlockedUsers(old=>old.filter(x=>x.id_usuario!==v.id_usuario));await reloadChats()})}/></View>)}</ScrollView></View></Modal>

   
   {userSearch}
   {loading&&<ActivityIndicator/>}{!!error&&<Text style={{color:'#B42318'}}>{error}</Text>}
   {chats.length===0&&!loading&&<Text style={styles2.muted}>Busque uma pessoa para iniciar uma conversa.</Text>}
   {chats.map(c=><TouchableOpacity key={c.id_chat} style={styles2.box} onPress={()=>{setChatReady(false);chatInitialScrollPending.current=true;setChatMessages([]);setActiveChat(c);void reloadMessages(c.id_chat)}}><View style={{flexDirection:'row',alignItems:'center',gap:10}}>{arquivoWeb(c.foto_perfil)?<Image source={{uri:arquivoWeb(c.foto_perfil)!}} style={{width:42,height:42,borderRadius:21}}/>:<Ionicons name="person-circle-outline" size={42} color={COLORS.primary}/>}<View style={{flex:1,minWidth:0}}><Text numberOfLines={2} style={styles2.heading}>{c.titulo}</Text><Text numberOfLines={1} style={styles2.muted}>{c.tipo==='privado'?'Conversa privada':'Conversa em grupo'} · {stamp(c.ultima_mensagem||'')}</Text></View></View></TouchableOpacity>)}
  </ScrollView>
  {chatScrolled&&<TouchableOpacity accessibilityRole="button" accessibilityLabel="Iniciar nova conversa" onPress={()=>{setSearch('');setUsers([]);setNewChatOpen(true)}} style={{position:'absolute',right:22,bottom:22,width:58,height:58,borderRadius:29,backgroundColor:'#245FC1',alignItems:'center',justifyContent:'center',elevation:8}}><Ionicons name="add" size={32} color="#FFFFFF"/></TouchableOpacity>}
  <Modal visible={newChatOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={()=>setNewChatOpen(false)}>
   <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={{flex:1,backgroundColor:darkMode?'#111827':'#FFFFFF'}}>
    <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:18,borderBottomWidth:1,borderColor:darkMode?'#60728E':'#CBD5E1'}}><Text style={{fontSize:20,fontWeight:'800',color:darkMode?'#FFFFFF':'#142B61'}}>Nova conversa</Text><TouchableOpacity accessibilityRole="button" accessibilityLabel="Fechar busca" onPress={()=>setNewChatOpen(false)}><Ionicons name="close" size={26} color={darkMode?'#FFFFFF':'#142B61'}/></TouchableOpacity></View>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{padding:16,paddingBottom:40}}><Text style={{color:darkMode?'#E2E8F0':'#64748B',marginBottom:8}}>Encontre uma pessoa pelo nome ou @usuário.</Text>{userSearch}</ScrollView>
   </KeyboardAvoidingView>
  </Modal>
 </View>;
}

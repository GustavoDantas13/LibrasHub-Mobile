import { File } from 'expo-file-system';
import { apiFetch, API_URL, criarUrlArquivo } from './api';

export type Post = { id_post:number; id_usuario:number; nm_usuario:string; conteudo:string; criado_em:string; midia_url:string|null; midia_tipo:string|null; id_comunidade:number|null; comunidade_nome?:string|null;anexos?:{caminho:string;nome_arquivo:string;mime_type:string}[]; total_curtidas:number;total_comentarios:number;curtiu:number|boolean; foto_perfil?:string|null };
export type Comentario = { id_comentario:number; id_usuario:number; nm_usuario:string; conteudo:string; criado_em:string; id_comentario_pai:number|null;total_curtidas:number;foto_perfil?:string|null };
export type Pessoa = { id_usuario:number; nm_usuario:string; social_handle:string; foto_perfil:string|null };
export type Comunidade = { id_comunidade:number; nome:string; descricao:string; imagem_capa:string|null; privada:number; id_criador:number; criador_nome:string; meu_status:string|null; meu_papel:string|null; total_membros:number };
export type Membro = { id_usuario:number; nm_usuario:string; social_handle:string; papel:string; status:string };
export type Chat = { id_chat:number; tipo:string; titulo:string; ultima_mensagem:string|null; outro_usuario_id?:number|null; foto_perfil?:string|null };
export type Mensagem = { id_mensagem:number; id_chat:number; id_usuario:number; nm_usuario:string; texto:string; anexo_url:string|null; criado_em:string; editado_em:string|null; id_mensagem_resposta?:number|null; resposta_autor?:string|null; resposta_texto?:string|null; resposta_tipo_anexo?:string|null; foto_perfil?:string|null };
const get = <T>(action:string,values:Record<string,string|number|undefined>={}) => apiFetch<T>(`mobile/social.php?action=${encodeURIComponent(action)}&${new URLSearchParams(Object.entries(values).filter(([,v])=>v!==undefined).map(([k,v])=>[k,String(v)])).toString()}`);
const post = <T>(action:string,body:Record<string,unknown>|FormData) => apiFetch<T>(`mobile/social.php?action=${encodeURIComponent(action)}`,{method:'POST',body:body instanceof FormData?body:JSON.stringify(body)});
/** Uma única função de URL é utilizada pelo Social, perfil e demais telas. */
export const arquivoWeb = (source?:string|null): string|null =>
  source?.trim() ? criarUrlArquivo(source) : null;

export const obterPostPorId=(id:number)=>get<{post:Post}>('post_detail',{post:id});
export const consultarNotificacoesAtivas=()=>get<{enabled:boolean}>('notification_settings');
export const definirNotificacoesAtivas=(enabled:boolean)=>post<{enabled:boolean}>('notification_settings',{enabled});
export const listarFeed=(mode:'public'|'following'='public',before?:number,community?:number)=>get<{posts:Post[];has_more:boolean}>('feed',{mode,before,community});
export type ArquivoPost={uri:string;fileName?:string|null;mimeType?:string|null;size?:number};
export const publicar=(text:string,community?:number,media:ArquivoPost[]=[])=>{const f=new FormData();f.append('text',text);if(community)f.append('community',String(community));media.forEach((m,i)=>f.append('media[]',new File(m.uri),m.fileName||`anexo-${i}`));return post<{id:number}>('post',f)};
export const editarPost=(postId:number,text:string)=>post('post_edit',{post:postId,text});
export const excluirPost=(postId:number)=>post('post_delete',{post:postId});
export const curtirPost=(postId:number)=>post<{liked:boolean}>('like',{post:postId});
export const comentariosPost=(postId:number)=>get<{comments:Comentario[]}>('comments',{post:postId});
export const comentar=(postId:number,text:string,parent?:number)=>post('comment',{post:postId,text,parent});
export const editarComentario=(comment:number,text:string)=>post('comment_edit',{comment,text});
export const excluirComentario=(comment:number)=>post('comment_delete',{comment});
export const curtirComentario=(comment:number)=>post('comment_like',{comment});
export const denunciar=(type:'post'|'comentario'|'usuario'|'comunidade'|'local',id:number,reason:string,details:string='',files:ArquivoPost[]=[])=>{
 if(!files.length)return post('report',{type,id,reason,details});
 const form=new FormData();form.append('type',type);form.append('id',String(id));form.append('reason',reason);form.append('details',details);
 files.forEach((f,i)=>form.append('arquivos[]',new File(f.uri),f.fileName||`prova-${i}`));return post('report',form);
};
export const buscarPessoas=(q:string)=>get<{users:Pessoa[]}>('search',{q});
export const seguir=(user:number)=>post<{following:boolean}>('follow',{user});
export const listarComunidadesReais=()=>get<{communities:Comunidade[];can_create:boolean}>('communities');
export const criarComunidadeReal=(name:string,description:string,privada:boolean,image?:{uri:string;fileName?:string|null;mimeType?:string|null},community?:number)=>{const f=new FormData();f.append('name',name);f.append('description',description);f.append('private',privada?'1':'');if(community)f.append('community',String(community));if(image)f.append('image',new File(image.uri),image.fileName||'capa.jpg');return post<{id:number}>(community?'community_update':'community_create',f)};
export const entrarComunidade=(community:number)=>post<{status:string}>('community_join',{community});
export const sairComunidade=(community:number)=>post('community_leave',{community});
export const membrosComunidade=(community:number)=>get<{members:Membro[];role:string}>('community_members',{community});
export const acaoMembro=(community:number,user:number,operation:string)=>post('community_member',{community,user,operation});
export const adicionarMembroReal=(community:number,query:string)=>post('community_add_member',{community,query});
export const listarChats=()=>get<{chats:Chat[]}>('chats');
export const iniciarPrivado=(user:number)=>post<{chat:number}>('chat_start',{user});
export const listarMensagensReais=(chat:number)=>get<{messages:Mensagem[]}>('messages',{chat});
export const enviarMensagemReal=(chat:number,text:string,media?:{uri:string;fileName?:string|null;mimeType?:string|null},replyTo?:number)=>{const f=new FormData();f.append('chat',String(chat));f.append('text',text);if(replyTo)f.append('reply_to',String(replyTo));if(media)f.append('media',new File(media.uri),media.fileName||'foto.jpg');return post('message_send',f)};
export const editarMensagemReal=(message:number,text:string)=>post('message_edit',{message,text});

export type PerfilSocialUsuario = { id_usuario:number; nm_usuario:string; social_handle:string|null; foto_perfil:string|null; banner_perfil:string|null; status_visibilidade:string; ultimo_acesso_em:string|null; tp_usuario:string; dt_usuario:string; online:boolean };
export type PerfilSocial = { profile:PerfilSocialUsuario; followers:number; following:number; is_following?:boolean; posts:Post[] };
export const obterPerfilSocial=(user?:number)=>get<PerfilSocial>('profile',user?{user}:{});

export type RelacaoUsuario={bloqueado:boolean;silenciado:boolean};
export const consultarRelacao=(user:number)=>get<RelacaoUsuario>('relation',{user});
export const alterarRelacao=(user:number,field:'bloqueado'|'silenciado',enabled:boolean)=>post('relation_set',{user,field,enabled});
export type NotificacaoMobile={id_notificacao:number;tipo:string;id_chat:number|null;id_remetente:number;nome_remetente:string;conteudo:string;referencia_id:number|null;criado_em:string};
/** Compatibilidade com ambas as versões de resposta (aliases antigos ou mnemônicos). */
type NotificacaoBanco=Partial<NotificacaoMobile> & {cd_tipo?:string; ds_conteudo?:string; id_referencia?:number|null; dt_criacao?:string};
export const obterNotificacoes=(after:number)=>
  get<{notifications:NotificacaoBanco[]}>('notifications',{after}).then(result=>({
    notifications:result.notifications.map((n):NotificacaoMobile=>({
      id_notificacao:Number(n.id_notificacao||0),
      tipo:String(n.cd_tipo??n.tipo??''),
      id_chat:n.id_chat??null,
      id_remetente:Number(n.id_remetente||0),
      nome_remetente:String(n.nome_remetente??''),
      conteudo:String(n.ds_conteudo??n.conteudo??''),
      referencia_id:n.id_referencia??n.referencia_id??null,
      criado_em:String(n.dt_criacao??n.criado_em??''),
    }))
  }));

export const listarBloqueados=()=>get<{users:{id_usuario:number;nm_usuario:string;foto_perfil:string|null}[]}>('blocked_users');

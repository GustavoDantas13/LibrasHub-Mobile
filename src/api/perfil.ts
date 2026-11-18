import { File } from 'expo-file-system';
import { apiFetch } from './api';
import { Usuario } from '../types';
import { obterPerfilSocial } from './mobileSocial';
export { obterPerfilSocial };
export type AnexoPerfil = { uri:string; fileName?:string|null; mimeType?:string|null };
export async function salvarPerfilCompleto(nome:string,email:string,visibilidade:'visivel'|'oculto',foto?:AnexoPerfil|null,capa?:AnexoPerfil|null){
 const form = new FormData();
 form.append('nome',nome.trim());form.append('email',email.trim());form.append('status_visibilidade',visibilidade);
 if(foto)form.append('foto_perfil',new File(foto.uri),foto.fileName||'foto.jpg');
 if(capa)form.append('banner_perfil',new File(capa.uri),capa.fileName||'capa.jpg');
 return apiFetch<{sucesso:true;usuario:Usuario}>('usuario/perfil.php',{method:'POST',body:form});
}

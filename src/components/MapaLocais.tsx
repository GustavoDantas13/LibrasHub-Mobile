import React from 'react';
import {View,Text} from 'react-native';
import {WebView} from 'react-native-webview';

export type PontoMapa={id:number;nome:string;latitude:number;longitude:number;descricao?:string};
type Props={pontos?:PontoMapa[];valor?:{latitude:number;longitude:number}|null;onSelecionar?:(p:{latitude:number;longitude:number})=>void;onAbrir?:(id:number)=>void;altura?:number;editavel?:boolean};
export default function MapaLocais({pontos=[],valor,onSelecionar,onAbrir,altura=310,editavel=false}:Props){
 const valid=pontos.filter(p=>Number.isFinite(+p.latitude)&&Number.isFinite(+p.longitude)&&Math.abs(+p.latitude)<=90&&Math.abs(+p.longitude)<=180&&!(+p.latitude===0&&+p.longitude===0));
 const data=JSON.stringify({pontos:valid,valor,editavel}).replace(/</g,'\\u003c');
 const html=`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"><style>html,body,#map{margin:0;width:100%;height:100%;font-family:sans-serif} .leaflet-popup-content{font-size:14px} </style></head><body><div id="map"></div><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script><script>
 const opts=${data};function send(o){window.ReactNativeWebView.postMessage(JSON.stringify(o))}
 if(!window.L){document.body.innerHTML='<p style="padding:18px">Mapa indisponível. Verifique a conexão com a internet.</p>'}else{
 const map=L.map('map',{zoomControl:true}).setView([-24.19,-46.79],10);
 L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(map);
 const bounds=[];opts.pontos.forEach(p=>{const m=L.marker([p.latitude,p.longitude]).addTo(map);bounds.push([p.latitude,p.longitude]);const name=document.createElement('strong');name.textContent=p.nome;m.bindPopup(name);m.on('click',()=>send({type:'open',id:p.id}))});
 let pin=null;const place=(lat,lng,notify)=>{if(pin){pin.setLatLng([lat,lng])}else{pin=L.marker([lat,lng],{draggable:opts.editavel}).addTo(map);pin.on('dragend',()=>{const p=pin.getLatLng();send({type:'select',latitude:p.lat,longitude:p.lng})})}if(notify)send({type:'select',latitude:lat,longitude:lng})};
 if(opts.valor&&Number.isFinite(+opts.valor.latitude)&&Number.isFinite(+opts.valor.longitude)){place(+opts.valor.latitude,+opts.valor.longitude,false);map.setView([+opts.valor.latitude,+opts.valor.longitude],15)}else if(bounds.length)map.fitBounds(bounds,{padding:[25,25],maxZoom:14});
 if(opts.editavel)map.on('click',e=>place(e.latlng.lat,e.latlng.lng,true));setTimeout(()=>map.invalidateSize(),250);
 }</script></body></html>`;
 return <View style={{height:altura,borderRadius:14,overflow:'hidden',backgroundColor:'#E8EDF3'}}><WebView originWhitelist={['*']} source={{html}} javaScriptEnabled domStorageEnabled nestedScrollEnabled scrollEnabled onMessage={e=>{try{const v=JSON.parse(e.nativeEvent.data);if(v.type==='select'&&Number.isFinite(v.latitude)&&Number.isFinite(v.longitude))onSelecionar?.({latitude:v.latitude,longitude:v.longitude});if(v.type==='open')onAbrir?.(Number(v.id));}catch{}}} /></View>;
}

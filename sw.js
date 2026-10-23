'use strict';
const VERSION='morning-v1';
const SHELL=VERSION+'-shell', IMAGES=VERSION+'-images';
const ROOT=new URL('./',self.location.href);
const ASSETS=['./','./index.html','./styles.css','./app.js','./config.js','./initial-data.json','./manifest.webmanifest','./assets/icon.svg','./assets/icon-192.png','./assets/icon-512.png','./assets/icon-maskable.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(SHELL).then(cache=>cache.addAll(ASSETS)));});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith('morning-')&&![SHELL,IMAGES].includes(key))await caches.delete(key);await self.clients.claim();})());});
self.addEventListener('fetch',e=>{
  const req=e.request,url=new URL(req.url);
  if(req.method!=='GET')return;
  // 即時 API 永遠走網路；不快取 JSONP 程式碼。
  if(url.origin==='https://script.google.com'||url.origin==='https://script.googleusercontent.com')return;
  if(url.origin===ROOT.origin&&url.pathname.startsWith(ROOT.pathname)){
    if(req.mode==='navigate'){
      e.respondWith((async()=>{try{return await fetch(req);}catch{return (await caches.match(new URL('index.html',ROOT).href))||Response.error();}})());
    }else if(ASSETS.some(p=>new URL(p,ROOT).href===url.href)){
      e.respondWith((async()=>{const cache=await caches.open(SHELL);try{const res=await fetch(req);if(res.ok)await cache.put(req,res.clone());return res;}catch{return (await cache.match(req))||Response.error();}})());
    }
    return;
  }
  if(req.destination==='image'&&['https://drive.google.com','https://lh3.googleusercontent.com'].includes(url.origin)){
    e.respondWith((async()=>{const cache=await caches.open(IMAGES);try{const res=await fetch(req);if(res.ok||res.type==='opaque'){await cache.put(req,res.clone());const keys=await cache.keys();while(keys.length>40)await cache.delete(keys.shift());}return res;}catch{return (await cache.match(req))||Response.error();}})());
  }
});

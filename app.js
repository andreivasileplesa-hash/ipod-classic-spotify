const tracks=[
 {title:'Midnight City',artist:"M83 · Hurry Up, We're Dreaming",duration:243,elapsed:134,source:'EN TU IPOD',connection:'MI BIBLIOTECA',tone:'sunset'},
 {title:'Dreams',artist:'Fleetwood Mac · Rumours',duration:257,elapsed:81,source:'EN TU IPOD',connection:'MI BIBLIOTECA',tone:'forest'},
 {title:'Borderline',artist:'Tame Impala · The Slow Rush',duration:237,elapsed:46,source:'EN TU IPOD',connection:'MI BIBLIOTECA',tone:'pink'},
 {title:"La femme d'argent",artist:'Air · Moon Safari',duration:437,elapsed:210,source:'EN TU IPOD',connection:'MI BIBLIOTECA',tone:'mist'}
];
const $=s=>document.querySelector(s);const views=['player','library','spotify','about','spotifyApp'];let trackIndex=0,playing=true,progressTimer=null,activeView='spotifyApp',spotifyIframeAPI=null,spotifyEmbedController=null,queuedSpotifyUri=null,currentSpotifyUri=null,spotifyFocusIndex=0,lastWheelSelected=-1,spotifyIsPlaying=false,spotifyVolume=50,spotifyVolumeSynced=false,spotifyDeviceId=null,spotifyDeviceSupportsVolume=false,volumeCommitTimer=null,volumeLabelTimer=null;
const fmt=s=>`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
function renderTrack(){const t=tracks[trackIndex];$('#trackTitle').textContent=t.title;$('#trackArtist').textContent=t.artist;$('#elapsed').textContent=fmt(t.elapsed);$('#duration').textContent=fmt(t.duration);$('#progressFill').style.width=`${t.elapsed/t.duration*100}%`;$('#progressKnob').style.left=`${t.elapsed/t.duration*100}%`;$('#sourceLabel').textContent=t.source;$('#connectionLabel').textContent=t.connection;$('#albumArt').dataset.tone=t.tone;}
function showView(name){activeView=name;views.forEach(v=>document.getElementById(v+'View').classList.toggle('active',v===name));$('#screenLabel').textContent=({player:'NOW PLAYING',library:'MI BIBLIOTECA',spotify:'SPOTIFY',about:'ORBIT',spotifyApp:'SPOTIFY'})[name];$('#screen').classList.toggle('nav-active',name!=='player'&&name!=='spotifyApp');$('#screen').classList.toggle('in-menu',name==='player');}
function togglePlay(){playing=!playing;$('#playGlyph').textContent=playing?'Ⅱ':'▶';if(playing)startTimer();else clearInterval(progressTimer)}
function startTimer(){clearInterval(progressTimer);progressTimer=setInterval(()=>{if(!playing)return;const t=tracks[trackIndex];t.elapsed=(t.elapsed+1)%t.duration;renderTrack()},1000)}
function nextTrack(dir=1){trackIndex=(trackIndex+dir+tracks.length)%tracks.length;renderTrack();if(activeView!=='player')showView('player')}
$('#playBtn').onclick=togglePlay;$('#nextBtn').onclick=()=>nextTrack(1);$('#prevBtn').onclick=()=>nextTrack(-1);
$('#wheelSelect').onclick=()=>{if(activeView==='spotifyApp')handleSpotifyWheelSelect();else if(activeView==='player')showView('library');else if(activeView==='library')showView('player');else if(activeView==='spotify')loadSpotify();};$('#backBtn').onclick=()=>showView('spotifyApp');$('#spotifyShortcut').onclick=()=>showView('spotifyApp');$('#moreBtn').onclick=()=>showView(activeView==='player'?'library':'spotifyApp');$('#footerSpotify').onclick=e=>{e.preventDefault();showView('spotifyApp')};
document.querySelectorAll('.menu-item').forEach(btn=>btn.onclick=()=>showView(btn.dataset.view));document.querySelectorAll('.library-item').forEach(btn=>btn.onclick=()=>{trackIndex=Number(btn.dataset.track);renderTrack();showView('player');if(!playing)togglePlay()});
$('#progressTrack').onclick=e=>{const rect=e.currentTarget.getBoundingClientRect(),p=Math.max(0,Math.min(1,(e.clientX-rect.left)/rect.width));tracks[trackIndex].elapsed=Math.round(tracks[trackIndex].duration*p);renderTrack()};
function parseSpotify(v){v=v.trim();let m=v.match(/open\.spotify\.com\/(?:intl-[^/]+\/)?(?:embed\/)?(playlist|album|track|artist|show|episode)\/([A-Za-z0-9]+)/);if(m)return `spotify:${m[1]}:${m[2]}`;m=v.match(/spotify:(playlist|album|track|artist|show|episode):([A-Za-z0-9]+)/);return m?`spotify:${m[1]}:${m[2]}`:null}
function loadSpotify(){const uri=parseSpotify($('#spotifyUrl').value);if(!uri){$('#spotifyUrl').focus();$('#spotifyUrl').placeholder='Pega un enlace válido de Spotify';return}const frame=document.createElement('iframe');frame.src=`https://open.spotify.com/embed/${uri.replace('spotify:','').replace(':','/')}?utm_source=generator&theme=0`;frame.title='Reproductor de Spotify';frame.allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';frame.loading='lazy';$('#embedWrap').replaceChildren(frame);$('#connectionLabel').textContent='SPOTIFY';$('#sourceLabel').textContent='SPOTIFY';showView('spotify')}
$('#loadSpotify').onclick=loadSpotify;$('#spotifyUrl').addEventListener('keydown',e=>{if(e.key==='Enter')loadSpotify()});$('#demoSpotify').onclick=()=>{$('#spotifyUrl').value='https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M';loadSpotify()};$('#shuffleBtn').onclick=e=>e.currentTarget.classList.toggle('on');$('#repeatBtn').onclick=e=>e.currentTarget.classList.toggle('on');$('#themeBtn').onclick=()=>document.body.classList.toggle('dark-mode');
const now=new Date();$('#clock').textContent=`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;const day=['DOM','LUN','MAR','MIÉ','JUE','VIE','SÁB'][now.getDay()];$('#menuDate').textContent=`${day} · ${String(now.getDate()).padStart(2,'0')} ${['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'][now.getMonth()]}`;
renderTrack();startTimer();

// Cuenta Spotify: Authorization Code con PKCE, sin client secret en el dispositivo.
const SPOTIFY_AUTH='https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN='https://accounts.spotify.com/api/token';
const SPOTIFY_SCOPES='user-read-private playlist-read-private user-read-playback-state user-modify-playback-state';
const redirectUri=location.origin==='null'?'':`${location.origin}${location.pathname}`;
const clientInput=$('#spotifyClientId');
clientInput.value=localStorage.getItem('orbit_spotify_client_id')||'';
$('#spotifyRedirectUri').textContent=redirectUri||'Publica la app con HTTPS para conectar tu cuenta.';
function setSpotifyMessage(message){$('#spAccountHint').textContent=message;}
function encodeBase64Url(bytes){return btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
function randomVerifier(){return encodeBase64Url(crypto.getRandomValues(new Uint8Array(64)));}
async function startSpotifyLogin(){
  const clientId=clientInput.value.trim();
  if(!clientId){$('#spotifySetup').scrollIntoView({behavior:'smooth',block:'center'});clientInput.focus();setSpotifyMessage('Pega el Client ID de tu app de Spotify para continuar.');return;}
  if(!redirectUri||(!location.protocol.startsWith('https')&&location.hostname!=='127.0.0.1'&&location.hostname!=='[::1]')){setSpotifyMessage('Para conectar una cuenta, esta app debe estar publicada en una dirección HTTPS y registrada en Spotify.');return;}
  localStorage.setItem('orbit_spotify_client_id',clientId);
  try{
    const verifier=randomVerifier();
    const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier));
    const challenge=encodeBase64Url(new Uint8Array(hash));
    const state=randomVerifier().slice(0,32);
    sessionStorage.setItem('orbit_spotify_verifier',verifier);
    sessionStorage.setItem('orbit_spotify_state',state);
    const auth=new URL(SPOTIFY_AUTH);
    auth.search=new URLSearchParams({client_id:clientId,response_type:'code',redirect_uri:redirectUri,scope:SPOTIFY_SCOPES,state,code_challenge_method:'S256',code_challenge:challenge,show_dialog:'true'}).toString();
    location.assign(auth.toString());
  }catch(error){setSpotifyMessage('No se pudo iniciar sesión. Abre la app desde un navegador actualizado.');}
}
async function exchangeSpotifyCode(){
  const params=new URLSearchParams(location.search),code=params.get('code');
  if(params.get('error')){setSpotifyMessage('No se autorizó el acceso a Spotify. Puedes intentarlo de nuevo.');history.replaceState({},'',location.pathname);return;}
  if(!code)return;
  if(params.get('state')!==sessionStorage.getItem('orbit_spotify_state')){setSpotifyMessage('La sesión de Spotify caducó. Vuelve a conectar tu cuenta.');history.replaceState({},'',location.pathname);return;}
  const clientId=localStorage.getItem('orbit_spotify_client_id'),verifier=sessionStorage.getItem('orbit_spotify_verifier');
  try{
    const response=await fetch(SPOTIFY_TOKEN,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:clientId,grant_type:'authorization_code',code,redirect_uri:redirectUri,code_verifier:verifier})});
    const data=await response.json();if(!response.ok)throw new Error(data.error_description||'Spotify no aceptó la conexión.');
    saveSpotifyTokens(data);localStorage.setItem('orbit_spotify_scope_version','3');spotifyVolumeSynced=false;sessionStorage.removeItem('orbit_spotify_verifier');sessionStorage.removeItem('orbit_spotify_state');history.replaceState({},'',location.pathname);await loadSpotifyAccount();
  }catch(error){history.replaceState({},'',location.pathname);setSpotifyMessage(error.message||'No se pudo conectar con Spotify.');}
}
function saveSpotifyTokens(data){sessionStorage.setItem('orbit_spotify_access',data.access_token);sessionStorage.setItem('orbit_spotify_expires',String(Date.now()+data.expires_in*1000));if(data.refresh_token)localStorage.setItem('orbit_spotify_refresh',data.refresh_token);}
async function spotifyAccessToken(){
  const token=sessionStorage.getItem('orbit_spotify_access'),expires=Number(sessionStorage.getItem('orbit_spotify_expires')||0);
  if(token&&Date.now()<expires-60000)return token;
  const refresh=localStorage.getItem('orbit_spotify_refresh'),clientId=localStorage.getItem('orbit_spotify_client_id');if(!refresh||!clientId)return token;
  const response=await fetch(SPOTIFY_TOKEN,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:clientId,grant_type:'refresh_token',refresh_token:refresh})});
  const data=await response.json();if(!response.ok)throw new Error('Vuelve a conectar tu cuenta de Spotify.');saveSpotifyTokens(data);return data.access_token;
}
async function spotifyApi(path,options={}){let token=await spotifyAccessToken();if(!token)throw new Error('Conecta tu cuenta de Spotify para ver tu música.');const request=()=>fetch(`https://api.spotify.com/v1${path}`,{...options,headers:{...(options.headers||{}),Authorization:`Bearer ${token}`}});let response=await request();if(response.status===401){sessionStorage.removeItem('orbit_spotify_access');token=await spotifyAccessToken();response=await request();}if(response.status===204)return null;const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.error?.message||'Spotify no pudo controlar la reproducción.');return data;}
function showSelectedAlbum(button){if(!button)return;const cover=button.querySelector('.sp-cover'),title=button.querySelector('b'),subtitle=button.querySelector('small');$('#nowPlayingTitle').textContent=title?.textContent||'Spotify';$('#nowPlayingSubtitle').textContent=subtitle?.textContent||'Álbum o playlist';$('#nowPlayingArt').style.background=cover?.style.background||getComputedStyle(cover||document.body).backgroundImage||'';$('#spAccountHint').textContent='SELECCIONADO · PULSA ▶ PARA REPRODUCIR';}
function renderSpotifyPlaylists(items){const list=$('#spPlaylists');list.replaceChildren();if(!items.length){setSpotifyMessage('Tu cuenta está conectada. Aún no hay playlists para mostrar.');return;}items.forEach((playlist,index)=>{const button=document.createElement('button');button.className='sp-playlist';button.dataset.uri=playlist.uri||`spotify:playlist:${playlist.id}`;const cover=document.createElement('span');cover.className=`sp-cover cover-${['one','two','three','four'][index%4]}`;if(playlist.images?.[0]?.url){cover.style.background=`center/cover url("${playlist.images[0].url}")`;}else cover.textContent='♫';const info=document.createElement('span'),title=document.createElement('b'),subtitle=document.createElement('small');title.textContent=playlist.name;subtitle.textContent='Disco o playlist · Spotify';info.append(title,subtitle);button.append(cover,info);button.onclick=()=>{showSelectedAlbum(button);lastWheelSelected=spotifyFocusIndex;};list.append(button);});if(items.length)showSelectedAlbum(list.firstElementChild);}
async function loadSpotifyAccount(){try{const [profile,playlists]=await Promise.all([spotifyApi('/me'),spotifyApi('/me/playlists?limit=10')]);const hasWheelPermission=localStorage.getItem('orbit_spotify_scope_version')==='3';$('#spotifyGreeting').textContent=profile.display_name?`Hola, ${profile.display_name}`:'Tu Spotify';$('#spLibraryTitle').textContent='Tus playlists';renderSpotifyPlaylists(playlists.items||[]);$('#connectAccount').textContent='Desconectar';$('#spotifySetup').hidden=hasWheelPermission;if(hasWheelPermission)syncSpotifyPlaybackState();await syncNowPlaying();}catch(error){$('#spotifySetup').hidden=false;$('#connectAccount').textContent='Conectar cuenta';setSpotifyMessage(error.message);}}
async function syncNowPlaying(){try{const state=await spotifyApi('/me/player');if(!state){spotifyIsPlaying=false;paintPlaybackButtons();setSpotifyMessage('Abre Spotify y empieza una canción para mostrarla aquí.');return;}spotifyIsPlaying=Boolean(state.is_playing);spotifyDeviceId=state.device?.id||null;spotifyDeviceSupportsVolume=Boolean(state.device?.supports_volume);if(Number.isFinite(state.device?.volume_percent)){spotifyVolume=state.device.volume_percent;spotifyVolumeSynced=true;}const track=state.item;if(track){$('#nowPlayingTitle').textContent=track.name;$('#nowPlayingSubtitle').textContent=`${track.album?.name||''} · ${track.artists?.map(artist=>artist.name).join(', ')||''}`;const image=track.album?.images?.[0]?.url;if(image)$('#nowPlayingArt').style.background=`center/cover url("${image}")`;setSpotifyMessage(state.is_playing?'SONANDO AHORA EN SPOTIFY':'EN PAUSA · SPOTIFY');}else setSpotifyMessage('Elige un disco y pulsa ▶ para empezar.');paintPlaybackButtons();}catch(error){setSpotifyMessage(error.message||'No se pudo leer la reproducción de Spotify.');}}
function paintPlaybackButtons(){const glyph=spotifyIsPlaying?'Ⅱ':'▶';$('#wheelGlyph').textContent=glyph;$('#spotifyPlayPause').textContent=glyph;$('#spotifyPlayPause').setAttribute('aria-label',spotifyIsPlaying?'Pausar':'Reproducir');}
async function controlSpotify(action){if(!sessionStorage.getItem('orbit_spotify_access')&&!localStorage.getItem('orbit_spotify_refresh')){setSpotifyMessage('Toca el icono ◉ para conectar tu cuenta de Spotify.');return;}try{const state=await spotifyApi('/me/player');if(!state?.device){setSpotifyMessage('Abre Spotify en este móvil y empieza una canción; luego podrás controlarla aquí.');return;}spotifyDeviceId=state.device.id||null;const target=spotifyDeviceId?`?device_id=${encodeURIComponent(spotifyDeviceId)}`:'';let path,body;if(action==='toggle'){if(state.is_playing)path='/me/player/pause'+target;else{path='/me/player/play'+target;if(!state.item){const selected=spotifyFocusItems()[spotifyFocusIndex%Math.max(spotifyFocusItems().length,1)];if(selected?.dataset.uri)body={context_uri:selected.dataset.uri};}}}else path=`/me/player/${action}${target}`;await spotifyApi(path,{method:'PUT',...(body?{headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{})});if(action==='toggle')spotifyIsPlaying=!state.is_playing;paintPlaybackButtons();setTimeout(syncNowPlaying,700);}catch(error){setSpotifyMessage(error.message||'Spotify no pudo cambiar la reproducción.');}}
function mountSpotifyEmbed(uri){if(!spotifyIframeAPI||!uri)return;spotifyEmbedController=null;const host=document.createElement('div');host.id='spotifyEmbedHost';$('#spotifyPlayback').replaceChildren(host);spotifyIframeAPI.createController(host,{width:'100%',height:'152',uri},controller=>{spotifyEmbedController=controller;controller.addListener('ready',()=>{setSpotifyMessage('Reproductor conectado. Gira la rueda para controlar el volumen.');syncSpotifyPlaybackState();});controller.addListener('playback_update',event=>{spotifyIsPlaying=!event.data.isPaused;if(spotifyIsPlaying&&!spotifyVolumeSynced)syncSpotifyPlaybackState();});controller.addListener('playback_started',()=>{spotifyIsPlaying=true;syncSpotifyPlaybackState();});});}
function playSpotifyEmbed(uri){if(!uri)return;const spotifyUrl=`https://open.spotify.com/${uri.replace('spotify:','').replace(':','/')}`;setSpotifyMessage('Abriendo este disco en Spotify.');location.href=spotifyUrl;}
function spotifyFocusItems(){return [...document.querySelectorAll('#spPlaylists .sp-playlist')];}
function paintSpotifyFocus(){const items=spotifyFocusItems();if(items.length){spotifyFocusIndex=(spotifyFocusIndex+items.length)%items.length;showSelectedAlbum(items[spotifyFocusIndex]);}}
function moveSpotifyFocus(amount){if(activeView!=='spotifyApp')return;const items=spotifyFocusItems();if(!items.length)return;spotifyFocusIndex=(spotifyFocusIndex+amount+items.length)%items.length;paintSpotifyFocus();}
function activateSpotifyFocus(){const items=spotifyFocusItems();if(!items.length)return;paintSpotifyFocus();items[spotifyFocusIndex].click();}
function handleSpotifyWheelSelect(){controlSpotify('toggle');}
async function syncSpotifyPlaybackState(){try{const state=await spotifyApi('/me/player');if(!state?.device){spotifyIsPlaying=false;spotifyVolumeSynced=false;spotifyDeviceSupportsVolume=false;return;}spotifyIsPlaying=Boolean(state.is_playing);spotifyDeviceId=state.device.id||null;spotifyDeviceSupportsVolume=Boolean(state.device.supports_volume);if(Number.isFinite(state.device.volume_percent)){spotifyVolume=state.device.volume_percent;spotifyVolumeSynced=true;}}catch(error){spotifyVolumeSynced=false;spotifyDeviceSupportsVolume=false;}}
function rotateSpotifyWheel(amount){if(spotifyIsPlaying){adjustSpotifyVolume(amount);}else{moveSpotifyFocus(amount);}}
function adjustSpotifyVolume(direction){if(localStorage.getItem('orbit_spotify_scope_version')!=='3'){setSpotifyMessage('Desconecta y vuelve a conectar Spotify para dar permiso al volumen.');return;}if(!spotifyVolumeSynced||!spotifyDeviceSupportsVolume){setSpotifyMessage('Spotify no permite cambiar el volumen de este dispositivo desde la rueda. Usa los botones físicos del móvil.');return;}spotifyVolume=Math.max(0,Math.min(100,spotifyVolume+direction*5));$('#screenLabel').textContent=`VOL ${spotifyVolume}%`;setSpotifyMessage(`Volumen ${spotifyVolume}%`);clearTimeout(volumeCommitTimer);clearTimeout(volumeLabelTimer);volumeCommitTimer=setTimeout(async()=>{try{const deviceQuery=spotifyDeviceId?`&device_id=${encodeURIComponent(spotifyDeviceId)}`:'';await spotifyApi(`/me/player/volume?volume_percent=${spotifyVolume}${deviceQuery}`,{method:'PUT'});}catch(error){setSpotifyMessage(error.message+' Spotify Premium y un dispositivo activo son necesarios para cambiar el volumen.');}},180);volumeLabelTimer=setTimeout(()=>{if(activeView==='spotifyApp')$('#screenLabel').textContent='SPOTIFY';},1400);}
window.onSpotifyIframeApiReady=api=>{spotifyIframeAPI=api;if(queuedSpotifyUri&&!spotifyEmbedController)mountSpotifyEmbed(queuedSpotifyUri);};
const spotifyIframeScript=document.createElement('script');spotifyIframeScript.src='https://open.spotify.com/embed/iframe-api/v1';spotifyIframeScript.async=true;document.body.append(spotifyIframeScript);
$('#connectAccount').onclick=()=>{const connected=Boolean(localStorage.getItem('orbit_spotify_refresh')||sessionStorage.getItem('orbit_spotify_access'));if(connected){localStorage.removeItem('orbit_spotify_refresh');localStorage.removeItem('orbit_spotify_scope_version');sessionStorage.removeItem('orbit_spotify_access');sessionStorage.removeItem('orbit_spotify_expires');$('#spotifySetup').hidden=false;$('#spotifySetup').style.display='block';setSpotifyMessage('Cuenta desconectada.');return;}$('#spotifySetup').hidden=false;$('#spotifySetup').style.display='block';$('#spotifySetup').scrollIntoView({behavior:'smooth',block:'center'});};
$('#nowPlayingArt').onclick=()=>controlSpotify('toggle');$('#spotifyPlayPause').onclick=()=>controlSpotify('toggle');$('#spotifyPrevious').onclick=()=>controlSpotify('previous');$('#spotifyNext').onclick=()=>controlSpotify('next');
$('#saveClientId').onclick=startSpotifyLogin;
$('#spRefresh').onclick=loadSpotifyAccount;
// Los controles de biblioteca ya no se muestran en la pantalla minimalista.
document.querySelectorAll('.sp-tile').forEach(button=>button.onclick=()=>{const playlist=document.querySelectorAll('.sp-playlist')[Number(button.dataset.index)%Math.max(1,document.querySelectorAll('.sp-playlist').length)];if(playlist?.dataset.uri)playSpotifyEmbed(playlist.dataset.uri);else if(!sessionStorage.getItem('orbit_spotify_access')){$('#spotifySetup').hidden=false;$('#spotifySetup').scrollIntoView({behavior:'smooth',block:'center'});}});
document.querySelectorAll('.sp-playlist[data-demo]').forEach((button,index)=>{button.dataset.uri=`spotify:playlist:${['37i9dQZF1DXcBWIGoYBM5M','37i9dQZF1DX4JAvHpjipBk','37i9dQZF1DXcF6B6QPhFDv'][index]}`;button.onclick=()=>showSelectedAlbum(button);});
exchangeSpotifyCode();
if(sessionStorage.getItem('orbit_spotify_access')||localStorage.getItem('orbit_spotify_refresh'))loadSpotifyAccount();else showSelectedAlbum(document.querySelector('#spPlaylists .sp-playlist'));
setInterval(()=>{if(localStorage.getItem('orbit_spotify_refresh')||sessionStorage.getItem('orbit_spotify_access'))syncNowPlaying();},8000);document.addEventListener('visibilitychange',()=>{if(!document.hidden&&(localStorage.getItem('orbit_spotify_refresh')||sessionStorage.getItem('orbit_spotify_access')))syncNowPlaying();});

// Girar/deslizar el aro también recorre las opciones de Spotify.
const wheelSurface=$('.wheel');
let wheelGesture=null;
function wheelTouchAngle(event){const rect=wheelSurface.getBoundingClientRect();return Math.atan2(event.clientY-(rect.top+rect.height/2),event.clientX-(rect.left+rect.width/2));}
function normalizeAngle(angle){while(angle>Math.PI)angle-=Math.PI*2;while(angle<-Math.PI)angle+=Math.PI*2;return angle;}
wheelSurface.addEventListener('pointerdown',event=>{
  if(activeView!=='spotifyApp'||event.target.closest('button,#menuBtn'))return;
  const rect=wheelSurface.getBoundingClientRect(),dx=event.clientX-(rect.left+rect.width/2),dy=event.clientY-(rect.top+rect.height/2);
  if(Math.hypot(dx,dy)<rect.width*.24)return;
  wheelGesture={pointerId:event.pointerId,angle:wheelTouchAngle(event),travel:0};
  wheelSurface.setPointerCapture(event.pointerId);event.preventDefault();
});
wheelSurface.addEventListener('pointermove',event=>{
  if(!wheelGesture||wheelGesture.pointerId!==event.pointerId)return;
  const angle=wheelTouchAngle(event);wheelGesture.travel+=normalizeAngle(angle-wheelGesture.angle);wheelGesture.angle=angle;
  while(wheelGesture.travel>=.38){rotateSpotifyWheel(1);wheelGesture.travel-=.38;}
  while(wheelGesture.travel<=-.38){rotateSpotifyWheel(-1);wheelGesture.travel+=.38;}
  event.preventDefault();
});
const clearWheelGesture=event=>{if(wheelGesture?.pointerId===event.pointerId){const moved=Math.abs(wheelGesture.travel);wheelGesture=null;if(moved<.12)moveSpotifyFocus(1);}};
wheelSurface.addEventListener('pointerup',clearWheelGesture);
wheelSurface.addEventListener('pointercancel',clearWheelGesture);
document.addEventListener('pointerdown',event=>{const item=event.target.closest('#spotifyAppView .sp-tile,#spotifyAppView .sp-playlist,#connectAccount,#spotifyClientId,#saveClientId,#spSearch,#spLibrary');if(!item)return;const index=spotifyFocusItems().indexOf(item);if(index>=0){spotifyFocusIndex=index;paintSpotifyFocus();}});

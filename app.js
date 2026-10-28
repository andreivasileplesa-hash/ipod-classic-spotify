const tracks=[
 {title:'Midnight City',artist:"M83 · Hurry Up, We're Dreaming",duration:243,elapsed:134,source:'EN TU IPOD',connection:'MI BIBLIOTECA',tone:'sunset'},
 {title:'Dreams',artist:'Fleetwood Mac · Rumours',duration:257,elapsed:81,source:'EN TU IPOD',connection:'MI BIBLIOTECA',tone:'forest'},
 {title:'Borderline',artist:'Tame Impala · The Slow Rush',duration:237,elapsed:46,source:'EN TU IPOD',connection:'MI BIBLIOTECA',tone:'pink'},
 {title:"La femme d'argent",artist:'Air · Moon Safari',duration:437,elapsed:210,source:'EN TU IPOD',connection:'MI BIBLIOTECA',tone:'mist'}
];
const $=s=>document.querySelector(s);const views=['player','library','spotify','about','spotifyApp'];let trackIndex=0,playing=true,progressTimer=null,activeView='spotifyApp';
const fmt=s=>`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
function renderTrack(){const t=tracks[trackIndex];$('#trackTitle').textContent=t.title;$('#trackArtist').textContent=t.artist;$('#elapsed').textContent=fmt(t.elapsed);$('#duration').textContent=fmt(t.duration);$('#progressFill').style.width=`${t.elapsed/t.duration*100}%`;$('#progressKnob').style.left=`${t.elapsed/t.duration*100}%`;$('#sourceLabel').textContent=t.source;$('#connectionLabel').textContent=t.connection;$('#albumArt').dataset.tone=t.tone;}
function showView(name){activeView=name;views.forEach(v=>document.getElementById(v+'View').classList.toggle('active',v===name));$('#screenLabel').textContent=({player:'NOW PLAYING',library:'MI BIBLIOTECA',spotify:'SPOTIFY',about:'ORBIT',spotifyApp:'SPOTIFY'})[name];$('#screen').classList.toggle('nav-active',name!=='player'&&name!=='spotifyApp');$('#screen').classList.toggle('in-menu',name==='player');}
function togglePlay(){playing=!playing;$('#playGlyph').textContent=playing?'Ⅱ':'▶';if(playing)startTimer();else clearInterval(progressTimer)}
function startTimer(){clearInterval(progressTimer);progressTimer=setInterval(()=>{if(!playing)return;const t=tracks[trackIndex];t.elapsed=(t.elapsed+1)%t.duration;renderTrack()},1000)}
function nextTrack(dir=1){trackIndex=(trackIndex+dir+tracks.length)%tracks.length;renderTrack();if(activeView!=='player')showView('player')}
$('#playBtn').onclick=togglePlay;$('#nextBtn').onclick=()=>nextTrack(1);$('#prevBtn').onclick=()=>nextTrack(-1);$('#wheelRight').onclick=()=>nextTrack(1);$('#wheelLeft').onclick=()=>nextTrack(-1);$('#wheelNext').onclick=()=>{if(activeView==='player')showView('library');else if(activeView==='library')showView('spotify');else if(activeView==='spotify')showView('about');else showView('player')};$('#wheelPrev').onclick=()=>{if(activeView==='player')showView('about');else if(activeView==='about')showView('spotify');else if(activeView==='spotify')showView('library');else showView('player')};
$('#menuBtn').onclick=()=>showView(activeView==='player'?'library':'player');$('#wheelSelect').onclick=()=>{if(activeView==='player')showView('library');else if(activeView==='library')showView('player');else if(activeView==='spotify')loadSpotify();};$('#backBtn').onclick=()=>showView('player');$('#spotifyShortcut').onclick=()=>showView('spotify');$('#moreBtn').onclick=()=>showView(activeView==='player'?'library':'player');$('#footerSpotify').onclick=e=>{e.preventDefault();showView('spotify')};
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
const SPOTIFY_SCOPES='user-read-private playlist-read-private';
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
    auth.search=new URLSearchParams({client_id:clientId,response_type:'code',redirect_uri:redirectUri,scope:SPOTIFY_SCOPES,state,code_challenge_method:'S256',code_challenge:challenge}).toString();
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
    saveSpotifyTokens(data);sessionStorage.removeItem('orbit_spotify_verifier');sessionStorage.removeItem('orbit_spotify_state');history.replaceState({},'',location.pathname);await loadSpotifyAccount();
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
async function spotifyApi(path){let token=await spotifyAccessToken();if(!token)throw new Error('Conecta tu cuenta de Spotify para ver tu música.');let response=await fetch(`https://api.spotify.com/v1${path}`,{headers:{Authorization:`Bearer ${token}`}});if(response.status===401){sessionStorage.removeItem('orbit_spotify_access');token=await spotifyAccessToken();response=await fetch(`https://api.spotify.com/v1${path}`,{headers:{Authorization:`Bearer ${token}`}});}const data=await response.json();if(!response.ok)throw new Error(data.error?.message||'Spotify no pudo cargar tu biblioteca.');return data;}
function renderSpotifyPlaylists(items){const list=$('#spPlaylists');list.replaceChildren();if(!items.length){setSpotifyMessage('Tu cuenta está conectada. Aún no hay playlists para mostrar.');return;}items.forEach((playlist,index)=>{const button=document.createElement('button');button.className='sp-playlist';button.dataset.uri=playlist.uri||`spotify:playlist:${playlist.id}`;const cover=document.createElement('span');cover.className=`sp-cover cover-${['one','two','three','four'][index%4]}`;if(playlist.images?.[0]?.url){cover.textContent='';cover.style.background=`center/cover url("${playlist.images[0].url}")`;}else cover.textContent='♫';const info=document.createElement('span'),title=document.createElement('b'),subtitle=document.createElement('small'),play=document.createElement('span');title.textContent=playlist.name;subtitle.textContent='Playlist · Spotify';play.className='sp-play';play.textContent='▶';info.append(title,subtitle);button.append(cover,info,play);button.onclick=()=>playSpotifyEmbed(button.dataset.uri);list.append(button);});}
async function loadSpotifyAccount(){try{const [profile,playlists]=await Promise.all([spotifyApi('/me'),spotifyApi('/me/playlists?limit=10')]);$('#spotifyGreeting').textContent=profile.display_name?`Hola, ${profile.display_name}`:'Tu Spotify';$('#spLibraryTitle').textContent='Tus playlists';setSpotifyMessage('Cuenta Spotify conectada.');renderSpotifyPlaylists(playlists.items||[]);$('#connectAccount').textContent='Desconectar';$('#spotifySetup').hidden=true;}catch(error){$('#spotifySetup').hidden=false;$('#connectAccount').textContent='Conectar cuenta';setSpotifyMessage(error.message);}}
function playSpotifyEmbed(uri){if(!uri)return;const value=uri.replace('spotify:','').replace(':','/');const frame=document.createElement('iframe');frame.src=`https://open.spotify.com/embed/${value}?utm_source=generator&theme=0`;frame.title='Reproductor oficial de Spotify';frame.allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';frame.loading='lazy';$('#spotifyPlayback').replaceChildren(frame);$('#spotifyPlayback').scrollIntoView({behavior:'smooth',block:'end'});}
$('#connectAccount').onclick=()=>{if(localStorage.getItem('orbit_spotify_refresh')||sessionStorage.getItem('orbit_spotify_access')){localStorage.removeItem('orbit_spotify_refresh');sessionStorage.removeItem('orbit_spotify_access');sessionStorage.removeItem('orbit_spotify_expires');$('#spotifySetup').hidden=false;$('#connectAccount').textContent='Conectar cuenta';$('#spotifyGreeting').textContent='Buenas tardes';setSpotifyMessage('Cuenta desconectada.');return;}$('#spotifySetup').hidden=false;$('#spotifySetup').scrollIntoView({behavior:'smooth',block:'center'});};
$('#saveClientId').onclick=startSpotifyLogin;
$('#spRefresh').onclick=loadSpotifyAccount;
$('#spLibrary').onclick=()=>$('#spLibraryTitle').scrollIntoView({behavior:'smooth',block:'start'});
$('#spSearch').onclick=()=>showView('spotify');
document.querySelectorAll('.sp-tile').forEach(button=>button.onclick=()=>{const playlist=document.querySelectorAll('.sp-playlist')[Number(button.dataset.index)%Math.max(1,document.querySelectorAll('.sp-playlist').length)];if(playlist?.dataset.uri)playSpotifyEmbed(playlist.dataset.uri);else if(!sessionStorage.getItem('orbit_spotify_access')){$('#spotifySetup').hidden=false;$('#spotifySetup').scrollIntoView({behavior:'smooth',block:'center'});}});
document.querySelectorAll('.sp-playlist[data-demo]').forEach((button,index)=>button.onclick=()=>playSpotifyEmbed(`spotify:playlist:${['37i9dQZF1DXcBWIGoYBM5M','37i9dQZF1DX4JAvHpjipBk','37i9dQZF1DXcF6B6QPhFDv'][index]}`));
exchangeSpotifyCode();
if(sessionStorage.getItem('orbit_spotify_access')||localStorage.getItem('orbit_spotify_refresh'))loadSpotifyAccount();

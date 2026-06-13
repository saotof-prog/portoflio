/* ── THREE.JS 3D BACKGROUND ENGINE ─────────────────── */
(function initThree(){
  const canvas = document.getElementById('bg-canvas');
  const W = window.innerWidth, H = window.innerHeight;
  const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
  renderer.setSize(W,H);renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.setClearColor(0x04040a,1);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60,W/H,0.1,1000);
  camera.position.z = 5;
  const sGeo = new THREE.IcosahedronGeometry(2.2,3);
  const sMat = new THREE.MeshBasicMaterial({color:0x00ff9f,wireframe:true,transparent:true,opacity:.06});
  const sphere = new THREE.Mesh(sGeo,sMat);
  sphere.position.set(4,0,0);
  scene.add(sphere);
  const tGeo = new THREE.TorusGeometry(1.5,.004,2,120);
  const tMat = new THREE.MeshBasicMaterial({color:0x7c3aed,transparent:true,opacity:.25});
  const torus = new THREE.Mesh(tGeo,tMat);
  torus.rotation.x = Math.PI/2.5;
  torus.position.set(4,0,0);
  scene.add(torus);
  const t2Geo = new THREE.TorusGeometry(1.9,.003,2,120);
  const t2Mat = new THREE.MeshBasicMaterial({color:0x00ff9f,transparent:true,opacity:.1});
  const torus2 = new THREE.Mesh(t2Geo,t2Mat);
  torus2.rotation.x = Math.PI/3;torus2.rotation.z = Math.PI/6;
  torus2.position.set(4,0,0);
  scene.add(torus2);
  const starGeo = new THREE.BufferGeometry();
  const starCount = 2000;
  const starPos = new Float32Array(starCount*3);
  for(let i=0;i<starCount*3;i++) starPos[i]=(Math.random()-.5)*80;
  starGeo.setAttribute('position',new THREE.BufferAttribute(starPos,3));
  const starMat = new THREE.PointsMaterial({color:0xd4d4dc,size:.04,transparent:true,opacity:.4});
  scene.add(new THREE.Points(starGeo,starMat));
  const gridHelper = new THREE.GridHelper(30,40,0x00ff9f,0x00ff9f);
  gridHelper.material.transparent=true;gridHelper.material.opacity=.03;
  gridHelper.position.y=-3;
  scene.add(gridHelper);
  let mx=0,my=0;
  window.addEventListener('mousemove',e=>{mx=(e.clientX/window.innerWidth-.5)*2;my=-(e.clientY/window.innerHeight-.5)*2;});
  let t=0;
  function animate(){
    requestAnimationFrame(animate);t+=.004;
    sphere.rotation.y=t*.3;sphere.rotation.x=t*.1;
    torus.rotation.z=t*.2;torus2.rotation.y=t*.15;
    camera.position.x+=(mx*.8-camera.position.x)*.03;
    camera.position.y+=(my*.5-camera.position.y)*.03;
    camera.lookAt(scene.position);
    renderer.render(scene,camera);
  }
  animate();
  window.addEventListener('resize',()=>{
    const w=window.innerWidth,h=window.innerHeight;
    camera.aspect=w/h;camera.updateProjectionMatrix();
    renderer.setSize(w,h);
  });
})();

/* ── RUST/WASM PARTICLE PHYSICS ENGINE (SIMULATED) ─── */
const WasmParticleEngine = (function(){
  const STRUCT_SIZE = 8;
  function ParticleEngine(count){
    this._buf = new Float32Array(count * STRUCT_SIZE);
    this._count = count;
    this._w = window.innerWidth;
    this._h = window.innerHeight;
    for(let i=0;i<count;i++) this._initParticle(i);
  }
  ParticleEngine.prototype._initParticle = function(i){
    const b = this._buf, o = i*STRUCT_SIZE;
    b[o]=Math.random()*this._w;b[o+1]=Math.random()*this._h;
    b[o+2]=(Math.random()-.5)*.4;b[o+3]=(Math.random()-.5)*.4-.1;
    b[o+4]=0;b[o+5]=120+Math.random()*180;b[o+6]=.5+Math.random()*1.5;b[o+7]=0;
  };
  ParticleEngine.prototype.tick = function(dt,mx,my){
    const b=this._buf,W=this._w,H=this._h;
    for(let i=0;i<this._count;i++){
      const o=i*STRUCT_SIZE;
      let x=b[o],y=b[o+1],vx=b[o+2],vy=b[o+3],life=b[o+4],maxLife=b[o+5];
      const dx=x-mx,dy=y-my,dist=Math.sqrt(dx*dx+dy*dy);
      if(dist<120&&dist>0){const force=(.6/dist)*dt*60;vx+=dx*force;vy+=dy*force;}
      vx*=.98;vy*=.98;x+=vx*dt*60;y+=vy*dt*60;life+=dt*60;
      const t=life/maxLife;
      let alpha=t<.15?t/.15:t>.7?(1-t)/.3:1;alpha*=.55;
      if(life>=maxLife||x<-10||x>W+10||y<-10||y>H+10){this._initParticle(i);}
      else{b[o]=x;b[o+1]=y;b[o+2]=vx;b[o+3]=vy;b[o+4]=life;b[o+7]=alpha;}
    }
  };
  ParticleEngine.prototype.getBuffer=function(){return this._buf;};
  ParticleEngine.prototype.count=function(){return this._count;};
  return ParticleEngine;
})();

/* ── CANVAS PARTICLE RENDERER ──────────────────────── */
(function initCanvas(){
  const canvas=document.getElementById('particle-canvas');
  const ctx=canvas.getContext('2d');
  let W=canvas.width=window.innerWidth,H=canvas.height=window.innerHeight;
  const engine=new WasmParticleEngine(280);
  let mx=W/2,my=H/2,lastT=0,fps=0,fpsCounter=0,fpsTimer=0;
  document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;});
  const colors=[[0,255,159],[124,58,237],[244,63,94],[251,191,36]];
  function render(ts){
    requestAnimationFrame(render);
    const dt=Math.min((ts-lastT)/1000,.05);lastT=ts;
    fpsCounter++;fpsTimer+=dt;
    if(fpsTimer>=.5){fps=Math.round(fpsCounter/fpsTimer);fpsCounter=0;fpsTimer=0;
      document.getElementById('wasm-counter').textContent=`particles: ${engine.count()} | fps: ${fps}`;}
    engine.tick(dt,mx,my);
    const buf=engine.getBuffer();
    ctx.clearRect(0,0,W,H);
    for(let i=0;i<engine.count();i++){
      const o=i*8;const x=buf[o],y=buf[o+1],sz=buf[o+6],alpha=buf[o+7];
      if(alpha<0.005) continue;
      const ci=i%colors.length;const [r,g,b]=colors[ci];
      ctx.beginPath();ctx.arc(x,y,sz,0,Math.PI*2);
      ctx.fillStyle=`rgba(${r},${g},${b},${alpha})`;ctx.fill();
    }
    ctx.lineWidth=.4;
    for(let i=0;i<engine.count();i+=2){
      for(let j=i+1;j<engine.count();j+=2){
        const oi=i*8,oj=j*8;const dx=buf[oi]-buf[oj],dy=buf[oi+1]-buf[oj+1];const d2=dx*dx+dy*dy;
        if(d2<6400){const a=(1-d2/6400)*.08*Math.min(buf[oi+7],buf[oj+7])*2;
          ctx.strokeStyle=`rgba(0,255,159,${a})`;ctx.beginPath();ctx.moveTo(buf[oi],buf[oi+1]);ctx.lineTo(buf[oj],buf[oj+1]);ctx.stroke();}
      }
    }
  }
  requestAnimationFrame(render);
  window.addEventListener('resize',()=>{W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight;engine._w=W;engine._h=H;});
})();

/* ── CURSOR SYSTEM ──────────────────────────── */
(function initCursor(){
  const dot=document.getElementById('c-dot');const cross=document.getElementById('c-cross');
  let cx=0,cy=0,rx=0,ry=0;
  document.addEventListener('mousemove',e=>{cx=e.clientX;cy=e.clientY;dot.style.cssText=`left:${cx-4}px;top:${cy-4}px`;});
  function loop(){rx+=(cx-rx-12)*.15;ry+=(cy-ry-12)*.15;cross.style.cssText=`left:${Math.round(rx)}px;top:${Math.round(ry)}px`;requestAnimationFrame(loop);}loop();
  document.querySelectorAll('a,button,.cert-card,.t-tag').forEach(el=>{
    el.addEventListener('mouseenter',()=>{dot.style.transform='scale(3)';cross.style.opacity='.3';});
    el.addEventListener('mouseleave',()=>{dot.style.transform='scale(1)';cross.style.opacity='1';});
  });
})();

/* ── CLOCK ──────────────────────────────────── */
(function clock(){
  const el=document.getElementById('clock');
  function upd(){const d=new Date();el.innerHTML=`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}<span class="blink" style="font-family:var(--mono)">_</span>`;}
  upd();setInterval(upd,1000);
})();

/* ── SCROLL REVEAL ──────────────────────────── */
(function reveal(){
  const obs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('on');obs.unobserve(e.target);}});},{threshold:.1});
  document.querySelectorAll('.rev').forEach(el=>obs.observe(el));
  const sObs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting){
      e.target.querySelectorAll('.sk-fill').forEach(f=>{f.style.width=(parseFloat(f.dataset.v)*100)+'%';f.classList.add('on');});
      sObs.unobserve(e.target);
    }});
  },{threshold:.15});
  document.querySelectorAll('.skills-layout>div').forEach(el=>sObs.observe(el));
})();

/* ── MANIFESTO WORD ANIMATOR ────────────────── */
(function manifesto(){
  const words=[
    {t:"Je",c:""},{t:"ne",c:""},{t:"code",c:"crt"},{t:"pas",c:""},
    {t:"des",c:""},{t:"fonctionnalités",c:"crt"},{t:"—",c:""},
    {t:"je",c:""},{t:"construis",c:"pur"},{t:"des",c:""},
    {t:"systèmes",c:"crt"},{t:"qui",c:""},{t:"pensent,",c:""},
    {t:"protègent",c:"pur"},{t:"et",c:""},{t:"résistent.",c:""},
    {t:"De",c:""},{t:"Harvard",c:"crt"},{t:"à",c:""},
    {t:"Microsoft,",c:"pur"},{t:"chaque",c:""},{t:"certification",c:"crt"},
    {t:"est",c:""},{t:"une",c:""},{t:"arme",c:"pur"},
    {t:"de",c:""},{t:"précision",c:"crt"},{t:"dans",c:""},
    {t:"un",c:""},{t:"monde",c:""},{t:"numérique",c:"pur"},
    {t:"en",c:""},{t:"mutation",c:"crt"},{t:"permanente.",c:""},
  ];
  const el=document.getElementById('manifesto-words');
  words.forEach((w,i)=>{
    const span=document.createElement('span');
    span.className='w'+(w.c?' '+w.c:'');
    span.textContent=w.t+' ';
    span.dataset.i=i;
    el.appendChild(span);
  });
  const spans=el.querySelectorAll('.w');
  const obs=new IntersectionObserver(()=>{
    spans.forEach((s,i)=>{setTimeout(()=>s.classList.add('lit'),i*55);});
    obs.disconnect();
  },{threshold:.3});
  obs.observe(el);
})();

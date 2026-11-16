import { animate } from 'motion';

const scene = document.querySelector('[data-workflow]');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const play = document.querySelector('#play');
const reset = document.querySelector('#reset');
const pause = document.querySelector('#pause');
const phases = [
  {id:'idle', chapter:'AVANT LE CHANGEMENT', text:'Le plan et le Deployment sont alignés à 3 réplicas.', desired:3, actual:3, revision:'r1', note:'état connu'},
  {id:'change', chapter:'01 / CHANGEMENT VERSIONNÉ', text:'Une proposition prépare 4 réplicas. Git et le cluster sont encore à 3.', desired:3, proposal:4, actual:3, revision:'r1', note:'proposition r2'},
  {id:'validation', chapter:'02 / VALIDATION', text:'La proposition est vérifiée et acceptée dans Git. Les contrôles précis dépendent du projet.', desired:4, actual:3, revision:'r2', note:'validée'},
  {id:'converge', chapter:'03 / CONVERGENCE', text:'Le contrôleur lit la révision validée et met le Deployment à 4.', desired:4, actual:4, revision:'r2', note:'validée'},
  {id:'drift', chapter:'04 / DÉRIVE', text:'Une modification manuelle ramène le Deployment à 2. Git demande toujours 4.', desired:4, actual:2, revision:'r2', note:'validée'},
  {id:'repair', chapter:'05 / CORRECTION', text:'Dans ce scénario, la réconciliation automatique détecte l’écart et rétablit 4.', desired:4, actual:4, revision:'r2', note:'validée'},
  {id:'rollback', chapter:'06 / RETOUR AU PLAN CONNU', text:'Un nouveau commit reprend le plan connu de r1 : Git demande à nouveau 3.', desired:3, actual:4, revision:'r3', note:'retour à r1'},
  {id:'done', chapter:'07 / DE NOUVEAU ALIGNÉ', text:'Le contrôleur applique r3 : le Deployment revient à 3. Les pods ne sont pas nécessairement prêts.', desired:3, actual:3, revision:'r3', note:'retour à r1'}
];
let timer; let animations = []; let current = 0; let paused = false;
const animatedElements = [...scene.querySelectorAll('.plan-sheet, .city, .scanner')];
const initialStyles = animatedElements.map(e => ({transform:e.style.transform, opacity:e.style.opacity}));
function clearAnimations() {
  animations.forEach(a=>a.cancel()); animations=[];
  animatedElements.forEach((e,i)=>{ e.style.transform=initialStyles[i].transform; e.style.opacity=initialStyles[i].opacity; });
}
function show(index) {
  clearTimeout(timer); clearAnimations();
  current = index;
  if (index === 0 || index === phases.length-1) paused = false;
  pause.disabled = index === 0 || index === phases.length-1;
  pause.textContent = paused ? 'Reprendre' : 'Mettre en pause';
  const p=phases[index]; scene.dataset.phase=p.id;
  document.querySelector('#chapter').textContent=p.chapter;
  document.querySelector('#status').textContent=p.text;
  document.querySelector('#desired').textContent=p.desired;
  document.querySelector('#actual').textContent=p.actual;
  document.querySelector('#revision').textContent=p.revision;
  document.querySelector('.plan-sheet > span').textContent=p.proposal ? 'PROPOSITION / GIT' : 'PLAN / GIT';
  document.querySelector('[data-plan-number]').textContent=p.proposal ?? p.desired;
  document.querySelector('[data-revision]').textContent=`${p.revision} · ${p.note}`;
  document.querySelectorAll('.tower').forEach((tower,i)=>tower.classList.toggle('is-present',i<p.actual));
  play.disabled=index>0 && index<phases.length-1;
  play.firstChild.textContent=index===phases.length-1?'Rejouer le scénario ':'Jouer le scénario ';
  if (!reduced.matches && index>0) {
    const target = ['change','validation','rollback'].includes(p.id) ? '.plan-sheet' : '.city';
    animations.push(animate(scene.querySelector(target), {transform:['translateY(12px)','translateY(0px)'], opacity:[0.55,1]}, {duration:0.8,easing:'ease-out'}));
    if (['converge','repair','done'].includes(p.id)) animations.push(animate(scene.querySelector('.scanner'), {transform:['translateX(-30px)','translateX(30px)'],opacity:[0,1,0]}, {duration:1.4}));
  }
  if(index>0 && index<phases.length-1 && !paused) timer=setTimeout(()=>show(index+1),3500);
}
play.addEventListener('click',()=>show(1));
pause.addEventListener('click',()=>{
  paused = !paused;
  clearTimeout(timer);
  pause.textContent = paused ? 'Reprendre' : 'Mettre en pause';
  animations.forEach(a=>paused ? a.pause() : a.play());
  if (!paused) timer=setTimeout(()=>show(current+1),3500);
});
reset.addEventListener('click',()=>show(0));
reduced.addEventListener('change',()=>{ if (reduced.matches) clearAnimations(); });
show(0);

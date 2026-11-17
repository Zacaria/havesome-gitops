import { animate } from 'motion';

const scene = document.querySelector('[data-workflow]');
const stage = scene.querySelector('.story-stage');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const play = document.querySelector('#play');
const reset = document.querySelector('#reset');
const pause = document.querySelector('#pause');
const actButtons = [...scene.querySelectorAll('[data-act]')];
const $ = selector => scene.querySelector(selector);
const ACT = 4800;
const REVISIONS = ['r1', 'r2', 'r3'];
const EASE = [0.22, 1, 0.36, 1];

const phases = [
  {id:'idle', chapter:'AVANT LE CHANGEMENT', text:'Le plan et le Deployment sont alignés à 3 réplicas.', benefit:'L’état voulu est écrit, relu et daté : n’importe qui peut savoir ce qui doit tourner.', desired:3, actual:3, revision:'r1'},
  {id:'change', chapter:'01 / CHANGEMENT VERSIONNÉ', text:'Une proposition prépare 4 réplicas. Git et le cluster sont encore à 3.', benefit:'Le changement est une proposition lisible, pas une commande lancée depuis un poste.', desired:3, proposal:4, actual:3, revision:'r1'},
  {id:'validation', chapter:'02 / VALIDATION', text:'La proposition est vérifiée et acceptée dans Git. Les contrôles précis dépendent du projet.', benefit:'Chaque modification de l’infrastructure garde un auteur, une revue et des contrôles.', desired:4, actual:3, revision:'r2'},
  {id:'converge', chapter:'03 / CONVERGENCE', text:'Le contrôleur lit la révision validée et met le Deployment à 4.', benefit:'Personne n’a besoin d’un accès direct au cluster : l’agent applique la révision acceptée.', desired:4, actual:4, revision:'r2'},
  {id:'drift', chapter:'04 / DÉRIVE', text:'Une modification manuelle ramène le Deployment à 2. Git demande toujours 4.', benefit:'Comme l’intention est écrite, l’écart devient mesurable au lieu de rester silencieux.', desired:4, actual:2, revision:'r2'},
  {id:'repair', chapter:'05 / CORRECTION', text:'Dans ce scénario, la réconciliation automatique détecte l’écart et rétablit 4.', benefit:'La boucle ramène le réel vers Git : un correctif non versionné ne survit pas en silence.', desired:4, actual:4, revision:'r2'},
  {id:'rollback', chapter:'06 / RETOUR AU PLAN CONNU', text:'Un nouveau commit reprend le plan connu de r1 : Git demande à nouveau 3.', benefit:'Revenir en arrière, c’est ajouter une révision : l’historique de l’incident reste intact.', desired:3, actual:4, revision:'r3'},
  {id:'done', chapter:'07 / DE NOUVEAU ALIGNÉ', text:'Le contrôleur applique r3 : le Deployment revient à 3. Les pods ne sont pas nécessairement prêts.', benefit:'Le même mécanisme sert au déploiement, à la correction et au retour : un seul chemin à auditer.', desired:3, actual:3, revision:'r3'}
];

let timer; let animations = []; let touched = new Map(); let current = 0; let paused = false;
let remaining = ACT; let deadline = 0;

// Every Motion animation goes through run() so pause, reset and reduced motion
// can stop it and remove every inline property it wrote.
function run(target, keyframes, options = {}) {
  const elements = typeof target === 'string' ? [...scene.querySelectorAll(target)] : [target];
  for (const element of elements) {
    if (!element) continue;
    const props = touched.get(element) ?? new Set();
    Object.keys(keyframes).forEach(key => props.add(key.replace(/[A-Z]/g, c => '-' + c.toLowerCase())));
    touched.set(element, props);
    const controls = animate(element, keyframes, {ease:EASE, ...options});
    animations.push(controls);
    if (paused) controls.pause();
  }
}

function clearAnimations() {
  animations.forEach(a => a.cancel()); animations = [];
  touched.forEach((props, element) => props.forEach(prop => element.style.removeProperty(prop)));
  touched = new Map();
}

function centre(element) {
  const box = element.getBoundingClientRect(); const origin = stage.getBoundingClientRect();
  return [box.left - origin.left + box.width / 2, box.top - origin.top + box.height / 2];
}

// A spark of light carries information between Git, the controller and the cluster.
function travel(from, to, delay = 0, lane = 0) {
  const [x1, y1] = centre(from); const [x2, y2] = centre(to);
  const [mx, my] = [(x1 + x2) / 2, Math.min(y1, y2) - 36];
  run(scene.querySelectorAll('.packet')[lane], {
    transform:[`translate(${x1}px,${y1}px) scale(.4)`, `translate(${mx}px,${my}px) scale(1.25)`, `translate(${x2}px,${y2}px) scale(.5)`],
    opacity:[0, 1, 1, 0]
  }, {duration:1.1, delay, ease:'easeInOut'});
}

const slots = () => [...scene.querySelectorAll('.slot')];
const range = (from, to) => slots().slice(from, to);

function choreograph(previous, p) {
  const core = $('.verdict');
  const terrace = $('.terrace');
  const head = $('.commit.is-head');
  if (p.id !== 'change' && p.id !== 'drift') run($('.ring'), {transform:['rotate(0deg)', 'rotate(360deg)']}, {duration:2.4, ease:'easeInOut', delay:p.id === 'validation' ? 2.4 : 0});

  if (p.id === 'change') {
    run($('.pr'), {transform:['translateY(-24px) rotate(-2deg)', 'translateY(0px) rotate(0deg)'], opacity:[0, 1]}, {duration:.7});
    run('.diff', {clipPath:['inset(0 100% 0 0)', 'inset(0 0% 0 0)']}, {duration:.7, delay:.6, ease:'linear'});
    run('.checks li', {opacity:[0, 1], transform:['translateX(-8px)', 'translateX(0px)']}, {duration:.4, delay:1.3});
  }
  if (p.id === 'validation') {
    scene.querySelectorAll('.checks i').forEach((check, i) => run(check, {transform:['scale(0)', 'scale(1.6)', 'scale(1)']}, {duration:.45, delay:.2 + i * .45}));
    run($('.merged'), {transform:['scale(2.4) rotate(-16deg)', 'scale(1) rotate(-8deg)'], opacity:[0, 1]}, {duration:.4, delay:1.6, ease:'easeIn'});
    run($('.commit-r2'), {transform:['translateY(-26px)', 'translateY(0px)'], opacity:[0, 1]}, {duration:.6, delay:2});
    travel($('.commit-r2'), core, 2.3);
  }
  if (p.id === 'converge' && previous.id === 'validation') run($('.pr'), {transform:['translateY(0px) scale(1)', 'translateY(28px) scale(.92)'], opacity:[1, 0]}, {duration:.6});
  if (['converge', 'repair', 'done'].includes(p.id)) {
    if (p.id === 'converge') travel(head, core, 0);
    if (p.id === 'repair') run($('.terminal'), {transform:['translateX(0px)', 'translateX(6px)', 'translateX(-6px)', 'translateX(0px)']}, {duration:.4, delay:1.9});
    travel(core, terrace, .8, 1);
    run($('.beam'), {transform:['translateX(-100%)', 'translateX(500%)'], opacity:[0, 1, 1, 0]}, {duration:1.5, delay:1, ease:'easeInOut'});
  }
  if (p.id === 'drift') {
    run($('.terminal'), {transform:['translateY(18px)', 'translateY(0px)'], opacity:[0, 1]}, {duration:.5});
    run($('.terminal code'), {clipPath:['inset(0 100% 0 0)', 'inset(0 0% 0 0)']}, {duration:1, delay:.3, ease:'linear'});
    run(core, {transform:['scale(1)', 'scale(1.1)', 'scale(1)', 'scale(1.1)', 'scale(1)']}, {duration:1.2, delay:2.5});
  }
  if (p.id === 'rollback') {
    if (previous.id === 'repair') run($('.terminal'), {opacity:[1, 0]}, {duration:.4});
    run($('.commit-r3'), {transform:['translateY(-26px)', 'translateY(0px)'], opacity:[0, 1]}, {duration:.6, delay:.2});
    travel($('.commit-r3'), core, .7);
  }

  // Towers follow the cluster value; blueprint outlines follow the Git value.
  const towerDelay = ['converge', 'repair', 'done'].includes(p.id) ? 1.7 : p.id === 'drift' ? 1.3 : .2;
  range(previous.actual, p.actual).forEach((slot, i) => run(slot.querySelector('.tower'), {transform:['translateY(14px) scaleY(0)', 'translateY(0px) scaleY(1.06)', 'translateY(0px) scaleY(1)'], opacity:[0, 1, 1]}, {duration:.75, delay:towerDelay + i * .25}));
  range(p.actual, previous.actual).forEach((slot, i) => run(slot.querySelector('.tower'), {transform:['translateY(0px) rotate(0deg) scaleY(1)', 'translateY(-6px) rotate(4deg) scaleY(1)', 'translateY(14px) rotate(4deg) scaleY(0)'], opacity:[1, 1, 0]}, {duration:.8, delay:towerDelay + i * .2, ease:'easeIn'}));
  // Outlines are visible up to the Git value, or up to the proposal while it is in review.
  // Any jump between acts only animates the slots whose visibility actually changes.
  const outlined = phase => Math.max(phase.desired, phase.proposal ?? 0);
  const ghostDelay = p.id === 'change' ? 1.8 : p.id === 'validation' ? 3.1 : p.id === 'rollback' ? 1.6 : .2;
  range(outlined(previous), outlined(p)).forEach(slot => run(slot.querySelector('.ghost'), {clipPath:['inset(100% 0 0 0)', 'inset(0% 0 0 0)'], opacity:[0, 1]}, {duration:.8, delay:ghostDelay}));
  range(outlined(p), outlined(previous)).forEach(slot => run(slot.querySelector('.ghost'), {clipPath:['inset(0 0 0% 0)', 'inset(0 0 100% 0)'], opacity:[1, 0]}, {duration:.8, delay:ghostDelay}));
}

function render(p) {
  const synced = p.desired === p.actual;
  const gap = p.desired - p.actual;
  scene.dataset.phase = p.id;
  scene.dataset.aligned = synced ? 'yes' : 'no';
  $('#chapter').textContent = p.chapter;
  $('#status .status-text').textContent = p.text;
  $('#benefit').textContent = p.benefit;
  $('#desired').textContent = p.desired;
  $('#actual').textContent = p.actual;
  $('#revision').textContent = p.revision;
  $('#sync').textContent = synced ? 'Synchronisé' : 'Écart';
  $('[data-sync]').textContent = p.proposal ? 'PROPOSITION EN REVUE' : synced ? 'SYNCHRONISÉ' : `ÉCART ${gap > 0 ? '+' : '−'}${Math.abs(gap)}`;
  $('[data-ctrl-desired]').textContent = p.desired;
  $('[data-ctrl-actual]').textContent = p.actual;
  $('[data-ctrl-verdict]').textContent = synced ? '=' : '≠';
  const head = REVISIONS.indexOf(p.revision);
  REVISIONS.forEach((r, i) => { const c = $(`.commit-${r}`); c.classList.toggle('is-visible', i <= head); c.classList.toggle('is-head', i === head); });
  slots().forEach((slot, i) => {
    slot.classList.toggle('is-desired', i < p.desired);
    slot.classList.toggle('is-built', i < p.actual);
    slot.classList.toggle('is-missing', i < p.desired && i >= p.actual);
    slot.classList.toggle('is-extra', i >= p.desired && i < p.actual);
    slot.classList.toggle('is-proposed', Boolean(p.proposal) && i >= p.desired && i < p.proposal);
  });
  actButtons.forEach((button, i) => {
    button.classList.toggle('is-done', i + 1 < current);
    if (i + 1 === current) button.setAttribute('aria-current', 'step'); else button.removeAttribute('aria-current');
  });
}

function schedule(ms) {
  clearTimeout(timer);
  remaining = ms; deadline = performance.now() + ms;
  timer = setTimeout(() => show(current + 1), ms);
}

function show(index) {
  clearTimeout(timer); clearAnimations();
  const previous = phases[current];
  current = index;
  const last = phases.length - 1;
  if (index === 0 || index === last) paused = false;
  pause.disabled = index === 0 || index === last;
  pause.textContent = paused ? 'Reprendre' : 'Mettre en pause';
  scene.classList.toggle('is-paused', paused);
  const p = phases[index];
  render(p);
  // Keep keyboard focus on a usable control when the focused button becomes disabled.
  const focused = document.activeElement;
  play.disabled = index > 0 && index < last;
  if (focused === play && play.disabled) pause.focus();
  if (focused === pause && pause.disabled) (index === last ? play : reset).focus();
  play.firstChild.textContent = index === last ? 'Rejouer le scénario ' : 'Jouer le scénario ';
  if (!reduced.matches && index > 0) {
    choreograph(previous, p);
    const fill = actButtons[index - 1]?.querySelector('i');
    if (fill && index < last) run(fill, {transform:['scaleX(0)', 'scaleX(1)']}, {duration:ACT / 1000, ease:'linear'});
  }
  if (index > 0 && index < last) { if (paused) remaining = ACT; else schedule(ACT); }
}

play.addEventListener('click', () => show(1));
actButtons.forEach((button, i) => button.addEventListener('click', () => show(i + 1)));
pause.addEventListener('click', () => {
  paused = !paused;
  pause.textContent = paused ? 'Reprendre' : 'Mettre en pause';
  scene.classList.toggle('is-paused', paused);
  animations.forEach(a => paused ? a.pause() : a.play());
  if (paused) { clearTimeout(timer); remaining = Math.max(0, deadline - performance.now()); }
  else schedule(remaining);
});
reset.addEventListener('click', () => show(0));
reduced.addEventListener('change', () => { if (reduced.matches) clearAnimations(); });
show(0);

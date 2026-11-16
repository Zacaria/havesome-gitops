import { animate } from 'motion';

const workflow = document.querySelector('[data-workflow]');
const actual = document.querySelector('#actual');
const status = document.querySelector('#status');
const reconcile = document.querySelector('#reconcile');
const nodes = [...document.querySelectorAll('[data-node]')];
const packets = [...document.querySelectorAll('.workflow-packet')];
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const messages = {
  aligned: 'Aligné · la configuration observée correspond à Git.',
  drift: 'Dérive · une modification manuelle a changé la configuration du cluster.',
  read: 'Lecture · le contrôleur récupère les 3 réplicas déclarés dans Git.',
  compare: 'Comparaison · le contrôleur constate 2 dans le cluster, contre 3 dans Git.',
  apply: 'Application · le contrôleur demande le retour à 3 dans le Deployment.',
  done: 'Réconcilié · spec.replicas est revenu à 3. Les pods ne sont pas nécessairement prêts.'
};
let timer, animations = [];
function show(phase) {
  clearTimeout(timer);
  animations.forEach(animation => animation.stop()); animations = [];
  workflow.dataset.phase = phase;
  actual.textContent = ['drift','read','compare','apply'].includes(phase) ? '2' : '3';
  status.textContent = messages[phase];
  reconcile.disabled = phase !== 'drift';
  const active = phase === 'read' ? 'git' : ['compare','apply'].includes(phase) ? 'controller' : ['drift','done'].includes(phase) ? 'cluster' : '';
  nodes.forEach(node => {
    node.classList.toggle('is-active', node.dataset.node === active);
    if (!reduced.matches) animations.push(animate(node, {transform: node.dataset.node === active ? 'translateY(-4px)' : 'translateY(0px)'}, {duration:0.25}));
    else node.style.transform = '';
  });
  packets.forEach((packet, i) => {
    const visible = (phase === 'read' && i === 0) || (phase === 'apply' && i === 1);
    packet.hidden = !visible;
    packet.style.transform = '';
    if (visible && !reduced.matches) animations.push(animate(packet, {transform:['translateX(-18px)','translateX(18px)'], opacity:[0,1,0]}, {duration:1, repeat:Infinity}));
    else packet.style.opacity = '1';
  });
  const next = {read:'compare', compare:'apply', apply:'done'}[phase];
  if (next) timer = setTimeout(() => show(next), 1100);
}
document.querySelector('#drift').addEventListener('click', () => show('drift'));
reconcile.addEventListener('click', () => show('read'));
document.querySelector('#reset').addEventListener('click', () => show('aligned'));
reduced.addEventListener('change', () => show(workflow.dataset.phase));

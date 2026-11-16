import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Button } from './ui/button';
import './workflow.css';

type Phase = 'aligned' | 'drift' | 'read' | 'compare' | 'apply' | 'done';
const messages: Record<Phase, string> = {
  aligned: 'Aligné · la configuration observée correspond à Git.',
  drift: 'Dérive · une modification manuelle a changé la configuration du cluster.',
  read: 'Lecture · le contrôleur récupère les 3 réplicas déclarés dans Git.',
  compare: 'Comparaison · le contrôleur constate 2 dans le cluster, contre 3 dans Git.',
  apply: 'Application · le contrôleur demande le retour à 3 dans le Deployment.',
  done: 'Réconcilié · spec.replicas est revenu à 3. Les pods ne sont pas nécessairement prêts.',
};

export function Workflow() {
  const [phase, setPhase] = useState<Phase>('aligned');
  const reduced = useReducedMotion();
  const actual = ['drift', 'read', 'compare', 'apply'].includes(phase) ? 2 : 3;
  const active = phase === 'read' ? 'git' : phase === 'compare' || phase === 'apply' ? 'controller' : phase === 'drift' || phase === 'done' ? 'cluster' : '';
  useEffect(() => {
    const next: Partial<Record<Phase, Phase>> = { read: 'compare', compare: 'apply', apply: 'done' };
    if (!next[phase]) return;
    const timer = window.setTimeout(() => setPhase(next[phase]!), 1100);
    return () => window.clearTimeout(timer);
  }, [phase]);
  return <div data-workflow data-phase={phase} className="workflow">
    <div className="workflow-intro"><p className="eyebrow">SIMULATION LOCALE</p><h3>Suivez la boucle</h3><p>Créez un écart, puis observez comment le contrôleur le corrige dans ce modèle. Aucun dépôt ni cluster n’est modifié.</p></div>
    <div className="workflow-nodes" aria-label="Git, contrôleur et cluster">
      {[
        { id: 'git', label: '01 / INTENTION', title: 'Git', detail: 'spec.replicas : 3' },
        { id: 'controller', label: '02 / CONTRÔLE', title: 'Contrôleur', detail: 'Observe et compare' },
        { id: 'cluster', label: '03 / RÉALITÉ', title: 'Cluster', detail: <>spec.replicas : <strong id="actual">{actual}</strong></> },
      ].map((node, i) => <React.Fragment key={node.id}>
        {i > 0 && <div className="workflow-link" aria-hidden="true"><span>→</span>{((i === 1 && phase === 'read') || (i === 2 && phase === 'apply')) && <motion.span className="workflow-packet" initial={reduced ? false : { x: -18, opacity: 0 }} animate={reduced ? { opacity: 1 } : { x: 18, opacity: [0, 1, 0] }} transition={{ duration: reduced ? 0 : 1, repeat: reduced ? 0 : Infinity }}>●</motion.span>}</div>}
        <motion.div data-node={node.id} className={`workflow-node ${active === node.id ? 'is-active' : ''}`} animate={reduced ? {} : { y: active === node.id ? -4 : 0 }} transition={{ duration: 0.25 }}><small>{node.label}</small><b>{node.title}</b><p>{node.detail}</p></motion.div>
      </React.Fragment>)}
    </div>
    <p className="workflow-status" id="status" role="status">{messages[phase]}</p>
    <p className="workflow-note">On compare la configuration du Deployment, pas les pods prêts. Même après réconciliation, Kubernetes peut ne pas réussir à rendre les pods disponibles.</p>
    <div className="lab-actions">
      <Button id="drift" type="button" onClick={() => setPhase('drift')}>Simuler une dérive</Button>
      <Button id="reconcile" type="button" disabled={phase !== 'drift'} onClick={() => setPhase('read')}>Réconcilier</Button>
      <Button id="reset" type="button" onClick={() => setPhase('aligned')}>Recommencer</Button>
    </div>
  </div>;
}

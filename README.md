# HaveSome GitOps

Guide statique francophone pour développeurs familiers de Terraform. La lecture suit un changement depuis Git jusqu'au cluster : intention, contrôle, réconciliation, exploitation et retour arrière. L'interface est utilisable sans JavaScript ; le laboratoire est une simulation locale sans accès réseau au cluster.

Direction : carnet d'exploitation clair, encre bleu nuit, repères orange et schémas de flux. Contrairement au guide HaveSome Go existant, le fil conducteur est une boucle de contrôle plutôt qu'une présentation du langage. Hébergement séparé requis ; aucun site existant ne doit être modifié.

## Vérification locale

Depuis ce répertoire : `npm ci`, `npm run build`, `python3 -m unittest discover -s tests -v`, `CHROMIUM=/usr/bin/brave-browser npm run test:browser`, puis `python3 -m http.server --directory dist 8000`. Ouvrir `http://localhost:8000/`. Les exemples sont pédagogiques et ne sont pas destinés à être appliqués à un cluster de production.

## Publication

Le projet Vercel `havesome-gitops` est séparé des autres sites. La publication actuelle est manuelle : déployer uniquement le contenu construit de `dist/` depuis un répertoire isolé lié à ce projet, puis comparer les fichiers publics au commit. Ce dépôt n'est pas relié à un déploiement automatique : un push ne met pas le site à jour. La branche `main` conserve la version publiée ; la branche `candidate/scroll-code` conserve séparément une correction locale en revue, non publiée.

## Modèle du laboratoire

Le laboratoire utilise Motion pour montrer les étapes de lecture, comparaison et application ; Recommencer interrompt la séquence et la préférence de réduction des animations supprime les déplacements. La dérive simulée porte sur `spec.replicas` du Deployment dans le cluster, et non sur le nombre de pods prêts. Le contrôleur GitOps peut rétablir la configuration selon ses réglages ; Kubernetes essaie ensuite de créer les pods, sans garantie de disponibilité.

## Sources

Les liens officiels sont regroupés dans le guide. Les ressources Kubernetes et GitOps supposent un contrôleur et des CRD préalablement installés. Aucun secret réel ni état Terraform ne doit être commité.

### Logos

Les icônes Argo, Flux, Kubernetes et Helm proviennent du dépôt officiel [CNCF artwork](https://github.com/cncf/artwork/tree/bffd512a8b625f15cf5f8e0427469380b5768e90/projects), révision `bffd512a8b625f15cf5f8e0427469380b5768e90`, respectivement sous `argo`, `flux`, `kubernetes` et `helm` dans `icon/color/`. Elles sont reproduites sans modification pour identifier les projets évoqués, sans suggérer d'affiliation ou d'approbation. Le [dépôt précise](https://github.com/cncf/artwork/blob/bffd512a8b625f15cf5f8e0427469380b5768e90/LICENSE.md) que leur utilisation est soumise aux [directives de marque de la Linux Foundation](https://www.linuxfoundation.org/legal/tm-usage), qui autorisent notamment les logos officiels non modifiés comme liens vers la page du projet, sans suggérer de parrainage ou d'approbation. Chaque icône du guide pointe vers le site du projet correspondant. Les noms et logos appartiennent à leurs détenteurs respectifs.

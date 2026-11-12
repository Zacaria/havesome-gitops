# HaveSome GitOps

Guide statique francophone pour développeurs familiers de Terraform. La lecture suit un changement depuis Git jusqu'au cluster : intention, contrôle, réconciliation, exploitation et retour arrière. L'interface est utilisable sans JavaScript ; le laboratoire est une simulation locale sans accès réseau au cluster.

Direction : carnet d'exploitation clair, encre bleu nuit, repères orange et schémas de flux. Contrairement au guide HaveSome Go existant, le fil conducteur est une boucle de contrôle plutôt qu'une présentation du langage. Hébergement séparé requis ; aucun site existant ne doit être modifié.

## Vérification locale

Depuis ce répertoire : `npm ci --workspaces=false`, `npm run build`, `python3 -m unittest discover -s tests -v`, puis `npm run test:browser` (Chromium disponible sur `/usr/bin/chromium`, ou chemin défini par `CHROMIUM`). Servir `dist/` avec `python3 -m http.server --directory dist 8000`. Les exemples sont pédagogiques et ne sont pas destinés à être appliqués à un cluster de production.

## État de cette branche

Cette branche préserve la correction de navigation et des blocs de code en revue ; elle n’est pas publiée. `main` correspond à la version actuellement servie. Un push sur ce dépôt ne déploie pas le site.

## Publication

Le projet Vercel `havesome-gitops` est séparé des autres sites. La version actuellement publiée est celle de `main` et a été déployée manuellement depuis ses fichiers statiques. Cette branche en revue construit un répertoire `dist/` mais n'a pas été publiée. Avant toute publication future, vérifier le contenu exact de `dist/` : la construction ne supprime pas les fichiers anciens. Aucun déploiement automatique Git n'est configuré.

## Navigation et exemples

Le sommaire reste accessible pendant la lecture. Son chapitre courant suit la section au niveau du repère de lecture, dans les deux sens ; avant le parcours et après celui-ci, aucun chapitre n'est marqué courant. Les liens restent des ancres utilisables sans JavaScript.

Les exemples statiques utilisent le composant officiel shadcn/ui Code Block, adapté à la palette du guide ; le contenu HTML reste lisible sans JavaScript et les actions de copie nécessitent JavaScript et un contexte sécurisé. Le laboratoire reste une simulation interactive indépendante. Les sources `src/ui/code-block.tsx` et `button.tsx` proviennent du registre officiel shadcn/ui `base-nova` (empreintes SHA-256 d'origine respectives `226b3c2e6114a8e1adaf5d594276ce0bcc92da80a6c85dfdc20478eccfbf7657` et `313353436d0fcc8e44ab470adb614b9fd013d28626f624328ea0d66d41a6c81b`) ; seuls les imports, les icônes et la traduction de l'action de copie sont adaptés. Leur licence MIT figure dans `src/ui/LICENSE.shadcn` et dans le site construit.

## Modèle du laboratoire

La dérive simulée porte sur `spec.replicas` du Deployment dans le cluster, et non sur le nombre de pods prêts. Le contrôleur GitOps peut rétablir la configuration selon ses réglages ; Kubernetes essaie ensuite de créer les pods, sans garantie de disponibilité.

## Sources

Les liens officiels sont regroupés dans le guide. Les ressources Kubernetes et GitOps supposent un contrôleur et des CRD préalablement installés. Aucun secret réel ni état Terraform ne doit être commité.

### Logos

Les icônes Argo, Flux, Kubernetes et Helm proviennent du dépôt officiel [CNCF artwork](https://github.com/cncf/artwork/tree/bffd512a8b625f15cf5f8e0427469380b5768e90/projects), révision `bffd512a8b625f15cf5f8e0427469380b5768e90`, respectivement sous `argo`, `flux`, `kubernetes` et `helm` dans `icon/color/`. Elles sont reproduites sans modification pour identifier les projets évoqués, sans suggérer d'affiliation ou d'approbation. Le [dépôt précise](https://github.com/cncf/artwork/blob/bffd512a8b625f15cf5f8e0427469380b5768e90/LICENSE.md) que leur utilisation est soumise aux [directives de marque de la Linux Foundation](https://www.linuxfoundation.org/legal/tm-usage), qui autorisent notamment les logos officiels non modifiés comme liens vers la page du projet, sans suggérer de parrainage ou d'approbation. Chaque icône du guide pointe vers le site du projet correspondant. Les noms et logos appartiennent à leurs détenteurs respectifs.

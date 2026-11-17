# HaveSome GitOps

Guide statique francophone pour développeurs familiers de Terraform. La lecture suit un changement depuis Git jusqu'au cluster : intention, contrôle, réconciliation, exploitation et retour arrière. L'interface est utilisable sans JavaScript ; le laboratoire est une simulation locale sans accès réseau au cluster.

Direction : carnet d'exploitation clair, encre bleu nuit, repères orange et schémas de flux. Contrairement au guide HaveSome Go existant, le fil conducteur est une boucle de contrôle plutôt qu'une présentation du langage. Hébergement séparé requis ; aucun site existant ne doit être modifié.

## Vérification locale

Depuis ce répertoire : `npm ci`, `npm run build`, `python3 -m unittest discover -s tests -v`, `CHROMIUM=/usr/bin/brave-browser npm run test:browser`, puis `python3 -m http.server --directory dist 8000`. Ouvrir `http://localhost:8000/`. Les exemples sont pédagogiques et ne sont pas destinés à être appliqués à un cluster de production.

## Publication

Le projet Vercel `havesome-gitops` est séparé des autres sites. La publication actuelle est manuelle : déployer uniquement le contenu construit de `dist/` depuis un répertoire isolé lié à ce projet, puis comparer les fichiers publics au commit. Ce dépôt n'est pas relié à un déploiement automatique : un push ne met pas le site à jour. La branche courante assemble le laboratoire publié et la correction de navigation, en attente de revue.

## Navigation et exemples

Le sommaire reste accessible pendant la lecture. Son chapitre courant suit la section au niveau du repère de lecture, dans les deux sens ; avant le parcours et après celui-ci, aucun chapitre n'est marqué courant. Les liens restent des ancres utilisables sans JavaScript.

Les exemples statiques utilisent le composant officiel shadcn/ui Code Block, adapté à la palette du guide ; le contenu HTML reste lisible sans JavaScript et les actions de copie nécessitent JavaScript et un contexte sécurisé. Le laboratoire reste une simulation interactive indépendante. Les sources `src/ui/code-block.tsx` et `button.tsx` proviennent du registre officiel shadcn/ui `base-nova` (empreintes SHA-256 d'origine respectives `226b3c2e6114a8e1adaf5d594276ce0bcc92da80a6c85dfdc20478eccfbf7657` et `313353436d0fcc8e44ab470adb614b9fd013d28626f624328ea0d66d41a6c81b`) ; seuls les imports, les icônes et la traduction de l'action de copie sont adaptés. Leur licence MIT figure dans `src/ui/LICENSE.shadcn` et dans le site construit.

## Modèle du laboratoire

Le laboratoire raconte une séquence locale : changement de 3 à 4 réplicas dans une nouvelle révision, validation simulée, convergence, dérive manuelle, correction automatique puis retour à la révision connue à 3. La validation et l'auto-réconciliation dépendent de la configuration réelle ; le retour arrière crée ici une nouvelle révision plutôt que de réécrire l'historique. La scène place côte à côte les trois acteurs : le registre Git (PR, contrôles, commits r1 à r3), la boucle du contrôleur qui compare les deux valeurs, et le cluster où les tours en pierre représentent la valeur déclarée et les contours en pointillés la valeur demandée par Git. Chaque acte, accessible directement depuis la frise, ajoute une phrase « Pourquoi c'est utile ». Motion anime la scène (diff, contrôles, tampon de fusion, paquets de révision, balayage de réconciliation, tours qui se construisent ou tombent) ; la pause fige les animations et leur reprise continue le mouvement. Recommencer restaure la scène initiale, et activer la réduction des animations interrompt les mouvements en cours sans laisser de styles intermédiaires. La simulation porte sur `spec.replicas` du Deployment, pas sur les pods prêts. Kubernetes essaie ensuite de créer les pods, sans garantie de disponibilité.

Le concept original conservé dans `docs/gitops-cinematic-concept.png` a été généré avec l'outil natif Codex `image_gen.imagegen` et inspecté avant l'implémentation. Son langage de plans lumineux superposés à une architecture bâtie inspire la scène ; ce n'est pas une capture de l'interface.

## Sources

Les liens officiels sont regroupés dans le guide. Les ressources Kubernetes et GitOps supposent un contrôleur et des CRD préalablement installés. Aucun secret réel ni état Terraform ne doit être commité.

### Logos

Les icônes Argo, Flux, Kubernetes et Helm proviennent du dépôt officiel [CNCF artwork](https://github.com/cncf/artwork/tree/bffd512a8b625f15cf5f8e0427469380b5768e90/projects), révision `bffd512a8b625f15cf5f8e0427469380b5768e90`, respectivement sous `argo`, `flux`, `kubernetes` et `helm` dans `icon/color/`. Elles sont reproduites sans modification pour identifier les projets évoqués, sans suggérer d'affiliation ou d'approbation. Le [dépôt précise](https://github.com/cncf/artwork/blob/bffd512a8b625f15cf5f8e0427469380b5768e90/LICENSE.md) que leur utilisation est soumise aux [directives de marque de la Linux Foundation](https://www.linuxfoundation.org/legal/tm-usage), qui autorisent notamment les logos officiels non modifiés comme liens vers la page du projet, sans suggérer de parrainage ou d'approbation. Chaque icône du guide pointe vers le site du projet correspondant. Les noms et logos appartiennent à leurs détenteurs respectifs.

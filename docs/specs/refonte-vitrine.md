# Spec — Refonte « vitrine » de limeal.fr

> Objectif : passer d'un positionnement freelance à une vitrine de profil **Software & Product Engineer (double casquette) qui développe avec l'IA (Claude Code)**, sans changer l'identité visuelle (fond `#111013`, jaune `#FBD52B`, rose `#FF007F`, Satoshi) ni la structure générale.

## Contraintes

- **Identité** : partout « **Paul (Limeal)** », connecté ou non. **Jamais de nom de famille ni d'initiale**. Pas de ville, d'employeur, d'école, de photo réelle, de CV.
- **i18n** : tout nouveau texte passe par `src/contexts/lang.json` en **4 langues** (`en`, `fr`, `es`, `kr`).
- Stack : Next 13.4 App Router, `react-icons` 4.10, **+ Chakra UI v3** (`@chakra-ui/react`, `@emotion/react`) **+ Framer Motion** (`framer-motion`). Le SCSS est entièrement remplacé.
- Animations : toujours désactivées sous `prefers-reduced-motion: reduce`.

## 0. Chakra UI & architecture

### 0.1 Mise en place
- `pnpm add @chakra-ui/react @emotion/react` ; `src/theme/index.ts` = `createSystem(defaultConfig, …)` avec les tokens :
  - couleurs `black #111013`, `surface #1d1c1f`, `surface.2 #29282c`, `lime #fbd52b`, `rose #ff007f`, `muted rgba(255,255,255,.6)`, `border rgba(255,255,255,.1)` ;
  - fonts `heading`/`body` = Satoshi (via `next/font/local` sur `public/assets/fonts/Satoshi.ttf`) ;
  - radii `card 12px`, `pill 50px` ; mode sombre forcé.
  - **recipes** : `button` (variants `primary` jaune / `outline` / `ghost` / `danger` rose), `pill` (états `active`, `accent`), `card` (variant `interactive` = hover lift + bordure lime).
- `src/app/providers.tsx` (`"use client"`) : `ChakraProvider` + `LangContextProvider` + `AuthContextProvider` + `<Toaster />`. `layout.tsx` ne garde que `<Providers>`.
- **Suppressions** : `sass` (devDep), tous les `style.scss`, `src/sass/`, `react-toastify` (→ `toaster` Chakra, mêmes messages).
- Les `width` calculés via `window.innerWidth` + listener `resize` (8 composants) sont remplacés par les props responsive Chakra (`{ base, md, xl }`) ; breakpoints alignés sur l'existant : `md: 768px`, `xl: 1280px`.

### 0.2 Arborescence
```
src/
  app/                  layout.tsx, providers.tsx, page.tsx, blog/, api/
  theme/                index.ts (tokens + recipes)
  hooks/                useReveal.ts, useActiveSection.ts
  components/
    ui/                 génériques, sans logique métier
    sections/           Hero, Skills, Approach, Portfolio, Contact
    layout/             Navigation, Footer
    features/
      auth/             AuthModal
      portfolio/        ProjectCard, ProjectFormModal (ex-CPModal)
      blog/             ArticleView, ArticleCard, ArticleFormModal (ex-CAModal), ProfileModal (ex-PFModal), ProfileBadge, BlogSection
      collection/       CollectionSection (ex-DataSection : filtres + liste + refresh + ajout admin)
  contexts/ firebase/ interfaces/ utils/   (inchangés)
```
Code mort à supprimer : `molecules/Testimonial` (non monté), `atomes/Tabs` (remplacé par `ui/NavLinks`), `splashPhrases` si inutilisé.

### 0.3 Composants génériques (`components/ui`)
Règle : **un pattern utilisé ≥ 2 fois devient générique** ; un composant utilisé une seule fois reste dans sa section. Décisions au cas par cas :

| Composant | Remplace / factorise | Props clés |
|---|---|---|
| `Button` | CTA hero, lien Contact navbar, submit contact, Login/Logout, boutons modals | `variant`, `href?` (rend un `Link`), `icon?`, `loading?` |
| `Pill` | badges hero, badges skills, filtres catégories Skills, filtres Portfolio/Blog | `icon?`, `active?`, `accent?`, `onClick?` |
| `Section` | wrapper de chaque section (id, padding, max-width, reveal) | `id`, `reveal?` |
| `SectionHeader` | titre + description de Skills, Approach, Portfolio, Blog, Contact | `title`, `description?`, `align?` |
| `Card` | ProjectCard, ArticleCard, cartes Approche | `interactive?` + slots via composition |
| `NumberedLabel` | « 01 / 02 / 03 » du formulaire contact + cartes Approche | `n`, `children` |
| `FormField` | champs du formulaire contact et des 4 modals | `label`, `n?`, `error?`, children = input |
| `Modal` | base commune des 4 modals (Chakra `Dialog`) | `title`, `open`, `onClose`, `footer?` |
| `SocialLinks` | icônes GitHub + Discord (copie pseudo + toast) dans Contact et Footer | `size?` |
| `NavLinks` | liens d'ancres navbar desktop + menu mobile | `links`, `activeId?`, `direction` |

**Non génériques** (usage unique) : Hero, illustration du hero, Footer, `LanguageSelect` (reste dans `layout/Navigation`).

### 0.4 Conventions
- Un dossier par composant : `index.tsx` (+ `*.recipe.ts` si styles spécifiques). Pas de styles inline hors props Chakra.
- `"use client"` seulement là où il y a état/contexte ; les composants `ui` purs restent compatibles serveur quand c'est possible.
- Données statiques (skills, cartes approche, badges hero) dans `src/data/*.ts` typés, pas dans les composants.

## Ordre de la page

```
Navigation (sticky)
Hero              #about-me
Manifesto         (bio, mot par mot)
Skills            #skills
Approche (NEW)    #approach
Portfolio         #portfolio
Contact           #contact-me
Footer (Credits)
```

---

## 1. Fondations

### 1.1 Couleurs
Toutes les couleurs passent par les tokens du thème Chakra (§0.1). Plus aucune couleur en dur (`#963696`, `#fbd52b` inline, etc.). Dans le texte ci-dessous, `--lime`, `--surface`… désignent ces tokens.

### 1.2 Animations (Framer Motion, esprit Apple)

- `MotionConfig reducedMotion="user"` global.
- `ui/Reveal`, `RevealGroup`, `RevealItem` : fade + translateY + blur à l'entrée dans le viewport, stagger.
- `ui/ScrollText` : la bio s'illumine mot par mot au défilement (section Manifesto).
- Hero : titre qui sort d'un masque ligne par ligne, parallaxe (texte qui monte/s'efface, portrait plus lent + léger zoom).
- Skills : pastille active qui glisse d'un onglet à l'autre (`layoutId`), ruban qui glisse latéralement.
- Approche : cartes sticky empilées, la précédente rétrécit quand la suivante arrive.
- Navbar qui se cache en descendant / réapparaît en remontant ; barre de progression lime en haut.
- Cartes : lift au survol, zoom de la miniature.

### 1.2 bis (remplacé) Apparition au scroll
- Nouveau hook `src/utils/useReveal.ts` : `IntersectionObserver` qui ajoute `.is-visible` sur `[data-reveal]` (une seule fois, `threshold: .15`).
- CSS global : `[data-reveal]{opacity:0;transform:translateY(16px);transition:.6s ease}` / `.is-visible{opacity:1;transform:none}` ; neutralisé sous `prefers-reduced-motion`.
- Appliqué aux titres + conteneurs de Skills, Approche, Portfolio, Contact.

### 1.3 Fix ancres
`defaultTabs` (`src/utils/constant.ts`) pointe vers `#about` alors que le hero a `id="about-me"` → corriger en `#about-me`. Ajouter l'onglet `#approach` (`tabs--approach`).

---

## 2. Navigation — `components/atomes/Navigation`

- **Sticky + blur** : `position: sticky; top: 0; z-index: 50; background: rgba(17,16,19,.75); backdrop-filter: blur(12px)`. Le menu mobile (`top: 73px`, absolu) reste positionné sous la nav.
- **Login retiré** de la navbar publique (desktop + menu mobile) **quand l'utilisateur n'est pas connecté**. Connecté : bouton Logout + lien Blog inchangés.
- **Lien actif** : la section visible (via `IntersectionObserver`) donne la classe `.active` à l'onglet correspondant (couleur `--white`, soulignement jaune 2px).
- Remplacer `backgroundColor` inline `#963696` / `#FF007F` / `#fbd52b` par des classes SCSS.

## 3. Hero — `components/molecules/Hero`

| Élément | Avant | Après |
|---|---|---|
| H1 | `Paul (Limeal)` | inchangé |
| H2 `hero--job` | Développeur Full-Stack / Product Engineer | **Software Engineer / Product Engineer** (identique dans les 4 langues) |
| Bloc avatars « 1+ Clients satisfaits » + `hero--satisfied--*` | présent | **supprimé** → rangée de badges |
| Liste d'onglets répétée (`<Tabs>`) | présente | **supprimée** → 2 CTA |
| Bulle « Cet homme est beau » (`hero--image--quote`) | présente | **supprimée** (la spirale + cercle jaune restent ; le cercle affiche une icône `→` lien vers `#portfolio` ; connecté : lien Blog conservé) |
| Bio `hero--image--description` | texte générique | nouvelle bio produit/IA |
| Bandeau logos bas de hero + logique swipe (`touchStart`…) | présent | **supprimé** (code + styles `> ul`) |

**Badges** (pills `--surface-2`, icône `react-icons/si` + label) :
`TypeScript` · `React / Next.js` · `Go` · `C` · `PostgreSQL` · `Claude Code` (badge accent : bordure `--lime`).

**CTA** :
- Primaire « Voir mes projets » → `#portfolio` (fond `--lime`, texte `--black`, flèche `arrow_link.svg`).
- Secondaire « Me contacter » → `#contact-me` (contour 1px `--border`, hover bordure `--lime`).

**Nouvelle bio** (clé `hero--image--description`) :
- **fr** : « Software & product engineer, je pars du besoin utilisateur jusqu'à la mise en production : back-end en Go ou Node, interfaces React, et Claude Code au quotidien pour livrer plus vite sans sacrifier la qualité. J'aime autant le code bas niveau que le détail d'une UI. »
- **en** : "Software & product engineer — I take ideas from user need to production: Go or Node back-ends, React interfaces, and Claude Code every day to ship faster without cutting corners. I care as much about low-level code as about UI details."
- **es / kr** : traductions équivalentes.

Clés i18n : **ajout** `hero--cta-projects`, `hero--cta-contact` ; **suppression** `hero--satisfied--title`, `hero--satisfied--content`, `hero--image--quote`.

Assets devenus inutiles (à supprimer) : `public/assets/images/logos/*`, `public/assets/images/testimonials/*` (vérifier qu'aucun autre composant ne les utilise — `Testimonial` n'est pas monté dans `page.tsx`).

## 4. Skills — `components/molecules/Skills` + `atomes/SkillCard`

### 4.1 Données — `Skills/data.json`
Format : `{ "<catégorie>": [{ "name": string, "icon"?: string }] }` — **plus de `stars`**.
`icon` = nom d'export `react-icons/si` (ex. `SiTypescript`), résolu via une map statique dans `SkillCard` (pas d'import dynamique de toute la lib). Sans icône → pastille jaune.

Ordre des onglets :
1. **`ia`** (label « IA & outils ») : Claude Code, Agents & sub-agents, MCP, Prompt engineering, Claude API
2. **`produit`** (label « Produit ») : Discovery & besoin utilisateur, UX / UI, Analytics, A/B testing, Roadmap & priorisation
3. `langages`, `frameworks`, `databases`, `cms`, `apis` (contenu actuel, sans notes)

Labels d'onglets : passer par i18n (`skills--cat--ia`, `skills--cat--produit`, `skills--cat--langages`, …) au lieu de `key.charAt(0).toUpperCase()`.

### 4.2 Rendu
- `SkillCard` devient un **badge** : icône 18px + nom, `--surface`, radius 50px, padding `8px 16px`, largeur auto ; liste en `flex-wrap` gap 8px. Hover : bordure `--lime`.
- Suppression de `AiFillStar` et de l'affichage de la note.
- Texte `skills--description` réécrit (sans « innombrables heures ») : *« Ma boîte à outils : des fondamentaux bas niveau aux frameworks modernes, avec l'IA et la culture produit au cœur de ma façon de travailler. »*

## 5. Nouvelle section « Approche » — `components/molecules/Approach`

`<section id="approach">`, titre `approach--title` = « Ma façon de travailler ».
3 cartes (grid 1 col mobile / 3 col ≥1280px), fond `--surface`, radius 12px, numéro `01/02/03` en jaune (rappel du style du formulaire de contact), hover lift `translateY(-4px)` + bordure `--lime`.

| # | Titre (fr) | Texte (fr) |
|---|---|---|
| 01 | Comprendre le besoin | Avant d'écrire du code, je cherche le problème réel : pour qui, pourquoi, et comment on saura que ça marche. |
| 02 | Livrer vite, itérer | Claude Code et des agents IA dans ma boucle de dev : prototypes rapides, tests, revues — je garde la main sur l'architecture et la qualité. |
| 03 | Soigner le détail | Performance, accessibilité, finitions d'UI : ce qui fait qu'un produit est agréable à utiliser. |

Clés : `approach--title`, `approach--description`, `approach--1-title`, `approach--1-text`, … `approach--3-text` (4 langues). Ajouté dans `page.tsx` entre `<Skills />` et `<Portfolio />`.

## 6. Portfolio — `DataSection/Portfolio` + `atomes/ProjectCard`

- **Suppression du prix** (`project.price`) à l'affichage. Le champ Firestore et le formulaire admin `PFModal` restent intacts (aucune migration).
- `portfolio--description` : *« Une sélection de projets personnels, d'équipe et d'expérimentations produit. »* (4 langues).
- Hover carte : `translateY(-4px)`, bordure `--lime`, zoom miniature `scale(1.03)` (overflow hidden sur `.thumbnail`).
- Liens GitHub / externe : taille d'icône 24px, hover `--lime`.

## 7. Contact — `molecules/ContactMe`

- `contact-me--title` : « Écrivons-nous » / "Let's talk" / « Hablemos » / « 이야기해요 ».
- `contact-me--description` : *« Une opportunité, une idée de produit ou juste une question ? Laisse un message, je réponds rapidement. »* (plus de « nous », plus de « 24 heures »).
- `contact-me--q3` : « Quel est l'objet ? » ; options du `<select>` (valeurs envoyées par mail) : `Opportunity`, `Collaboration`, `Question`, `Other`, labels traduits via `contact-me--subject--*`. Valeur par défaut du state `type` mise à jour en conséquence.
- Placeholders (`Type your full name`, `I want...`) passés en i18n.
- Template `emails/ContactEmail.tsx` : renommer le libellé « Service » → « Objet / Subject » s'il est affiché.

## 8. Footer — `atomes/Credits`

- `user ? "Paul G." : "Limeal"` → **`"Paul (Limeal)"`** sans condition (suppression de l'initiale).
- Navbar (logo) : `user ? "Paul." : "Limeal."` → **`"Paul (Limeal)"`** sans condition (version courte `Limeal` sous `md` si ça ne tient pas).
- `ProjectCard` : suppression du `replace("Limeal", "Paul")` conditionnel, le nom du projet s'affiche tel qu'en base.
- **Suppression de « Conçu par / Designed by »**.
- Ajout d'une ligne : liens GitHub + bouton Discord (copie pseudo, même logique que Contact).
- **Accès login discret** : petit lien texte `--muted` « Connexion » qui ouvre `AuthModal` (visible uniquement si non connecté).

## 9. SEO — `src/app/layout.tsx`

```ts
title: "Paul (Limeal) — Software & Product Engineer",
description: "Software & product engineer : du besoin utilisateur à la prod, avec Go, React et Claude Code.",
keywords: ["Limeal", "Software Engineer", "Product Engineer", "Claude Code", "Next.js", "Go"],
```
`<html lang>` : laisser `en` (la langue est choisie côté client dans `LangContext` ; un `lang` dynamique est hors périmètre).

---

## Hors périmètre
Page détail projet, image Open Graph, section Parcours/timeline, refonte du blog, upgrade Next.

## Vérification
- `pnpm build` + `pnpm lint` OK.
- Parcours manuel à 375px, 768px, 1280px+ : nav sticky, ancres (dont `#about-me`, `#approach`), onglets skills, hover cartes, formulaire de contact envoyé.
- Changer de langue (fr/en/es/kr) : aucune clé brute affichée.
- `grep -rn "G\." src` ne renvoie plus l'initiale ; aucun nom de famille dans le code.
- `prefers-reduced-motion` activé : aucune animation de reveal.

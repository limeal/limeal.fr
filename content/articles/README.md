# Articles publics

Un dossier par article : `content/articles/<slug>/<langue>.mdx`. Le `<slug>` devient l'URL
(`/articles/fr/<slug>`) : en minuscules, avec des tirets, les mots-clés visés en premier.

Langues : `en`, `fr`, `es`, `kr`. Écris l'article dans **une** langue ; Claude écrit les
autres (skill `write-article`). Pour savoir lesquelles manquent ou sont périmées :

```sh
pnpm articles:status
```

Chaque traduction porte `translatedFrom` et le `sourceHash` de l'original dont elle vient :
modifier l'original la rend périmée. Si tu en corriges une à la main, supprime sa ligne
`translatedFrom` : elle compte alors comme écrite à la main et n'est plus signalée.

## Frontmatter

```yaml
---
title: Le titre (≈ 60 caractères max, mot-clé principal au début)
description: La meta description, 200 caractères max (viser 140–160)
date: 2026-11-01
updated: 2026-12-01   # optionnel
tags: [claude-code, product]
cover: /images/articles/<slug>/cover.svg   # optionnel : image de la carte (1200 × 630)
draft: true           # optionnel : visible seulement avec `pnpm dev`
---
```

Le corps est du Markdown (+ GFM : tableaux, cases à cocher) et accepte le JSX MDX.
Commence les sections à `##` : le `#` est le titre de la page.

Les images vont dans `public/images/articles/<slug>/` et s'insèrent avec
`![texte alternatif](/images/articles/<slug>/image.svg)`. Garde le texte des images neutre
(noms, chiffres, dates) : il n'est pas traduit, contrairement au texte alternatif.

Les articles sont servis sur les deux domaines mais leur URL canonique est pauldev.fr :
le mot « Limeal » y est interdit (le build échoue s'il apparaît).

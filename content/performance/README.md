# Performances des articles

Exports lus par le skill `write-article` pour savoir ce qui marche. Dépose ici les fichiers
bruts, sans les renommer ni les retoucher :

- **Google Search Console** (Performances → Résultats de recherche, filtre Page contient `/articles/`,
  période 3 ou 6 mois → Exporter → CSV) : dézippe dans `gsc-<AAAA-MM-JJ>/`
  (contient `Requêtes.csv`, `Pages.csv`…).
- **Vercel Analytics** (optionnel, onglet Analytics → Pages → export) : `vercel-<AAAA-MM-JJ>.csv`.

Le skill utilise l'export le plus récent de chaque source.

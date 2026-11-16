# CRTV Studios — site de présentation (brief de transfert)

Ce fichier résume toute la discussion de cadrage avec Neelsen (fondateur) pour que Claude Code puisse construire et faire évoluer le site sans repartir de zéro. Langue du site et des échanges : français.

## Objectif du site
- Site de présentation d'une page (mobile d'abord), destiné au lien en bio du compte Instagram CRTV Studios. Le trafic arrive depuis un téléphone.
- Mission : en 10 secondes, comprendre ce que fait CRTV, voir les prix, demander un devis (ou écrire en DM Instagram).
- Neelsen enverra des exemples de sites et des liens d'inspiration : les intégrer au design au fur et à mesure.

## L'entreprise
- CRTV Studios : agence de production audiovisuelle (production uniquement, pas de campagnes publicitaires). Shorts, reels, TikTok, clipping de streams, vidéos YouTube longues, contenus professionnels.
- Cibles : marques, boutiques, créateurs, streamers, tout business qui a besoin de vidéo (fast-food, trading, services, instituts…). Push prévu sur les nouveaux créateurs et streamers avec la sortie de GTA 6.
- Fonctionnement : production presque entièrement prise en charge (le client demande, CRTV s'occupe du reste), devis sur mesure, réseau de monteurs freelances qualifiés. Chaque livraison est validée par CRTV avant envoi au client.
- Géographie : fondateur en Île-de-France, travail à distance, clients en France, Suisse et Belgique.
- Équipe : Neelsen (fondateur, président, direction, prospection, relation client), Lucas Magré (associé, comptabilité et trésorerie). SAS prévue, immatriculation début janvier 2027 (75 % / 25 %).
- Valeurs : créativité, réactivité, tendance, professionnalisme, fiabilité.
- Ligne rouge : ne jamais prétendre à une expertise qu'ils n'ont pas ; aucun contenu discriminatoire, haineux, trompeur ou illégal ; toutes les collaborations sont écrites et signées.
- Clients actuels : Luna Esthétique (institut de beauté, Suisse, reel Instagram), Bella Consulting (agence qui accompagne des créatrices beauté), Andri Sogood (influenceur, clipping de ses streams Twitch).

## Offres et prix (HT)
- Short Solo : 65 € (1 short, livraison 48 h)
- Pack Boost : 250 € (5 shorts, livraison 5 jours)
- Pack Pro : 480 € (8 shorts, rythme 2 par semaine)
- Clipping 15 : 350 € (15 clips tirés de streams, vlogs ou vidéos longues)
- Clipping 30 : 520 € (30 clips, prix dégressif)
- Vidéo YouTube : Simple 240 €, Standard 400 €, Premium 640 € (environ 12 min, dérushage, étalonnage, sous-titres, mixage, motion design : détail à confirmer)
- Projets sur mesure : sur devis (films, journées de tournage, collaborations publicitaires, contenus professionnels d'envergure)
- Paiement : 100 % d'avance pour les packs et petites prestations, 50 % / 50 % pour les gros projets. Les fonds ne sont débloqués qu'après livraison et satisfaction du client, sinon remboursement.
- Réponse aux devis sous 24 h.

## Charte et ton
- **v3 (16/11/2026), demandée par Neelsen : site sombre et animé, « devanture noire », style corporate type motion design.** Fond nuit (#05060d), blanc sur noir et blanc sur bleu (nuances de bleu nuit à bleu électrique #2f2bff), reflets et jeux de lumière, touche de couleur en dégradé fuchsia #ff2f8e → abricot #ff9c55 sur le logo, les prix et les survols. Cette demande remplace l'ancienne règle « pas d'animations décoratives » ; `prefers-reduced-motion` coupe toujours tout mouvement.
- Mouvement : le logo se range dans l'en-tête au défilement (avec reflet au sol), reflet lumineux qui balaie le logo, lumières lentes dans le hero, bandeau défilant des formats, mots du manifeste qui s'allument au scroll, révélations, reflet qui suit le pointeur sur les cartes, ligne de progression de la méthode.
- Offres séparées en 3 volets, comme le business plan (section 6.1) : Offre 1 Jeunes créateurs (Short Solo, Pack Boost, Pack Pro) ; Offre 2 Packs de clipping (15, 30) ; Offre 3 Projets sur mesure (Vidéo YouTube « dès 240 € », collaboration publicitaire et contenus d'envergure sur devis, plus une ligne « photo, graphisme et logo sur devis »). Choix validés par Neelsen le 16/11.
- Logo : lettres « liquides » en forme de cercle. Original blanc sur noir dans `sources/`. Sur le site : SVG vectorisé (`public/assets/logo.svg` noir, `logo-blanc.svg` blanc), fond transparent, plus besoin de `mix-blend-mode`.
- Ton : direct, jeune, fiable ; phrases courtes ; vouvoiement (tranché par Neelsen).
- Éviter les promesses non confirmées et les chiffres inventés.

## À confirmer / à brancher
- Lien Instagram et adresse mail pro (placeholders dans index.html, repérés par `TODO`).
- Accord des clients pour afficher leur nom et leurs vidéos ; vidéos de réalisations à ajouter.
- Contenu exact des packs YouTube ; promesse de remboursement à valider avec Lucas et le comptable.
- Formulaire de devis relié à Brevo (étape suivante du plan).
- Mentions légales : à compléter après immatriculation de la SAS.
- Nom de domaine à réserver.

## État du chantier (mis à jour le 16/11/2026)

### Fait
- v1 importée (commit d'origine), refonte v2 (claire), puis v3 sombre et animée (16/11), reconstruite de zéro sur la même base technique.
- Structure : `public/` = tout ce qui est publié ; `functions/api/devis.js` = fonction serveur du formulaire (Cloudflare Pages) ; `tests/` (`npm test`) ; `scripts/` (aperçu local, compression vidéo) ; `sources/` (logos d'origine, non publiés).
- Page d'accueil : index des prix dans le premier écran, grille de prix en grande typo (pièce forte) qui présélectionne l'offre dans le formulaire, bandeau streamers GTA 6, réalisations (emplacements vidéo prêts), méthode en 4 étapes, FAQ, formulaire de devis, barre d'action fixe sur mobile (apparaît après le premier écran, disparaît sur le formulaire).
- Formulaire : nom, mail, réseau/chaîne, besoin (liste des offres), message, case actualités facultative. Contrôle des champs, anti-spam (champ piège, délai 3 s, origine, Turnstile optionnel), confirmation, repli mailto si l'envoi échoue, fonctionne aussi sans JavaScript (redirection `merci.html` / `erreur.html`).
- Envoi : API Brevo (mail vers l'adresse pro + ajout du contact). Clés uniquement en variables d'environnement (`.env.example`).
- Référencement : title, description, Open Graph + image 1200×630, JSON-LD, canonical, sitemap.xml, robots.txt, favicon SVG + PNG, manifest.
- Pages légales provisoires (`mentions-legales.html`, `confidentialite.html`) avec champs `[À COMPLÉTER]`.
- Statistiques : emplacement Plausible prêt (commenté), événements personnalisés déjà émis. Lien bio avec UTM dans `DEPLOIEMENT.md`.
- Contrôles v3 du 16/11 : Lighthouse accueil mobile 95/100/100/100, bureau 100/100/100/100 ; axe 0 violation (animations actives ou réduites) ; aucun débordement de 320 à 1440 px ; parcours formulaire testé.
- Aperçu privé consultable : https://claude.ai/artifact/9rU9tzDokt694c9zUUSQW4 (le formulaire n'y envoie rien).

### Décisions
- Police Bricolage Grotesque auto-hébergée et réduite (pas d'appel à Google Fonts : vitesse et RGPD).
- Aucun framework ni dépendance d'exécution. CSS et JS en fichiers séparés (cache + CSP stricte sans `unsafe-inline`).
- Noms des clients retirés tant que leur accord n'est pas confirmé : cartes anonymisées (« Institut de beauté, Suisse »…).
- Phrase de remboursement non publiée (commentaire dans `index.html`) en attente de Lucas et du comptable.
- Contenu des niveaux YouTube : seuls les prix sont affichés, le détail « dans le devis ».
- Hébergement recommandé : Cloudflare Pages (voir `DEPLOIEMENT.md`). Rien n'est publié ni acheté sans accord.
- Les sites de référence (whop.com, pomelofactory.com) sont bloqués par le réseau de l'environnement de travail. Accès réseau à pomelofactory.com proposé le 16/11 puis refusé : la v3 est construite d'après la description de Neelsen. Nouvelle référence flashy-editing.fr (16/11) : également inaccessible, accès réseau refusé ; attendre des captures.

### Reste à faire
- Infos de Neelsen : URL Instagram, adresse mail pro, nom de domaine, accord des clients + vidéos, contenu des niveaux YouTube, validation de la phrase de remboursement.
- Remplacer les `TODO` (`grep -rn TODO public/`).
- Mise en ligne (après accord) : Cloudflare Pages, domaine, Brevo (domaine authentifié, expéditeur, clé, listes), Plausible.
- Après immatriculation de la SAS (janvier 2027) : compléter les pages légales.
- Analyser les références dès qu'elles sont accessibles (captures ou accès réseau).

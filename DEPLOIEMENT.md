# Mise en ligne du site CRTV Studios

Rien n'est publié ni acheté tant que Neelsen n'a pas donné son accord. Ce guide prépare chaque étape.

## 1. Hébergement recommandé : Cloudflare Pages (gratuit)

| | Cloudflare Pages | Netlify | Vercel |
|---|---|---|---|
| Prix pour ce site | Gratuit | Gratuit | Gratuit (usage non commercial seulement) |
| Formulaire côté serveur | Inclus (Pages Functions, 100 000 requêtes/jour) | Inclus (Functions ou Netlify Forms, quota limité) | Inclus |
| Bande passante | Illimitée | Quota mensuel | Quota mensuel |
| HTTPS | Automatique | Automatique | Automatique |
| Statistiques sans cookie | Cloudflare Web Analytics inclus | Payant | Payant |

**Choix : Cloudflare Pages.** Gratuit pour un usage commercial, la fonction du formulaire (`functions/api/devis.js`) y tourne sans modification, et les en-têtes de sécurité (`public/_headers`) sont pris en compte. Le plan gratuit de Vercel interdit l'usage commercial.

### Étapes (environ 15 minutes)
1. Créer un compte sur dash.cloudflare.com.
2. Workers & Pages → Create → Pages → Connect to Git → choisir le dépôt GitHub `CRTVStudios-`.
3. Réglages de build :
   - Framework preset : **None**
   - Build command : *(vide)*
   - Build output directory : **public**
4. Settings → Variables and Secrets : ajouter les variables listées dans `.env.example`. `BREVO_API_KEY` en type **Secret**.
5. Déployer. Le site est en ligne sur `crtv-studios.pages.dev`. Tester le formulaire.
   - Pour tester le formulaire sur l'adresse `pages.dev`, rien à faire : l'origine du site est acceptée automatiquement.

## 2. Nom de domaine

Proposition : **crtvstudios.fr** (public français, suisse et belge ; le `.fr` inspire confiance en France). Réserver aussi **crtvstudios.com** si disponible, pour éviter qu'un tiers le prenne, avec une redirection vers le `.fr`.

- Domaine acheté par Neelsen le 17/11 : **crtvstudios.fr**, chez IONOS (boîte mail contact@crtvstudios.fr créée chez IONOS).
- `.com` : possible directement chez Cloudflare Registrar (prix coûtant, environ 10 € par an).

Vérifier la disponibilité au moment de l'achat : elle n'a pas été contrôlée ici.

### Brancher le domaine et le HTTPS
1. Dans Cloudflare : Add a site → `crtvstudios.fr` → plan Free. Cloudflare donne deux serveurs de noms.
2. Chez le registraire : remplacer les serveurs DNS par ceux de Cloudflare (propagation : de quelques minutes à 24 h).
3. Projet Pages → Custom domains → ajouter `crtvstudios.fr` et `www.crtvstudios.fr`.
4. Le certificat HTTPS est créé et renouvelé automatiquement. Dans SSL/TLS : mode **Full (strict)**, activer **Always Use HTTPS**.
5. Si le domaine final n'est pas `crtvstudios.fr`, remplacer l'adresse dans : `public/index.html` (balises canonical, og:, JSON-LD), `public/sitemap.xml`, `public/robots.txt`, les pages légales et la ligne Plausible.

## 3. Adresse mail pro

- **Recevoir** : Cloudflare Email Routing (gratuit) fait suivre `contact@crtvstudios.fr` vers une boîte existante (Gmail…).
- **Envoyer depuis l'adresse pro** : une vraie boîte (Google Workspace, Zoho Mail, OVH Mail…) ou l'envoi SMTP de Brevo branché dans Gmail.

## 4. Brevo (formulaire et contacts)

1. Brevo → Expéditeurs, domaines et IP → **Domaines** : authentifier `crtvstudios.fr` (Brevo donne les enregistrements DKIM, SPF et DMARC à coller dans le DNS Cloudflare). Sans cela, les mails risquent de finir en indésirables.
2. **Expéditeurs** : ajouter l'adresse utilisée dans `SENDER_EMAIL` (ex. `site@crtvstudios.fr`).
3. **SMTP & API → Clés API** : créer une clé, la coller dans Cloudflare (`BREVO_API_KEY`, type Secret). Jamais dans le code ni dans un message.
4. **Contacts → Listes** : créer « Demandes de devis » et, si besoin, « Actualités ». Reporter leurs numéros dans `BREVO_LIST_ID` et `BREVO_NEWSLETTER_LIST_ID`.
5. Vérifier le nom de l'attribut du nom de famille dans Contacts → Paramètres → Attributs (`NOM` ou `LASTNAME`) et le mettre dans `BREVO_NAME_ATTRIBUTE`.

Ce que fait la fonction : elle envoie un mail à `CONTACT_TO_EMAIL` (répondre au mail répond directement au client), puis ajoute le contact dans la liste. Si l'ajout du contact échoue, la demande reste reçue.

### Anti-spam
Déjà actif : champ piège invisible, délai minimal de 3 secondes, contrôle de l'origine, validation stricte côté serveur.
Si du spam passe malgré tout, activer Cloudflare Turnstile (gratuit) : créer un widget, mettre la clé de site dans l'attribut `data-turnstile-sitekey` du formulaire (`public/index.html`) et la clé secrète dans `TURNSTILE_SECRET_KEY`.

## 5. Statistiques sans cookie

**Recommandé : Plausible** (hébergé dans l'UE, sans cookie, pas de bandeau de consentement, lit les paramètres UTM). Environ 9 € par mois, essai gratuit de 30 jours.
Alternative gratuite : Cloudflare Web Analytics (sans cookie, mais ne détaille pas les UTM) ou Umami Cloud (offre gratuite limitée).

Activation de Plausible :
1. Créer le site `crtvstudios.fr` sur plausible.io.
2. Copier le script fourni par Plausible à la place du bloc commenté « Statistiques sans cookies » dans `public/index.html`.
3. Si le script vient d'un autre domaine que `plausible.io`, l'ajouter aux lignes `script-src` et `connect-src` de `public/_headers`.
4. Dans Plausible, créer les objectifs (Goals → Custom event) : `Devis envoyé`, `Choix offre`, `Clic CTA`, `Lecture vidéo`. Le site les envoie déjà.

### Lien de la bio Instagram

```
https://crtvstudios.fr/?utm_source=instagram&utm_medium=social&utm_campaign=bio
```

Instagram n'envoie pas toujours sa provenance : sans ce paramètre, beaucoup de visites apparaîtraient en « accès direct ». Pour une story ou une campagne précise, changer seulement `utm_campaign` (ex. `utm_campaign=story-gta6`).

## 6. Avant d'ouvrir au public

- [ ] Remplacer chaque `TODO` (`grep -rn TODO public/`) : Instagram, mail pro, domaine.
- [ ] Compléter les champs `[À COMPLÉTER]` des pages légales (après immatriculation de la SAS).
- [ ] Envoyer une vraie demande de test et vérifier la réception, la réponse au client et l'ajout dans Brevo.
- [ ] Ajouter les vidéos validées par les clients.
- [ ] Déclarer le sitemap dans Google Search Console.

## Outils locaux (facultatifs, aucune dépendance)

- `npm test` : tests de la fonction du formulaire.
- `SIMULER_BREVO=1 node scripts/serveur-local.js` : aperçu sur http://localhost:8788, formulaire compris, sans envoyer de vrai mail.
- `scripts/compresser-video.sh source.mov nom` : prépare une vidéo verticale (MP4 720×1280 + affiche WebP) dans `public/assets/videos/`.
- Alternative officielle : `npx wrangler pages dev` (lit `.dev.vars`).

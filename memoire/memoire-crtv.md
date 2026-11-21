# Mémoire CRTV Studios (à lire au début de chaque session et à chaque bilan)

Source de vérité durable du projet (le conteneur de travail est effacé entre les sessions ;
seul ce dépôt GitHub reste). Le site est décrit en détail dans `CLAUDE.md` ; ce fichier
résume TOUT le reste et pointe vers les détails. Mettre à jour à chaque décision.

## 1. L'entreprise
- CRTV Studios : production audiovisuelle à distance (Île-de-France), pour toute la zone francophone.
  Production uniquement (pas de gestion de pubs ni de community management).
- Neelsen MAYI (fondateur, prospection, relation client ; tutoiement avec Claude).
  Lucas Magré (associé, compta/trésorerie). SAS prévue début janvier 2027 (75/25).
- Réseau de monteurs freelances (ne JAMAIS dire « en interne » ni « des centaines »).
- Offres HT : Short Solo 65 € (48 h) · Pack Boost 250 € (5 shorts, 5 j) · Pack Pro 480 € (8 shorts, 2/sem)
  · Clipping 15 : 350 € · Clipping 30 : 520 € · YouTube dès 240 € (240/400/640) · sur mesure sur devis (48 h)
  · graphisme, photo, contenu IA (freelances) sur devis. Réponse aux demandes sous 24-48 h.
- Clients réels : Luna Aesthetic (institut, Suisse), AndrySoGood (créateur, clipping Twitch),
  Le 144 (média basket), Bella Consulting (pas de nom public sans accord écrit).

## 2. Règles de communication (validées par Neelsen)
- Vouvoiement du public. Ton direct, jeune, fiable. Aucun chiffre inventé, aucune promesse de vues.
- À l'oral (voix off) : « Creative Studios ». À l'écrit et à l'écran : « CRTV Studios » / logo CRTV.
- Pas de prix dans les vidéos (prix sur le site et en DM seulement).
- GTA 6 : uniquement dans les reels clipping et YouTube (jamais « sur devis » à l'écran).
  Sticker Lucia & Jason autorisé par Neelsen (risque droits assumé, à retirer sur demande) ;
  à éviter dans les pubs payantes. Mention « GTA VI est une marque de Rockstar Games… » sur le site.
- Extraits clients dans les reels : uniquement Luna Aesthetic et AndrySoGood, < 1 s, sans son,
  jamais dans les reels GTA/clipping. Le 144 : site uniquement.
- Reels : faceless, voix off + texte à l'écran + motion design, 4-5/semaine (1/jour au lancement).
- Mots-clés : CLIP (créateurs/streamers), DEVIS (commerces, pros, médias).
- DM : d'abord « Pourriez-vous nous décrire votre projet ? », PUIS la formule + crtvstudios.fr.
  2 relances max (J+4, J+10). Modèles : `instagram/dm-types.md`.
- Pas de nom ni de @ en plus du logo dans les vidéos. Pas de « Sortie de GTA 6 » en sur-titre.
- Aucune publication, aucune dépense, aucune réponse publique sans accord explicite de Neelsen.

## 3. Instagram
- Compte @crtvstudios_ (compte pro, Instagram Login, PAS encore relié à une page Facebook).
  ID Windsor : 17841421474445876. Nom « CRTV STUDIOS | Montage vidéo » (fait le 21/11).
  Bio actuelle (Neelsen) : « NOUS CRÉONS VOS IDÉES 💡 » + liste — manque « Écrivez DEVIS en DM ».
- Reels d'essai (trial) : REFUSÉS par Instagram (trop peu d'abonnés), 20/11.
- Windsor ne programme pas : pour publier à une heure, Claude met la vidéo temporairement dans
  `public/media-temp/` de la branche (lien d'aperçu Cloudflare), publie via `create_video_post`
  à l'heure (tâche planifiée), puis retire le fichier. Si le délai expire : vérifier avant de republier.
- Publications (détail et stats : `instagram/log.md`, relevés : `instagram/stats/`) :
  01 GTA clipping (19/11 10 h 11) · 05 GTA YouTube (20/11 14 h 26) · 01b GTA nouvelle accroche
  (21/11 10 h 33, publié par Claude) · 02 Combien ça coûte (21/11 12 h 10, Neelsen) ·
  04 Médias/pros (22/11 19 h 10) · 03 Commerces + Luna (23/11 14 h 40).
- Leçons : voir « Ce qui marche » dans `instagram/voice.md` (accroche lisible dès l'image 1,
  s'adresser à la cible ; 62 % d'abandon à 3 s sur le 01).
- Stories à la une prêtes (`instagram/stories/png/`) : Comment ça marche (m1-m5 + c-how),
  Réalisations (vidéos Luna, AndrySoGood + r-fin + c-real). Idées : `instagram/stories/idees.md`.
- Bio : 3 options rédigées (A conseillée). Légendes : `instagram/legendes/`. Planning : `instagram/plan.md`.

## 4. Production vidéo (comment refaire un reel)
- Scripts → voix ElevenLabs (connecteur Claude, offre Starter prise le 19/11) :
  voix « Hugo – Punchy French Creator » voice_id 3Tp5mYhT9wrfnry9pzvV, modèle eleven_v4,
  generations_count 1. Flow ElevenLabs de travail : pQVStBArmnJ0l9jyEnoD.
- Nettoyage voix (ffmpeg) : highpass 90, EQ -4 dB à 320 Hz, -1,5 dB à 800 Hz, +2 dB à 4 kHz,
  de-esser, compresseur, loudnorm -14 LUFS (commande dans l'historique : voir `instagram/reels/*/`).
- Minutage des mots : transcription ElevenLabs Scribe (gratuite) → `data-s` des mots.
- Animation : `instagram/reels/<dossier>/motion/reel.html` + base commune `instagram/reels/_base/`
  (base.css, base.js : fond, grain, mots, logo rangé, CTA ; `hookEnd` = accroche visible dès l'image 1).
  Icônes : `python3 instagram/reels/_base/icons.py <reel.html>`. Attention : ne jamais nommer un
  élément #b1/#b2/#b3 (halos du fond).
- Rendu : `node instagram/reels/render.cjs instagram/reels/<dossier> --duration N` (offset 0).
- Effets sonores : bibliothèque `instagram/reels/_base/sfx/ok/` (cut, ding, glitch, impact, pop,
  printer, riser, shine, tick, typing, whoosh), repères dans `<dossier>/sfx.json`.
- Mixage final : `python3 instagram/reels/_base/mix.py instagram/reels/<dossier> CRTV-reel-<dossier>
  --music instagram/reels/_base/musique/<morceau>.mp3 --music-gain -10` (électro hip-hop : -12.5).
  Effets à -4 dB sous la voix, musique baissée sous la voix (sidechain). Reels 01 et 05 : `--offset 0.2`.
  Musiques originales ElevenLabs (usage pub OK) : synthwave (GTA), electro-hiphop (créateurs, médias),
  chill-house (commerces). Livraison : `instagram/livraison/` (sans musique : `livraison/sans-musique/`).
- Fichiers > 10 Mo : pas d'envoi via le Drive (limite du connecteur) → SendUserFile dans l'app Claude.

## 5. Outils et environnements
| Outil | État / identifiants | Notes |
|---|---|---|
| Site crtvstudios.fr | Cloudflare Pages « crtv-studios », prod = branche `main` | Voir CLAUDE.md. Travail sur `claude/laughing-cannon-90em5n`, aperçu claude-laughing-cannon-90em5.crtv-studios.pages.dev |
| Cloudflare API | compte da723e47b5f1402447614d76f28b5dfd, zone e55d2dda861533f314011f1d5deb2feb | Jeton en secret réseau (api.cloudflare.com). Pas de modif DNS/domaine sans accord |
| Brevo | listes 2 « Demandes de devis », 3 « Actualités » ; expéditeur contact@crtvstudios.fr | Clé en secret réseau (api.brevo.com). Contenu des mails envoyés lisible via /v3/smtp/emails |
| Mail | IONOS contact@crtvstudios.fr (+ copie contact.crtvstudios@gmail.com) | Notifications iPad toujours en suspens |
| Windsor.ai for Social Media | instagram 17841421474445876 | Essai : 30 j d'historique, pas de rafraîchissement forcé. Publie, gère commentaires, pas de DM |
| ElevenLabs | Starter (~38 000 crédits/mois) | Voix, effets, musique, transcription |
| Google Drive (compte CRTV) | Plan de lancement 1JfL0GVQhEQKCaGO8dwkw0y0Np1R__TuG (xlsx, MAJ 19/11) | Ancien : 1SnLw2RlySAmW81n2pqSynfcz7EHmvxpK ; dossier vide 118HXMgDPoptr72vaEp_MNeqCjFkoD3Tl. Lucas sans accès |
| Gmail (connecteur) | à reconnecter (21/11) | |
| ManyChat | compte créé 19/11, rien de configuré | L'API ne crée pas d'automatisation : config dans l'interface |
| Pub Meta | rien | Conseil : Windsor for Paid Media ; il faut page Facebook + compte pub |
| Réseau de l'environnement | elevenlabsusercontent.com autorisé | crtvstudios.fr et pages.dev non joignables d'ici |

## 6. Formulaire de devis
- Fonctionne (18/11). Accusé de réception client envoyé (vérifié 20/11). Correctif prêt sur la branche
  (nouvel essai minimal + alerte à contact@ si Brevo refuse) : en attente du feu vert de Neelsen.
- 20/11 21 h 14 « Gemma » = spam (instagrow.business), retiré de la liste 2. Piste : Cloudflare Turnstile.

## 7. Routines
- Tous les matins 7 h 38 : tâche planifiée « Bilan Instagram du matin » → skill `bilan-instagram`.
  Condition de Neelsen (21/11) : rien n'est transmis sans double vérification (2 relevés concordants +
  recalcul par `.claude/skills/bilan-instagram/verifier.py`) ; tout chiffre douteux est marqué « non vérifié ».
- Dimanche : bilan de la semaine + production des reels de la semaine suivante (`instagram/plan.md`).
- Liste des tâches priorisée : `memoire/taches.md` (Neelsen fixe les priorités).

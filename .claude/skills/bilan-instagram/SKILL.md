---
name: bilan-instagram
description: Check complet quotidien de CRTV Studios - Instagram @crtvstudios_ (stats, comparaison avec la veille, commentaires, idées du jour via les 13 skills instagram-agent), tous les outils (site, Cloudflare, Brevo, mails, ElevenLabs, Drive, Windsor, ManyChat), et la liste de tâches priorisée. À utiliser chaque matin (tâche planifiée 7 h 38), ou quand Neelsen demande « le bilan », « le check », « où on en est », « fais-moi le point », « liste de tâches ».
---

# Check complet du matin — CRTV Studios

But : en 3 minutes de lecture, Neelsen sait comment le compte a bougé depuis la veille,
si tous les outils marchent, et quoi faire aujourd'hui, dans l'ordre de priorité.
Français, tutoiement pour Neelsen, phrases courtes. Jamais de chiffre inventé.

## Règles
- Lecture seule : ne rien publier, ne rien supprimer, ne rien dépenser, ne répondre à aucun
  commentaire ni DM. Les textes proposés (réponses, stories, DM) sont des brouillons pour Neelsen.
- Données Windsor (essai) : jusqu'à quelques heures de retard ; le dire si un reel récent montre 0.
- Un reel de moins de 24 h n'est pas jugé. Toujours donner la confiance (faible / moyenne / forte).
- Respecter TOUTES les règles de `memoire/memoire-crtv.md` § 2 (oral « Creative Studios », écrit
  « CRTV Studios », pas de prix en vidéo, GTA seulement clipping/YouTube, vouvoiement du public…).

## 0. Charger le contexte (toujours)
1. Lire `memoire/memoire-crtv.md` (tout ce qu'on sait), `memoire/taches.md` (priorités),
   `instagram/plan.md`, `instagram/log.md`, `instagram/voice.md`, le dernier `instagram/stats/*.json`.
2. Recopier `instagram/voice.md`, `plan.md`, `log.md` dans `~/.claude/instagram/` (les skills IG les lisent là).
3. Les skills Instagram sont dans le plugin `instagram-agent` (13 skills, voir § 3) ; leurs outils
   Python sont dans `/root/.claude/plugins/synced/*/instagram-agent/skills/<skill>/`.

## 1. Instagram : données (Windsor, connecteur `instagram`, compte 17841421474445876)
Charger `get_data` via ToolSearch. Champs validés :
- Profil : `name, biography, followers_count, follows_count, media_count, website`
- Reels (`last_30dT`) : `timestamp, media_id, media_permalink, media_caption, media_views, media_reach,
  media_like_count, media_comments_count, media_shares, media_saved, media_reel_avg_watch_time, media_reel_skip_rate`
  (ne PAS demander `media_reposts` ni `media_follows` : refusés)
- Compte (`last_7dT`) : `date, reach, views, accounts_engaged, total_interactions, profile_links_taps,
  likes, comments, shares, saves` + `date, reach_followers, reach_non_followers, views_followers, views_non_followers`
- Commentaires (`last_7dT`) : `comment_timestamp, comment_text, comment_username, comment_id`

## 2. Instagram : analyse = skill **ig-audit**
Appliquer la méthode ig-audit : multiple de la médiane, part de non-abonnés, tenue à 3 s
(1 − skip_rate), durée moyenne / durée du reel, partages et enregistrements par portée,
abonnés gagnés. Comparer avec le relevé de la veille. Distinguer problème d'accroche
(pas de vues / abandon à 3 s) et problème de profil (vues mais 0 abonné, 0 clic).
Relier chaque reel à sa formule d'accroche (`instagram/log.md`, `hooks.json` de ig-reel).

## 3. Les 13 skills Instagram dans le check
| Skill | Chaque matin | Le dimanche (bilan de semaine) |
|---|---|---|
| **ig-audit** | Analyse des stats (§ 2) | Audit de la semaine complet, top/flop |
| **ig-reply** | S'il y a des commentaires : les trier et proposer les réponses (brouillons) | — |
| **ig-dm** | Commentaires CLIP/DEVIS ou demandes : rappeler le DM à envoyer (`instagram/dm-types.md`) | Relances J+4 / J+10 à envoyer |
| **ig-story** | Proposer la story du jour (3-5 écrans, 1 sticker), en s'appuyant sur `instagram/stories/idees.md` | — |
| **ig-comment** | Si Neelsen a fourni des comptes cibles : 2-3 commentaires prêts pour ses 20 min | Liste des 10 comptes de la semaine |
| **ig-human** | Passer tout texte proposé dans le détecteur avant de le montrer | — |
| **ig-caption** | Si un reel sort aujourd'hui : vérifier sa légende (`instagram/legendes/`) | Légendes de la semaine |
| **ig-profile** | Si la bio/le nom a changé : re-noter le profil | Note du profil /100 et 1 correction |
| **ig-plan** | Rappeler les publications du jour (`instagram/plan.md`) | Planning de la semaine suivante |
| **ig-reel** | Si une accroche marche/échoue nettement : proposer la prochaine accroche à tester | Scripts des reels de la semaine |
| **ig-viral** | Seulement si une niche/tendance est à creuser (réseau souvent bloqué : le dire) | Tendances de la niche si accessible |
| **ig-carousel** | Si un sujet s'y prête mieux qu'un reel : le signaler | 1 idée de carrousel |
| **ig-repurpose** | Si Neelsen a fourni une vidéo longue / un live : idées de formats courts | — |
Ne pas tout dérouler chaque matin : utiliser un skill seulement quand sa condition est remplie,
mais toujours au minimum ig-audit + ig-plan + ig-story.

## 4. Check des outils (un tableau ✅ / ⚠️ / ❌)
- **Site** : dernier déploiement production Cloudflare en succès, domaines actifs
  (`curl -s https://api.cloudflare.com/client/v4/accounts/da723e47b5f1402447614d76f28b5dfd/pages/projects/crtv-studios/deployments?env=production&per_page=1`
  et `/domains`) ; `npm test` (18 tests) ; écart main / branche de travail (`git diff --stat origin/main origin/claude/laughing-cannon-90em5n -- public functions`).
- **Mails / formulaire (Brevo)** : `https://api.brevo.com/v3/smtp/statistics/events?limit=50&days=1&sort=desc` ;
  rebonds, bloqués, spam ; demandes « Devis — … » : LIRE le contenu (`/v3/smtp/emails?messageId=…` puis
  `/v3/smtp/emails/{uuid}`) avant de parler de prospect ; listes 2 et 3 (`/v3/contacts/lists`).
- **DNS mail** (zone e55d2dda861533f314011f1d5deb2feb) : MX IONOS, SPF, DKIM IONOS + Brevo, DMARC présents.
- **ElevenLabs** : `account_get_usage` (crédits restants) si le connecteur répond.
- **Drive** : accès de Lucas au plan de lancement (`get_file_permissions` 1JfL0GVQhEQKCaGO8dwkw0y0Np1R__TuG).
- **Windsor** : répond ? Rappeler la fin de l'essai si elle approche.
- **ManyChat, Gmail, pub Meta** : état connu dans la mémoire (pas d'API à tester), le rappeler s'il bloque.
- **Tâches planifiées / fichiers temporaires** : `public/media-temp/` vide sur la branche sauf publication prévue.

## 5. Tâches
- Mettre à jour `memoire/taches.md` : cocher ce qui est fait (avec la date), ajouter les nouvelles
  tâches détectées avec une priorité « proposé », sans changer les priorités fixées par Neelsen.
- Présenter les tâches triées P1 → P2 → P3, en séparant Neelsen / Lucas / Claude.

## 6. Enregistrer
- Relevé du jour : `instagram/stats/AAAA-MM-JJ.json` (profil + reels + compte, valeurs brutes).
- Colonnes de `instagram/log.md` (vues 24 h / 7 j, abonnés gagnés, DM reçus).
- Enseignement net (confiance moyenne ou forte) → « Ce qui marche » de `instagram/voice.md`.
- Toute nouvelle info durable (outil, décision, identifiant) → `memoire/memoire-crtv.md`.
- `instagram/point-du-jour.md` : résumé du jour. Commit + push sur `claude/laughing-cannon-90em5n`.

## 7. Format du message à Neelsen
```
☀️ Check du <jour JJ/MM>

INSTAGRAM
Abonnés : N (±x) · Vues 24 h : N · Portée non-abonnés : x %
| Reel | Âge | Vues | Tenue 3 s | Durée moy. | Partages / Enreg. |
Ce qui marche / ce qui coince (2-3 lignes, confiance)
À traiter : commentaires, DM, devis (avec brouillons de réponse) — ou « rien »
Story du jour : <idée en 1 ligne>

OUTILS
| Outil | État | Détail |

TÂCHES (par priorité)
P1 … · P2 … · P3 …   (Neelsen / Lucas / Claude)
Publications du jour : …

Une question seulement si une décision de Neelsen est nécessaire.
```

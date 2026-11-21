---
name: bilan-instagram
description: Bilan quotidien du compte Instagram @crtvstudios_ (CRTV Studios) - stats des reels et du compte via Windsor, comparaison avec la veille, commentaires à traiter, demandes de devis du site, santé du site, et 3 actions du jour. À utiliser chaque matin, ou quand Neelsen demande « le bilan », « où on en est sur Insta », « analyse le compte ».
---

# Bilan Instagram du matin — CRTV Studios

But : en 2 minutes de lecture, Neelsen sait comment le compte a bougé depuis la veille,
ce qui marche, ce qui ne marche pas, et les 3 choses à faire aujourd'hui.
Langue : français, tutoiement pour Neelsen, phrases courtes. Jamais de chiffre inventé.

## Règles
- Lecture seule : ne rien publier, ne rien supprimer, ne rien dépenser, ne répondre à aucun commentaire.
- Les données Windsor (essai) peuvent avoir quelques heures de retard : le dire si un reel récent montre 0.
- Un reel de moins de 24 h n'est pas jugé : on donne ses premiers chiffres, sans conclusion.
- Peu de posts = peu de certitude : toujours dire le niveau de confiance (faible / moyen / fort).

## 1. Préparer
- Recopier `instagram/voice.md`, `plan.md`, `log.md` dans `~/.claude/instagram/`.
- Lire `instagram/point-du-jour.md` (tâches en cours) et `instagram/plan.md` (publications prévues).
- Lire le dernier relevé dans `instagram/stats/` (fichier `AAAA-MM-JJ.json` le plus récent) pour comparer.

## 2. Récupérer les données (Windsor, connecteur `instagram`, compte 17841421474445876)
Charger les outils Windsor via ToolSearch si besoin (`get_data`). Champs validés :
- Profil : `name, biography, followers_count, follows_count, media_count, website`
- Reels (date_preset `last_30dT`) : `timestamp, media_id, media_permalink, media_caption, media_views, media_reach, media_like_count, media_comments_count, media_shares, media_saved, media_reel_avg_watch_time, media_reel_skip_rate`
  (ne PAS demander `media_reposts` ni `media_follows` : refusés pour ce compte)
- Compte par jour (`last_7dT`) : `date, reach, views, accounts_engaged, total_interactions, profile_links_taps, likes, comments, shares, saves`
  et `date, reach_followers, reach_non_followers, views_followers, views_non_followers`
- Commentaires (`last_7dT`) : `comment_timestamp, comment_text, comment_username`

## 3. Calculer (méthode ig-audit)
Pour chaque reel : âge, vues, portée, **tenue à 3 s = 1 − skip_rate**, **durée moyenne / durée du reel**
(durées : voir `instagram/reels/*/reel.mp4` ou le journal ; ~22-29 s), partages/portée,
enregistrements/portée, part de non-abonnés dans la portée du compte.
Médiane des vues du compte → multiple de chaque reel (vues / médiane).
Comparer avec le relevé de la veille : nouveaux abonnés, vues gagnées par reel, évolution de la tenue à 3 s.
Repérer : le meilleur reel (multiple + tenue à 3 s), le pire, et toute accroche qui fait nettement mieux.

## 4. Autres vérifications rapides
- Demandes de devis des dernières 24 h : `curl -s "https://api.brevo.com/v3/smtp/statistics/events?limit=50&days=1&sort=desc"`
  (sujets « Devis — … »). Lire le contenu via `/v3/smtp/emails?messageId=…` puis `/v3/smtp/emails/{uuid}`
  AVANT de parler de prospect (le 20/11, « Gemma » était un spam). Signaler les rebonds.
- Site : dernier déploiement production Cloudflare en succès
  (`https://api.cloudflare.com/client/v4/accounts/da723e47b5f1402447614d76f28b5dfd/pages/projects/crtv-studios/deployments?env=production&per_page=1`).
- Publications prévues aujourd'hui dans `plan.md` : les rappeler avec l'heure.

## 5. Enregistrer
- Écrire le relevé du jour dans `instagram/stats/AAAA-MM-JJ.json` (profil + reels + compte, valeurs brutes).
- Mettre à jour les colonnes de `instagram/log.md` (vues 24 h / 7 j, abonnés gagnés).
- Si un enseignement est net (confiance moyenne ou forte), l'ajouter à la section « Ce qui marche » de `instagram/voice.md`.
- Commit + push sur la branche de travail (message « Bilan Instagram du JJ/MM »).

## 6. Le bilan à envoyer à Neelsen (format)
```
☀️ Bilan Insta du <jour JJ/MM>
Abonnés : N (±x depuis hier) · Vues 24 h : N · Portée non-abonnés : x %

Reels
| Reel | Âge | Vues | Tenue 3 s | Durée moy. | Partages / Enreg. |
(un par ligne, le plus récent en haut)

Ce qui marche / ce qui coince (2-3 lignes, avec la confiance)
Commentaires / devis à traiter (ou « rien »)
Aujourd'hui : publications prévues + 3 actions max, la plus importante en premier
```
Terminer par une question seulement si une décision de Neelsen est vraiment nécessaire.

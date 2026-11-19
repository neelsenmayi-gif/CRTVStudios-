# Point du 19/11/2026 (à relire en début de session)

## Check complet du 19/11 (11 h)
- OK : site (18/18 tests, 6 pages sans erreur), Cloudflare (prod 0a9bace, domaines + SSL actifs), DNS mail (MX, SPF, DKIM IONOS + Brevo, DMARC), Brevo (domaine authentifié, 10/10 mails livrés, 0 rebond), Windsor, ElevenLabs Starter (4 624 / 38 266), GitHub.
- PROBLÈME : l'accusé de réception client n'est jamais parti en production (Brevo refuse la requête, erreur invisible). Correctif prêt sur la branche Claude (nouvel essai minimal + alerte à contact@), à passer sur main après accord, puis test réel par Neelsen.
- Lucas n'a pas accès au plan de lancement (Drive : seul le compte CRTV est propriétaire) : le partager.
- Instagram : reel 01 publié le 19/11 à 10 h 11 ; bio encore l'ancienne (données Windsor du matin).

## Fait le 18-19/11
- Site : formulaire réparé, accusé de réception client, bouton « autre demande », 3 réalisations vidéo, pages légales, accès Cloudflare pour Claude, zone francophone en production (0a9bace).
- Instagram : voice.md, 5 reels (voix Hugo, motion design, effets, musique originale), 5 légendes, planning 1 reel/jour, DM types, bio (3 options), stories à la une (Comment ça marche + Réalisations), 10 idées de stories, plan de lancement à jour dans le Drive, routine du dimanche.

## Où sont les fichiers à renvoyer
- Reels : `instagram/livraison/CRTV-reel-0X-*.mp4` (sans musique : `livraison/sans-musique/`)
- Légendes : `instagram/legendes/`
- Planning : `instagram/plan.md` · Journal : `instagram/log.md`
- DM types : `instagram/dm-types.md`
- Stories : `instagram/stories/png/` (m1 à m5 + c-how ; story-realisation-luna/andry + r-fin + c-real) · Idées : `instagram/stories/idees.md`

## À faire
- [ ] Neelsen : coller la bio (option A, B ou C) + nom « CRTV Studios | Montage vidéo »
- [ ] Neelsen : programmer les 5 reels (19/11 12 h 10 → 23/11 14 h 40) et publier les stories à la une
- [ ] Neelsen + Claude : configurer ManyChat (CLIP / DEVIS) en interface, avec captures d'écran (l'API ne crée pas d'automatisation)
- [ ] Lucas : check des reels, légendes, DM et planning ; vérifier son accès au plan de lancement (Drive)
- [ ] Neelsen : vérifier le compte pro (catégorie Production vidéo + bouton e-mail)
- [ ] Neelsen : demander à Luna un post en collab + accord écrit pour l'extrait
- [ ] Neelsen : 20 min de commentaires par jour ; envoyer à Claude 10 comptes pour ig-comment
- [ ] Neelsen : épingler 3 reels une fois publiés (01, 03, 02)
- [ ] Neelsen : supprimer l'ancien plan de lancement dans le Drive et le dossier vide « CRTV Studios – Reels (18-19 nov.) »
- [ ] Dimanche 22/11 : premier bilan (stats Windsor → log.md → ig-audit → voice.md) + production de la série suivante

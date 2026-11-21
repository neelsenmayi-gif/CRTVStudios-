# Point du 21/11/2026 (à relire en début de session)

## Check complet du 21/11 (10 h 35)
- Instagram : 3 reels en ligne (01 le 19/11, 05 le 20/11 à 14 h 26, 01b le 21/11 à 10 h 33 publié par Claude). 8 abonnés. Nom « CRTV STUDIOS | Montage vidéo » OK ; bio = version de Neelsen (« NOUS CRÉONS VOS IDÉES 💡 » + liste), sans appel à l'action.
- Stats : 01 = 226 vues, abandon 3 s 62 %, 7,0 s moy. ; 05 = 169 vues, abandon 58,5 %, 5,4 s moy. ; 0 partage, 0 commentaire, 0 abonné gagné.
- « Gemma » (20/11 21 h 14) : PAS un prospect, c'est du démarchage spam (instagrow.business, vente d'abonnés) passé par le formulaire. Ne pas cliquer. Piste : activer Cloudflare Turnstile sur le formulaire (déjà prévu dans le code, clé à créer).
- Accusé de réception : il PART bien en production (envoyé à Gemma, rebond car adresse inactive). Le correctif (alerte à contact@ si Brevo refuse) reste prêt sur la branche, en attente d'accord.
- Site / Cloudflare / DNS / Brevo / tests : OK. Lucas n'a toujours pas accès au plan de lancement (Drive).


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

## À faire (mis à jour le 21/11 à 11 h)
### Neelsen, aujourd'hui
- [ ] Reel 02 à 12 h 10 (nouvelle version envoyée le 20/11)
- [ ] Bio : ajouter la ligne « Écrivez DEVIS en DM » sous « NOUS CRÉONS VOS IDÉES 💡 »
- [ ] Répondre aux commentaires des reels (aucun pour l'instant)
### Neelsen, cette semaine
- [ ] Partager le plan de lancement (Drive) avec Lucas — toujours pas fait
- [ ] ManyChat CLIP / DEVIS (avec Claude, par captures d'écran)
- [ ] Stories à la une Comment ça marche + Réalisations
- [ ] Compte pro : catégorie Production vidéo + bouton e-mail
- [ ] Épingler 3 reels
- [ ] Demander à Luna un post en collab + accord écrit
- [ ] 20 min de commentaires par jour ; envoyer 10 comptes cibles à Claude
- [ ] Reconnecter le connecteur Gmail dans claude.ai (sign-in expiré)
- [ ] Supprimer l'ancien plan de lancement et le dossier vide « CRTV Studios – Reels (18-19 nov.) » dans le Drive
### Décisions attendues de Neelsen
- [ ] Feu vert pour le correctif formulaire (alerte sur contact@ si Brevo refuse)
- [ ] Connecteur pub Meta (Windsor for Paid Media conseillé) + page Facebook reliée + compte pub
### Lucas
- [ ] Check des reels, légendes, DM et planning
### Claude
- [ ] Dim. 22/11 : bilan (01 vs 05 vs 01b) + leçons dans voice.md + série de la semaine
- [ ] Lun. 23/11 : reel 03 commerces (14 h 40), rappel collab Luna

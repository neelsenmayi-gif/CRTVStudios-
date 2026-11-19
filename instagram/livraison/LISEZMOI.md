# Reels à publier

- `CRTV-reel-0X-*.mp4` : versions finales (voix + effets + musique originale ElevenLabs, utilisable en pub).
- `sans-musique/` : mêmes reels sans musique, pour ajouter un son tendance Instagram (publication normale uniquement, pas de sponsorisation avec un son de la bibliothèque).

Musiques : synthwave (01, 05), électro hip-hop (02, 04), house chill (03). Générées le 19/11/2026 avec l'offre Starter d'ElevenLabs.
Remixer : `python3 instagram/reels/_base/mix.py instagram/reels/<dossier> CRTV-reel-<dossier> --music instagram/reels/_base/musique/<morceau>.mp3 --music-gain -10`

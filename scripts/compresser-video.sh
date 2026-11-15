#!/usr/bin/env bash
# Prépare une vidéo verticale pour le site : MP4 H.264 720x1280, sans son superflu, lecture progressive,
# plus une image d'affiche WebP. Usage : scripts/compresser-video.sh source.mov nom-court
# Résultat : public/assets/videos/nom-court.mp4 et assets/videos/nom-court.webp
set -euo pipefail
src="$1"; name="$2"; out="$(dirname "$0")/../public/assets/videos"
mkdir -p "$out"
ffmpeg -y -i "$src" -vf "scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280" \
  -c:v libx264 -profile:v high -preset slow -crf 26 -pix_fmt yuv420p \
  -c:a aac -b:a 96k -movflags +faststart "$out/$name.mp4"
ffmpeg -y -ss 1 -i "$out/$name.mp4" -frames:v 1 -vf "scale=540:960" -c:v libwebp -quality 72 "$out/$name.webp"
ls -lh "$out/$name.mp4" "$out/$name.webp"

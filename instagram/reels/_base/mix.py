"""Mixe la voix off et les effets sonores d'un reel, sans réencoder l'image.

Usage : python3 instagram/reels/_base/mix.py instagram/reels/<dossier> <nom-de-livraison>
Entrées : <dossier>/reel.mp4 (image), <dossier>/voix.mp3, <dossier>/sfx.json
sfx.json : [[temps_en_s, "nom", gain_dB], ...] ; un nom suffixé de ">" (ex. "riser>")
           se termine au temps donné au lieu d'y commencer.
Sortie : instagram/livraison/<nom-de-livraison>.mp4
Les temps sont ceux de l'animation ; la voix et l'image sont décalées de 0,2 s au rendu.
"""
import json, os, subprocess, sys

OFFSET = 0.2
SFX_GAIN = -4  # baisse générale des effets sous la voix (demande de Neelsen, 19/11)
base = os.path.dirname(os.path.abspath(__file__))
reel = os.path.abspath(sys.argv[1])
name = sys.argv[2]
# Option : musique de fond (chemin) + gain, ex. --music instagram/reels/_base/musique/synthwave.mp3 --music-gain -14
music = sys.argv[sys.argv.index("--music") + 1] if "--music" in sys.argv else None
music_gain = float(sys.argv[sys.argv.index("--music-gain") + 1]) if "--music-gain" in sys.argv else -14
sub = sys.argv[sys.argv.index("--out-sub") + 1] if "--out-sub" in sys.argv else ""
out_dir = os.path.join(os.path.dirname(os.path.dirname(base)), "livraison", sub)
os.makedirs(out_dir, exist_ok=True)
cues = json.load(open(os.path.join(reel, "sfx.json")))

def dur(path):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path]).decode())

video = os.path.join(reel, "reel.mp4")
total = dur(video)
args = ["ffmpeg", "-nostdin", "-y", "-loglevel", "error", "-i", video, "-i", os.path.join(reel, "voix.mp3")]
filters = [f"[1:a]aresample=48000,adelay={int(OFFSET*1000)}|{int(OFFSET*1000)},apad[voice]"]
labels = ["[voice]"]
for i, (t, n, g) in enumerate(cues):
    end_anchor = n.endswith(">")
    n = n.rstrip(">")
    path = os.path.join(base, "sfx", "ok", n + ".wav")
    start = t - (dur(path) if end_anchor else 0) + OFFSET
    args += ["-i", path]
    ms = max(0, int(round(start * 1000)))
    filters.append(f"[{i+2}:a]volume={g + SFX_GAIN}dB,adelay={ms}|{ms}[s{i}]")
    labels.append(f"[s{i}]")
mixlabel = "[a]" if not music else "[fx]"
filters.append("".join(labels) + f"amix=inputs={len(labels)}:normalize=0:duration=first,atrim=0:{total}" + ("" if music else ",alimiter=limit=0.85:level=false") + mixlabel)
if music:
    mi = len(cues) + 2
    args += ["-i", os.path.abspath(music)]
    fade = max(0.0, total - 1.5)
    # la musique baisse sous la voix (sidechain) puis remonte dans les silences
    filters.append("[fx]asplit=2[fxa][fxkey]")
    filters.append(f"[{mi}:a]aresample=48000,atrim=0:{total},volume={music_gain}dB,afade=t=in:st=0:d=0.4,afade=t=out:st={fade}:d=1.5[mus]")
    filters.append("[mus][fxkey]sidechaincompress=threshold=0.1:ratio=2.5:attack=30:release=400:makeup=1[duck]")
    filters.append("[fxa][duck]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.85:level=false[a]")
out = os.path.join(out_dir, name + ".mp4")
args += ["-filter_complex", ";".join(filters), "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-movflags", "+faststart", "-t", str(total), out]
subprocess.check_call(args)
print("OK", out, f"{len(cues)} effets")

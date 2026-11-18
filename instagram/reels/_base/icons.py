"""Injecte les icônes (Instagram, TikTok, YouTube Shorts, Twitch) du site à la place de <!--ICONS-->."""
import re, sys
site = open("public/index.html").read()
defs = re.search(r"<defs>(.*?)</defs>", site, re.S).group(1)
for path in sys.argv[1:]:
    s = open(path).read()
    if "<!--ICONS-->" in s:
        s = s.replace("<!--ICONS-->", '<svg width="0" height="0" style="position:absolute"><defs>' + defs + "</defs></svg>")
        open(path, "w").write(s)
        print("icônes ajoutées :", path)

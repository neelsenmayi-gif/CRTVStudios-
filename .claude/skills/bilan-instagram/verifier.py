"""Double vérification des chiffres du bilan Instagram, AVANT envoi à Neelsen.

Usage :
  python3 .claude/skills/bilan-instagram/verifier.py releve_A.json releve_B.json [releve_veille.json]

releve_A / releve_B : deux relevés bruts du même matin, obtenus par DEUX appels Windsor séparés,
au format {"profil": {...}, "reels": [ {...champs Windsor...} ], "compte": [ {...} ]}.
Le script :
  1. compare A et B champ par champ (les compteurs peuvent seulement monter, de peu) ;
  2. contrôle la cohérence (bornes, portée <= vues, durée moyenne plausible, etc.) ;
  3. recalcule les indicateurs du bilan (tenue à 3 s, durée moyenne, partages/portée…)
     à partir des données brutes de B, et les écrit dans calculs.json ;
  4. compare avec la veille si fournie (aucun compteur ne doit baisser).
Sortie : « VÉRIFIÉ » ou la liste des écarts. Code de sortie 0 = vérifié, 1 = écart.
"""
import json, sys

COMPTEURS = ["media_views", "media_reach", "media_like_count", "media_comments_count", "media_shares", "media_saved"]
TOL_HAUSSE = 0.15  # entre deux appels du même matin : +15 % max (le reel peut encore tourner)


def charger(p):
    return json.load(open(p))


def par_id(rel):
    return {r.get("media_id") or r.get("media_permalink"): r for r in rel.get("reels", [])}


def num(v):
    return float(v) if isinstance(v, (int, float)) else 0.0


def main():
    a, b = charger(sys.argv[1]), charger(sys.argv[2])
    veille = charger(sys.argv[3]) if len(sys.argv) > 3 else None
    ecarts, alertes = [], []

    # 1. A vs B
    ra, rb = par_id(a), par_id(b)
    if set(ra) != set(rb):
        ecarts.append(f"liste des reels différente entre les 2 appels : {sorted(set(ra) ^ set(rb))}")
    for k in set(ra) & set(rb):
        for c in COMPTEURS:
            va, vb = num(ra[k].get(c)), num(rb[k].get(c))
            if vb < va:
                ecarts.append(f"{k} {c} baisse entre 2 appels ({va} -> {vb})")
            elif va > 0 and (vb - va) / va > TOL_HAUSSE:
                ecarts.append(f"{k} {c} saute de {va} à {vb} entre 2 appels")
    fa, fb = num(a.get("profil", {}).get("followers_count")), num(b.get("profil", {}).get("followers_count"))
    if fa != fb:
        ecarts.append(f"abonnés différents entre 2 appels ({fa} / {fb})")

    # 2. cohérence + 3. calculs
    calculs = []
    for k, r in rb.items():
        v, reach = num(r.get("media_views")), num(r.get("media_reach"))
        skip, watch_ms = r.get("media_reel_skip_rate"), num(r.get("media_reel_avg_watch_time"))
        if reach > v and v > 0:
            ecarts.append(f"{k} portée ({reach}) > vues ({v})")
        if isinstance(skip, (int, float)) and not 0 <= skip <= 1:
            ecarts.append(f"{k} taux d'abandon hors bornes ({skip})")
        duree = num(r.get("duree_s")) or None
        if duree and watch_ms / 1000 > 4 * duree:
            alertes.append(f"{k} durée moyenne {watch_ms/1000:.1f} s pour {duree} s (beaucoup de relectures ?)")
        if v > 0 and reach == 0:
            alertes.append(f"{k} portée encore à 0 malgré {v:.0f} vues (donnée Meta en retard)")
        calculs.append({
            "reel": k, "permalink": r.get("media_permalink"), "vues": v, "portee": reach,
            "tenue_3s": None if not isinstance(skip, (int, float)) or v == 0 else round(1 - skip, 3),
            "duree_moy_s": round(watch_ms / 1000, 1) if watch_ms else None,
            "duree_moy_pct": round(watch_ms / 1000 / duree, 2) if duree and watch_ms else None,
            "partages_par_portee": round(num(r.get("media_shares")) / reach, 4) if reach else None,
            "enreg_par_portee": round(num(r.get("media_saved")) / reach, 4) if reach else None,
        })
    vues = sorted(c["vues"] for c in calculs if c["vues"] > 0)
    med = vues[len(vues) // 2] if vues else 0
    for c in calculs:
        c["multiple_mediane"] = round(c["vues"] / med, 2) if med else None

    # 4. veille
    if veille:
        rv = par_id(veille)
        for k in set(rv) & set(rb):
            for c in COMPTEURS:
                if num(rb[k].get(c)) < num(rv[k].get(c)):
                    ecarts.append(f"{k} {c} plus bas qu'hier ({num(rv[k].get(c))} -> {num(rb[k].get(c))})")

    json.dump({"mediane_vues": med, "reels": calculs, "alertes": alertes}, open("calculs.json", "w"), ensure_ascii=False, indent=1)
    for x in alertes:
        print("ALERTE :", x)
    if ecarts:
        print("ÉCARTS :")
        for x in ecarts:
            print(" -", x)
        sys.exit(1)
    print("VÉRIFIÉ :", len(calculs), "reels, médiane", med, "vues — indicateurs dans calculs.json")


if __name__ == "__main__":
    main()

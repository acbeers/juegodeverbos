"""Scraper for Spanish verb conjugations"""

import json
import os
import re
from bs4 import BeautifulSoup

import requests

url = "https://www.123teachme.com/spanish_verb_conjugation/"

verbs = ["caber","caer","calentar","cerrar","chocar","comenzar","competir","conocer","conducir","construir","costar","creer","dar","decir","divertir","dormir","empezar","encontrar","enfriar","entender","estar","haber","hacer","investigar","ir","jugar","leer","llegar","medir","morir","ofrecer","oír","pagar","pedir","pensar","perder","poder","poner","preferir","querer","recordar","reír","repetir","saber","salir","seguir","sentir","ser","servir","sonreír","tener","traducir","traer","valer","venir","ver","vestir","volar","volver"]

all = []
for verb in verbs:
    print(verb)
    u = url + verb
    fn = f"cache/{verb}.html"
    if not os.path.exists(fn):
        resp = requests.get(u)
        with open(fn,"wb") as fout:
            fout.write(resp.content)

    with open(fn,"rb") as fin:
        doc = fin.read()

    xml = BeautifulSoup(doc, features="lxml")

    # Find all table wrappers - we want the first
    wrappers = xml.find_all("div","table_wrapper")
    indicative = wrappers[0]

    # Now, find all tense_headings, which will be the start of our row.
    headings = indicative.find_all("td","tense_heading")

    res = {"verb":verb, "tenses":{}}

    # Find an image file
    if os.path.exists(f"public/images/{verb}.png"):
        res["image"] = f"{verb}.png"
    elif os.path.exists(f"public/images/{verb}.jpg"):
        res["image"] = f"{verb}.jpg"
    elif os.path.exists(f"public/images/{verb}.jpeg"):
        res["image"] = f"{verb}.jpeg"
    else:
        print(f"No image for {verb}")
    for heading in headings:
        row = heading.parent
        link = heading.find("a")
        tense = link.contents[0]
        # Find all conjugations
        def matcher(tag):
            """Match tds with a certain set of CSS classes"""
            if tag.name != "td":
                return False 
            clss = tag.get("class",[])
            return ("conjugation" in clss) and not ("english" in clss)
        conjs = row.find_all(matcher)

        assert(len(conjs)==6)

        o = {
            "words": [ {"word":x.string.strip(), "irregular":("irregular" in x['class'])} for x in conjs]
        }
        res['tenses'][tense] = o

    all.append(res)

with open("verbs.json","w") as fout:
    fout.write(json.dumps(all))

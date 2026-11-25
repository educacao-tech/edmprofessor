from bs4 import BeautifulSoup
import subprocess, sys, os

for fname in ["respostas_avaliacao.html", "public/respostas_avaliacao.html", "avaliacao.html", "public/avaliacao.html"]:
    with open(fname, "r", encoding="utf-8") as f:
        html = f.read()
    soup = BeautifulSoup(html, "html.parser")
    scripts = soup.find_all("script")
    for idx, s in enumerate(scripts):
        if s.string and "renumberQuestionsMatrix" in s.string:
            with open("_temp_test.mjs", "w", encoding="utf-8") as tf:
                tf.write(s.string)
            res = subprocess.run(["node", "--check", "_temp_test.mjs"], capture_output=True, text=True)
            if res.returncode != 0:
                print(f"Syntax error in {fname} script {idx}:", res.stderr)
                if os.path.exists("_temp_test.mjs"):
                    os.remove("_temp_test.mjs")
                sys.exit(1)
            else:
                print(f"Syntax OK for {fname} script containing renumberQuestionsMatrix!")

if os.path.exists("_temp_test.mjs"):
    os.remove("_temp_test.mjs")
print("ALL CHECKS PASSED!")

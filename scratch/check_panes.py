with open('script.js', 'r', encoding='utf-8') as f:
    s = f.read()
with open('respostas_avaliacao.html', 'r', encoding='utf-8') as f:
    r = f.read()

import re
print('signInWithEmailAndPassword in script.js:', len(re.findall(r'signInWithEmailAndPassword', s)))
print('signInWithEmailAndPassword in respostas:', len(re.findall(r'signInWithEmailAndPassword', r)))
print('createUserWithEmailAndPassword in script.js:', len(re.findall(r'createUserWithEmailAndPassword', s)))
print('createUserWithEmailAndPassword in respostas:', len(re.findall(r'createUserWithEmailAndPassword', r)))

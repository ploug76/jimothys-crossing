# Adds the Jimothy's Crossing tile to the Peter's Arcade hub (run right after git pull --rebase).
import re,shutil,subprocess
H='/workspace/peters-arcade';R='jimothys-crossing'
s=open(H+'/index.html',encoding='utf-8').read()
if f'ploug76.github.io/{R}/' not in s:
  tile=('<div class="card"><a class="tile" href="https://ploug76.github.io/jimothys-crossing/"><img src="covers/jimothys-crossing.gif" width="720" height="378" alt="Jimothy&#x27;s Crossing 8-bit box cover" loading="lazy"><b>Jimothy&#x27;s Crossing</b>'
   '<span>Hop Seattle&#x27;s famous raccoon across traffic, light rail &amp; the Sound to his trash-can dens!</span></a>'
   '<button class="tshare" type="button" data-url="https://ploug76.github.io/jimothys-crossing/" data-title="Jimothy&#x27;s Crossing" data-text="Play Jimothy&#x27;s Crossing — a free family-friendly 8-bit game from Peter&#x27;s Arcade!" aria-label="Share Jimothy&#x27;s Crossing">🔗 Share</button></div>\n')
  i=s.index('</main>');s=s[:i]+tile+s[i:]
n=s.count('class="card"');old=n-1
s=re.sub(r'\b\d+ (free )?family-friendly 8-bit (style )?games',lambda m:m.group(0).replace(m.group(0).split()[0],str(n),1),s)
open(H+'/index.html','w',encoding='utf-8').write(s)
shutil.copy(f'/workspace/covers/{R}/cover-anim.gif',f'{H}/covers/{R}.gif')
w=open(H+'/sw.js').read();v=int(re.search(r"V=P\+'v(\d+)'",w).group(1))
if f"'covers/{R}.gif'" not in w:w=w.replace("FILES=['./', ",f"FILES=['./', 'covers/{R}.gif', ",1)
w=re.sub(r"V=P\+'v\d+'",f"V=P+'v{v+1}'",w);open(H+'/sw.js','w').write(w)
# keep the shared generators in sync with the real count, then regenerate the hub cover
for p,pat,rep in [('/workspace/covers/gen.py',r"'\d+ GAMES'",f"'{n} GAMES'"),('/workspace/covers/meta.py',r"Peter's Arcade: \d+ family",f"Peter's Arcade: {n} family"),('/workspace/launch/share.py',r"Peter's Arcade: \d+ free family",f"Peter's Arcade: {n} free family")]:
  t=open(p).read();open(p,'w').write(re.sub(pat,rep,t))
subprocess.run(['python3','gen.py','peters-arcade'],cwd='/workspace/covers',check=True)
for f in ('cover.png','cover-anim.gif'):shutil.copy(f'/workspace/covers/peters-arcade/{f}',f'{H}/{f}')
print('tiles',n,'sw v',v+1)

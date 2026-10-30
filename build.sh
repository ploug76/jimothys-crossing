#!/bin/bash
# Build index.html from src/, then inject OG tags + cover (covers/meta.py) and the Share/Install dock (launch/share.py).
set -e
cd /workspace/jimothys-crossing/src && cat a_head.html b_core.js c_game.js d_draw.js e_render.js f_main.js > ../index.html && echo '</script></body></html>' >> ../index.html
cd /workspace/covers && python3 meta.py jimothys-crossing >/dev/null
cd /workspace/launch && python3 -c "
import share
if 'jimothys-crossing' not in share.CFG: share.cfg('jimothys-crossing')
share.apply('jimothys-crossing','/workspace/jimothys-crossing/index.html')"
echo built
python3 /workspace/jimothys-crossing/modes/inject.py /workspace/jimothys-crossing/index.html
# Game controller support (Peter 10/29): re-add the gamepad.js + gamepad-config.js block after every rebuild
python3 - /workspace/jimothys-crossing/index.html <<'PY'
import sys,re
p=sys.argv[1];s=open(p).read()
B='<!-- gamepad:start -->\n<script src="gamepad.js?v=2"></script>\n<script src="gamepad-config.js?v=2"></script>\n<!-- gamepad:end -->\n'
s=re.sub(r'<!-- gamepad:start -->.*?<!-- gamepad:end -->\n?','',s,flags=re.S);i=s.rfind('</body>');open(p,'w').write(s[:i]+B+s[i:])
PY
# Studio logo (Peter 10/30): re-add the tiny title-screen logo after every rebuild
python3 - "$PWD/index.html" <<'PY'
import sys,re
p=sys.argv[1];s=open(p).read()
B='<script src="studio-logo.js?v=1" data-src="studio-logo.webp" data-alt="Book of Heaven Studios" data-when="state===\'title\'" data-corner="br" data-cornerl="br" data-h="54" data-hl="46"></script>\n'
s=re.sub(r'<script src="studio-logo\.js[^>]*></script>\n?','',s);i=s.rfind('</body>');open(p,'w').write(s[:i]+B+s[i:])
PY

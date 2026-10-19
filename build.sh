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

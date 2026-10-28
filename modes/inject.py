# Re-applies the graphics-version picker to index.html (run by build.sh after the other injections).
import re,sys
p=sys.argv[1] if len(sys.argv)>1 else '/workspace/jimothys-crossing/index.html'
s=open(p).read()
s=re.sub(r'<!--modes-->.*?<!--/modes-->','',s,flags=re.S)
tag='<!--modes--><script src="modes/loader.js?v=17"></script><!--/modes-->'
i=s.rfind('</body>');s=s[:i]+tag+s[i:]
open(p,'w').write(s)

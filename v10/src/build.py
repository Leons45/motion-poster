import os
S=os.path.dirname(os.path.abspath(__file__))+'/'
rd=lambda n:open(S+n).read()
html=('<title>Motion Poster Studio</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n<link rel="preconnect" href="https://fonts.googleapis.com">\n'
 '<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800;900&family=Nunito:wght@700;800;900&display=swap" rel="stylesheet">\n'
 '<style>\n'+rd('style.css')+'\n</style>\n\n'+rd('body.html')+'\n<script>\n'+rd('assets.js')+'\n'+rd('helpers.js')+'\n'+rd('advanced.js')+'\n'+rd('premium.js')+'\n'+rd('premium2.js')+'\n'+rd('community.js')+'\n'+rd('leons.js')+'\n'+rd('events.js')+'\n'+rd('lint.js')+'\n'+rd('classic.js')+'\n'+rd('engine.js')+'\n'+rd('sample.js')+'\n'+'const BAKED_DEFAULTS='+rd('defaults.json').strip().replace('</','<\\/')+';\n'+rd('ui.js')+'</script>\n')
head='<!doctype html>\n<html lang="en">\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<link rel="stylesheet" href="https://use.typekit.net/giu1qyj.css">\n<style>body{margin:0}</style>\n'
out=os.path.join(S,'..','index.html')
open(out,'w').write(head+html+'\n</html>\n')
print('built v10 ->',out,len(html))

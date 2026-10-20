"""Cold-load measurements on local HTTP; these do not simulate a school Wi-Fi AP."""
import json
import os
import time
from pathlib import Path
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/os.environ.get('QA_OUT','docs/reviews/screenshots/v3/final-network')
OUT.mkdir(parents=True,exist_ok=True)
(ROOT/'tmp').mkdir(exist_ok=True)
os.environ['TEMP']=os.environ['TMP']=str(ROOT/'tmp')
URL=os.environ.get('QA_URL','http://127.0.0.1:4323')
with sync_playwright() as p:
    browser=p.chromium.launch(channel='chrome',headless=True)
    context=browser.new_context(viewport={'width':1280,'height':800})
    page=context.new_page()
    requests=[];errors=[];console=[];responses=[]
    page.on('request',lambda r:requests.append({'url':r.url,'method':r.method,'type':r.resource_type}))
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('console',lambda m:console.append({'type':m.type,'text':m.text}) if m.type in ['error','warning'] else None)
    page.on('response',lambda r:responses.append({'url':r.url,'status':r.status,'cache':r.headers.get('cache-control'),'encoding':r.headers.get('content-encoding'),'mime':r.headers.get('content-type')}))
    start=time.perf_counter();page.goto(URL,wait_until='networkidle')
    page.wait_for_selector('.phaser-stage[data-ready=true]',state='attached')
    page.wait_for_function('document.fonts.status === "loaded"')
    page.wait_for_timeout(200)
    elapsed=round((time.perf_counter()-start)*1000,2)
    data=page.evaluate('''async()=>{
      const nav=performance.getEntriesByType('navigation')[0];
      const resources=performance.getEntriesByType('resource').map(r=>({url:r.name,transfer:r.transferSize,body:r.decodedBodySize,duration:r.duration}));
      const regs=await navigator.serviceWorker.getRegistrations();
      return {resources,navigation:{transfer:nav.transferSize,body:nav.decodedBodySize,dcl:nav.domContentLoadedEventEnd,load:nav.loadEventEnd},
        intro:document.querySelector('.story-copy').innerText,
        fonts:{hangul:document.fonts.check('20px Jua','물방울 연구실'),latin:document.fonts.check('20px Jua')},
        storageKeys:Object.keys(localStorage),storageBytes:new TextEncoder().encode(JSON.stringify({...localStorage})).length,
        manifest:document.querySelectorAll('link[rel=manifest]').length,serviceWorkers:regs.length,cacheKeys:await caches.keys()};
    }''')
    total=data['navigation']['transfer']+sum(r['transfer'] for r in data['resources'])
    first={**data,'readyElapsedMs':elapsed,'requests':requests.copy(),'requestCount':len(requests),'transferBytes':total,
      'thirtyLearnersBytes':total*30,'externalHosts':sorted({urlsplit(r['url']).netloc for r in requests if urlsplit(r['url']).scheme in ['http','https'] and urlsplit(r['url']).netloc!=urlsplit(URL).netloc}),
      'console':console.copy(),'pageErrors':errors.copy(),'responses':responses.copy()}
    # A genuine offline reload, without installing or seeding a service worker.
    page.locator('[data-action="intro-close"]').click()
    saved=page.evaluate('localStorage.getItem("water-drop-lab:v1")')
    context.set_offline(True)
    try:
        page.reload(wait_until='domcontentloaded',timeout=10000)
        offline={'reload':'PASS' if page.locator('#app').count() else 'FAIL'}
    except Exception as e:
        offline={'reload':'FAIL','error':str(e).splitlines()[0]}
    context.set_offline(False);page.goto(URL,wait_until='networkidle')
    offline['restoredOnline']=page.evaluate('localStorage.getItem("water-drop-lab:v1")')==saved
    report={'measuredAt':time.strftime('%Y-%m-%dT%H:%M:%S'),'url':URL,'environment':'Installed Chrome headless, fresh browser context; local HTTP, no throttling. Byte multiplication only, no AP speed estimate. Ready time includes network-idle wait and 200 ms observation.','firstLoad':first,'offline':offline}
    (OUT/'network-results.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'readyElapsedMs':elapsed,'transferBytes':total,'requestCount':first['requestCount'],'externalHosts':first['externalHosts'],'fonts':first['fonts'],'pageErrors':first['pageErrors'],'console':first['console'],'manifest':data['manifest'],'serviceWorkers':data['serviceWorkers'],'offline':offline},ensure_ascii=False),flush=True)
    assert not first['externalHosts'] and not first['pageErrors'] and not first['console']
    assert not [r for r in first['responses'] if r['status']>=400]
    assert all(first['fonts'].values()) and offline['restoredOnline']
    browser.close()

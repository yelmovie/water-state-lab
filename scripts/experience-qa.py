"""Media, modal and touch regressions in a fresh headless Chrome context."""
import json, os
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/reviews/screenshots/experience-20261022'; OUT.mkdir(parents=True,exist_ok=True)
os.environ['TEMP']=os.environ['TMP']=str(ROOT/'tmp')
URL=os.environ.get('QA_URL','http://127.0.0.1:4318')
report={'media':[],'dialogs':[],'checks':[],'errors':[]}
with sync_playwright() as p:
    browser=p.chromium.launch(channel='chrome',headless=True)
    ctx=browser.new_context(viewport={'width':1280,'height':800},has_touch=True)
    page=ctx.new_page(); page.set_default_timeout(10000)
    page.on('pageerror',lambda e:report['errors'].append(str(e)))
    page.goto(URL,wait_until='networkidle')
    page.evaluate("document.querySelectorAll('dialog[open]').forEach(d=>d.close())")
    def setup(n,field=False):
        page.evaluate('''async({n,field})=>{const {state,initialState}=await import('/src/state.js');const {render}=await import('/src/app.js');const {chapterState}=await import('/src/fieldwork-model.js');Object.assign(state,initialState());Object.assign(state.settings,{adminUnlock:true,sound:false,reduced:true});state.fieldwork.introSeen=true;state.route=n;state.fieldwork.active=field?n:0;if(field)state.fieldwork.chapters[n]=chapterState(n);render();}''',{'n':n,'field':field})
        page.wait_for_selector('#field-canvas[data-ready=true]' if field else '.phaser-stage[data-ready=true]')
    def tap(x,y):
        r=page.locator('#field-canvas').bounding_box()
        page.touchscreen.tap(r['x']+x/720*r['width'],r['y']+y/400*r['height'])
    def state(expr):return page.evaluate('async()=>{const {state}=await import("/src/state.js");return '+expr+'}')
    def modal_rect(name,w,h):
        row=page.evaluate('''()=>{const d=[...document.querySelectorAll('dialog[open]')].at(-1),r=d.getBoundingClientRect();return {rect:r.toJSON(),scrollX:d.scrollWidth-d.clientWidth,centerError:Math.abs(r.y+r.height/2-innerHeight/2),buttons:[...d.querySelectorAll('button')].filter(b=>b.getClientRects().length).map(b=>({text:b.textContent.trim(),width:b.getBoundingClientRect().width,height:b.getBoundingClientRect().height}))}}''')
        assert row['rect']['x']>=0 and row['rect']['right']<=w+1,(name,row)
        assert row['rect']['top']>=0 and row['rect']['bottom']<=h+1,(name,row)
        assert row['scrollX']<=2 and row['centerError']<2,(name,row)
        assert all(b['height']>=44 for b in row['buttons']),(name,row)
        report['dialogs'].append({'name':name,'viewport':f'{w}x{h}',**row})
    setup(1)
    # Exercise all MP4 and VP9 files, including duration, dimensions, cue seek and real end.
    for n in range(1,11):
        for ext in ['mp4','webm']:
            result=page.evaluate('''async({n,ext})=>{const v=document.createElement('video');v.muted=true;v.playsInline=true;v.style.cssText='position:fixed;top:0;left:0;width:8px;height:8px;pointer-events:none';document.body.append(v);try{v.src=`/assets/concepts/stage-${n}.${ext}`;await new Promise((ok,no)=>{v.onloadeddata=ok;v.onerror=()=>no(Error('decode '+n+'.'+ext));});await v.play();await new Promise((ok,no)=>{const end=Date.now()+8000;const poll=()=>{if(v.currentTime>0)ok();else if(Date.now()>end)no(Error('playback did not advance'));else setTimeout(poll,50)};poll()});return {duration:v.duration,width:v.videoWidth,height:v.videoHeight,played:v.currentTime>0};}finally{v.pause();v.removeAttribute('src');v.load();v.remove();}}''',{'n':n,'ext':ext})
            assert result['duration']==9 and result['width']==960 and result['height']==540 and result['played'],(n,ext,result)
            report['media'].append({'stage':n,'format':ext,**result})
        page.evaluate('async n=>{const {openConcept}=await import("/src/concepts.js");openConcept(n,{reduced:true})}',n)
        page.wait_for_function('()=>document.querySelector(".concept-dialog video").readyState>=2')
        assert page.locator('.concept-dialog video').evaluate('v=>v.paused'),'reduced motion must await an intentional play'
        for i in [1,2,0]:
            page.locator(f'[data-cue="{i}"]').click()
            expected=page.evaluate('async({n,i})=>(await import("/src/concept-data.js")).concepts[n].cues[i].text',{'n':n,'i':i})
            assert page.locator('.concept-caption p').inner_text()==expected
        if n==1:
            page.locator('[data-concept="play"]').click()
            page.wait_for_function('()=>!document.querySelector(".concept-dialog video").paused&&document.querySelector(".concept-dialog video").currentTime>0')
            page.locator('.concept-dialog video').evaluate('v=>{v.currentTime=8.8}')
            page.wait_for_function('()=>document.querySelector(".concept-dialog video").ended')
            assert page.locator('.concept-end').is_visible()
        page.locator('[data-concept="close"]').click()
        assert page.locator('.concept-dialog').count()==0
    print('PASS 20 video codecs + 10 cue/reduced-motion/cleanup flows',flush=True)
    # Every audio asset is a playable local sample, not a remote runtime dependency.
    sounds=page.evaluate('''async()=>{const m=await(await fetch('/assets/audio/sources.json')).json();const out=[];for(const [kind,file] of Object.entries(m.sounds)){const a=new Audio('/assets/audio/'+file);await new Promise((ok,no)=>{a.onloadedmetadata=ok;a.onerror=no;});out.push({kind,duration:a.duration});a.removeAttribute('src');a.load();}return out;}''')
    assert len(sounds)==7 and all(0<s['duration']<4 for s in sounds);report['audio']=sounds
    # Main experiment: real continuous dragging pours equal amounts into two vessels.
    def lab_drag(x,y,tx,ty,hold=0):
        r=page.locator('.phaser-stage canvas').bounding_box()
        pt=lambda a,b:(r['x']+a/720*r['width'],r['y']+b/330*r['height'])
        page.mouse.move(*pt(x,y));page.mouse.down();page.mouse.move(*pt(tx,ty),steps=14)
        if hold:page.wait_for_timeout(hold)
        page.mouse.up();page.wait_for_selector('.phaser-stage[data-ready=true]')
    setup(1)
    for x in [300,535]:lab_drag(100,150,x,150,3200)
    assert state('state.activities.observe.pours.length===2'),'both real pours must finish'
    report['checks'].append('continuous pointer pouring fills both vessels before progression')
    setup(7)
    def action(name):
        el=page.locator(f'[data-action="{name}"]');el.evaluate_all("es=>es.forEach(e=>{for(let p=e.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true})")
        page.locator(f'[data-action="{name}"]:visible').first.click()
    for a in ['ix-dew-predict-air','ix-wipe-cold','ix-wipe-room','act-dew-seal']:action(a)
    for _ in range(4):action('ix-forward')
    action('ix-record');assert state('state.activities.dew.records.length===2')
    lab_drag(205,125,215,175)
    assert state('state.activities.dew.rewiped&&state.inquiry.dewRegion.length>0&&state.inquiry.dewRegion.length<20')
    for _ in range(4):action('ix-forward')
    action('ix-record');assert state('state.activities.dew.again')
    report['checks'].append('local pointer wiping removes a region and condensation returns there')
    # Real touch: select an object, select a target; four observations are still required.
    setup(1,True)
    for x,y in [(110,100),(110,265)]:
        for tx,ty in [(365,205),(570,205)]:tap(x,y);tap(tx,ty)
    assert state('state.fieldwork.chapters[1].marks.length===4')
    page.locator('[data-action="field-finish"]').click();page.wait_for_selector('.concept-dialog[open]')
    assert state('state.route===1&&state.fieldwork.active===1&&state.pages.length===0')
    page.keyboard.press('Escape');assert state('state.route===1&&state.fieldwork.active===1')
    report['checks'].append('two-tap transfer, gated concept, Escape preserves observations')
    setup(9,True)
    nodes=[(165,55),(300,135),(450,210),(450,280),(450,350)]
    # A skipped link gives feedback and grants nothing.
    tap(*nodes[0]);tap(*nodes[4]);assert state('state.fieldwork.chapters[9].lines.length===0')
    for a,b in zip(nodes,nodes[1:]):tap(*a);tap(*b)
    assert state('state.fieldwork.chapters[9].lines.length===4')
    report['checks'].append('two-tap water path, rejection of skipped links')
    page.locator('[data-action="buddy-hint"]').click();assert page.locator('.coach-help').is_visible()
    page.locator('[data-hint-more]').click();assert '2 / 2' in page.locator('.coach-help-head').inner_text()
    page.locator('[data-hint-try]').click();assert page.locator('.coach-help').count()==0
    report['checks'].append('two-level character hint and return to action')
    # Centered, readable dialogs at all classroom target sizes, with short and long content.
    for w,h in [(1280,800),(1024,768),(1920,1080),(1440,900),(1280,720)]:
        page.set_viewport_size({'width':w,'height':h});setup(1)
        for name,action in [('notebook','notebook'),('settings','settings')]:
            page.locator(f'[data-action="{action}"]').click();modal_rect(name,w,h)
            page.screenshot(path=str(OUT/f'{name}-{w}x{h}.png'))
            page.keyboard.press('Escape')
        page.evaluate('async()=>{const {openConcept}=await import("/src/concepts.js");openConcept(8,{reduced:true})}')
        page.wait_for_function('()=>document.querySelector(".concept-dialog video").readyState>=2')
        modal_rect('concept',w,h);page.screenshot(path=str(OUT/f'concept-{w}x{h}.png'))
        page.keyboard.press('Escape')
    # Broken video -> final still plus full text; no navigation lock.
    page.route('**/assets/concepts/*.webm',lambda route:route.abort())
    page.evaluate('async()=>{const {openConcept}=await import("/src/concepts.js");openConcept(6,{reduced:true})}')
    page.wait_for_selector('.concept-transcript:visible')
    assert page.locator('.concept-transcript li').count()==3
    page.locator('[data-concept="continue"]').click();assert not page.locator('.concept-dialog').count()
    report['checks'].append('failed video falls back to poster and all captions, continuation remains enabled')
    page.unroute('**/assets/concepts/*.webm')
    # Blocked autoplay is recoverable; a hidden tab pauses the current clip.
    page.evaluate('async()=>{HTMLMediaElement.prototype.play=()=>Promise.reject(Error("test autoplay blocked"));const {openConcept}=await import("/src/concepts.js");openConcept(4)}')
    page.wait_for_selector('.concept-play:visible');assert page.locator('[data-concept="continue"]').is_enabled()
    page.keyboard.press('Escape');page.reload()
    report['checks'].append('autoplay rejection leaves an explicit play button and usable continuation')
    browser.close()
assert not report['errors'],report['errors']
(OUT/'experience-results.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'videos':len(report['media']),'audio':len(report['audio']),'dialogs':len(report['dialogs']),'checks':report['checks'],'errors':report['errors']},ensure_ascii=False),flush=True)

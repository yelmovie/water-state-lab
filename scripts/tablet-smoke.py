"""Isolated headless QA. Never connects to or changes the user's browser profile."""
import json, os
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/reviews/screenshots/tablet-v3'
OUT.mkdir(parents=True,exist_ok=True)
os.environ['TEMP']=str(ROOT/'tmp')
os.environ['TMP']=str(ROOT/'tmp')

with sync_playwright() as p:
    browser=p.chromium.launch(channel='chrome',headless=True)
    context=browser.new_context(viewport={'width':1280,'height':800},device_scale_factor=1)
    page=context.new_page()
    page.set_default_timeout(10000)
    print('QA browser ready',flush=True)
    errors=[]
    page.on('pageerror',lambda error:errors.append(str(error)))
    page.on('response',lambda response:errors.append(f'HTTP {response.status} {response.url}') if response.status>=400 else None)
    page.goto(os.environ.get('QA_URL','http://127.0.0.1:4320'),wait_until='networkidle')
    page.wait_for_selector('.phaser-stage[data-ready=true]',timeout=15000,state='attached')
    page.screenshot(path=str(OUT/'map-1280.png'))
    report=[]
    for width,height in [(1280,800),(1280,720),(1024,768),(1920,1080),(915,412),(375,812)]:
        page.set_viewport_size({'width':width,'height':height})
        for route in ['map',1,2,3,4,5,6,7,8,9,10]:
            print(f'Checking {width}x{height} route={route}',flush=True)
            page.evaluate('''async route => {
                const {state,initialState,save}=await import('/src/state.js');
                const {render}=await import('/src/app.js');
                Object.assign(state,initialState());state.settings.sound=false;state.settings.reduced=true;state.settings.adminUnlock=true;state.route=route;
                if(route===8){state.activities.dew.records=[{kind:'before',cold:{time:0,cold:true,drops:0,mass:250},room:{time:0,cold:false,drops:0,mass:250},sealed:true},{kind:'after',cold:{time:100,cold:true,drops:20,mass:252},room:{time:100,cold:false,drops:0,mass:250},sealed:true}];state.activities.dew.rewiped=true;state.activities.dew.again=true;}
                save();render();
            }''',route)
            page.wait_for_selector('.phaser-stage[data-ready=true]',timeout=15000,state='attached')
            page.wait_for_timeout(120)
            result=page.evaluate('''()=>({
                canvas:document.querySelector('.phaser-stage canvas')?.getBoundingClientRect().toJSON(), stage:document.querySelector('.phaser-stage')?.getBoundingClientRect().toJSON(),
                pageOverflow:document.documentElement.scrollHeight>innerHeight+2,
                pageWidthOverflow:document.documentElement.scrollWidth>innerWidth+2,
                panels:[...document.querySelectorAll('.activity-scene,.activity-tools,.lab-stage,.control-panel')].map(e=>({name:e.className,scroll:e.scrollHeight-e.clientHeight,height:e.clientHeight})),
                visibleButtons:[...document.querySelectorAll('button')].filter(e=>e.getBoundingClientRect().width&&e.getBoundingClientRect().height).length
            })''')
            report.append({'viewport':f'{width}x{height}','route':route,**result})
            print(json.dumps(result,ensure_ascii=False),flush=True)
            if width==1280 or route in ['map',1,9]:page.screenshot(path=str(OUT/f'{route}-{width}.png'),timeout=5000)
    (OUT/'layout-results.json').write_text(json.dumps({'errors':errors,'screens':report},ensure_ascii=False,indent=2),encoding='utf-8')
    invalid=[r for r in report if not r['canvas'] or not r['stage'] or r['stage']['width']<250 or r['stage']['height']<100 or (r['canvas']['width']<r['stage']['width']*.5 and r['canvas']['height']<r['stage']['height']*.8) or r['pageWidthOverflow'] or (r['pageOverflow'] and r['viewport']!='375x812')]
    print(json.dumps({'errors':errors,'screens':len(report),'invalid':invalid},ensure_ascii=False),flush=True)
    browser.close()
    assert not errors,errors
    assert not invalid,invalid

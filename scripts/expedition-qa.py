"""Isolated Chrome QA for the research island, ten labs and ten field requests.

Run with QA_URL=http://127.0.0.1:4322. QA_MODE may be all, layout, flow or core.
QA_VIEWPORTS accepts comma-separated WIDTHxHEIGHT pairs; QA_OUT is relative to ROOT.
Uses a fresh temporary browser context; never connects to a user's profile.
"""
import json
import os
import time
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/os.environ.get('QA_OUT','docs/reviews/screenshots/v3')
OUT.mkdir(parents=True,exist_ok=True)
(ROOT/'tmp').mkdir(exist_ok=True)
os.environ['TEMP']=os.environ['TMP']=str(ROOT/'tmp')
URL=os.environ.get('QA_URL','http://127.0.0.1:4322')
MODE=os.environ.get('QA_MODE','all')
VIEWPORTS=[(1280,800),(1024,768),(1280,720),(873,580),(375,812)]
if os.environ.get('QA_VIEWPORTS'):
    VIEWPORTS=[tuple(map(int,value.lower().split('x'))) for value in os.environ['QA_VIEWPORTS'].split(',')]

with sync_playwright() as p:
    browser=p.chromium.launch(channel='chrome',headless=True)
    context=browser.new_context(viewport={'width':1280,'height':800},device_scale_factor=1)
    page=context.new_page()
    page.set_default_timeout(9000)
    report={'url':URL,'mode':MODE,'startedAt':time.strftime('%Y-%m-%dT%H:%M:%S'),'pageErrors':[],'consoleErrors':[],'httpErrors':[],'networkFailures':[],'layout':[],'settingsLayout':[],'flows':[]}
    page.on('pageerror',lambda error:report['pageErrors'].append(str(error)))
    page.on('console',lambda message:report['consoleErrors'].append(message.text) if message.type=='error' else None)
    page.on('response',lambda response:report['httpErrors'].append({'status':response.status,'url':response.url}) if response.status>=400 else None)
    page.on('requestfailed',lambda request:report['networkFailures'].append({'url':request.url,'failure':request.failure}))
    started=time.monotonic()
    page.goto(URL,wait_until='networkidle')
    report['initialLoadMs']=round((time.monotonic()-started)*1000)
    if page.locator('[data-action="intro-close"]:visible').count():
        page.locator('[data-action="intro-close"]').click()
    elif page.locator('#dialog[open]').count():
        page.locator('#close-dialog').click()

    def read(expression):
        return page.evaluate('async()=>{const {state}=await import("/src/state.js");return '+expression+';}')

    def setup(route,field=False,reset=True):
        page.evaluate('''async({route,field,reset})=>{
          document.querySelectorAll('dialog[open]').forEach(d=>d.close());
          const {state,initialState,save,setPreviewMode}=await import('/src/state.js');
          const {chapterState}=await import('/src/fieldwork-model.js');
          const {render}=await import('/src/app.js');
          if(reset){setPreviewMode(false);Object.assign(state,initialState());}
          // The eighth lab displays the learner's two real comparison records.
          if(route===8&&!field){
            state.activities.dew.records=[{kind:'before',cold:{time:0,cold:true,drops:0,mass:250},room:{time:0,cold:false,drops:0,mass:250},sealed:true},{kind:'after',cold:{time:100,cold:true,drops:20,mass:252},room:{time:100,cold:false,drops:0,mass:250},sealed:true}];
            state.activities.dew.rewiped=true;state.activities.dew.again=true;
          }
          Object.assign(state.settings,{sound:false,bgm:false,sfx:false,reduced:true,adminUnlock:true});
          // Reload intentionally exits teacher preview. Give persistence fixtures
          // the prior learner progress needed to re-enter this actual chapter.
          if(Number.isInteger(route)&&reset){state.completed=Array.from({length:Math.floor((route-1)/2)},(_,i)=>i+1);state.pages=Array.from({length:route-1},(_,i)=>i+1);}
          state.route=route;state.fieldwork.introSeen=true;state.fieldwork.active=field?route:0;
          state.fieldwork.pending='';
          if(field&&reset)state.fieldwork.chapters[route]=chapterState(route);
          save();render();
        }''',{'route':route,'field':field,'reset':reset})
        ready(field)

    def ready(field=False):
        if field:
            page.wait_for_selector('#field-canvas[data-ready=true]',state='visible')
            page.wait_for_function("()=>document.querySelector('#field-canvas')?.getBoundingClientRect().width>100")
        else:
            page.wait_for_selector('.phaser-stage[data-ready=true]',state='attached')
            page.wait_for_function("()=>document.querySelector('.phaser-stage canvas')?.getBoundingClientRect().width>100")
        page.wait_for_timeout(100)

    def click(action):
        selector='[data-action="'+action+'"]'
        page.locator(selector).evaluate_all("es=>es.forEach(e=>{for(let p=e.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;})")
        page.locator(selector+':visible').first.click()
        page.wait_for_timeout(45)

    def alternative(item,target):
        page.locator('.expedition-choices').evaluate("el=>{for(let p=el;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;}")
        page.locator('#field-item').select_option(item)
        click('field-place-'+target)

    def point(x,y):
        box=page.locator('#field-canvas').bounding_box()
        return (box['x']+x/720*box['width'],box['y']+y/400*box['height'])

    def drag(x,y,tx,ty):
        page.locator('#field-canvas').scroll_into_view_if_needed()
        page.mouse.move(*point(x,y));page.mouse.down();page.mouse.move(*point(tx,ty),steps=12);page.mouse.up();ready(True)

    def chapter_ready(n):
        return page.evaluate('''async n=>{const {state}=await import('/src/state.js');const {fieldReady}=await import('/src/fieldwork-model.js');return fieldReady(n,state.fieldwork.chapters[n]);}''',n)

    def capture_layout(width,height,route,field):
        setup(route,field)
        result=page.evaluate('''()=>{
          const rect=e=>e?.getBoundingClientRect().toJSON();
          const canvas=document.querySelector('#field-canvas,.phaser-stage canvas');
          let paintedSamples=null;
          if(canvas?.id==='field-canvas'){
            const g=canvas.getContext('2d'),pixels=new Set();
            for(let x=12;x<720;x+=54)for(let y=12;y<400;y+=38)pixels.add([...g.getImageData(x,y,1,1).data].join(','));
            paintedSamples=pixels.size;
          }
          return {canvas:rect(canvas),intrinsicCanvas:canvas?{width:canvas.width,height:canvas.height}:null,paintedSamples,
            stage:rect(document.querySelector('#field-canvas,.phaser-stage')),
            pageOverflowY:document.documentElement.scrollHeight>innerHeight+2,
            pageOverflowX:document.documentElement.scrollWidth>innerWidth+2,
            documentSize:{width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight},
            overflowingElements:[...document.querySelectorAll('main *')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.height&&(r.right>innerWidth+2||r.left< -2)&&getComputedStyle(e).position!=='absolute';}).slice(0,8).map(e=>({tag:e.tagName,className:typeof e.className==='string'?e.className:'svg',rect:rect(e)})),
            panels:[...document.querySelectorAll('.activity-scene,.activity-tools,.lab-stage,.control-panel')].map(e=>({name:e.className,rect:rect(e),scrollX:e.scrollWidth-e.clientWidth,scrollY:e.scrollHeight-e.clientHeight,overflowY:getComputedStyle(e).overflowY})),
            brokenImages:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src),
            headerIcons:document.querySelectorAll('.page-nav button,.topbar-right>.icon-btn').length};
        }''')
        row={'viewport':f'{width}x{height}','route':route,'kind':'field' if field else 'base',**result}
        row['failures']=[]
        if not result['canvas'] or result['canvas']['width']<100 or result['canvas']['height']<80:row['failures'].append('missing-or-small-canvas')
        if result['pageOverflowX']:row['failures'].append('horizontal-overflow')
        if width>=873 and result['pageOverflowY']:row['failures'].append('landscape-page-scroll')
        if field and result['paintedSamples']<4:row['failures'].append('apparently-blank-field-canvas')
        report['layout'].append(row)
        if route=='map' or (width in [1280,873] and route in [1,5,7,9]) or (width==375 and route in [1,9]):
            filename=f'{row["kind"]}-{route}-{width}x{height}.png'
            page.screenshot(timeout=20000,path=str(OUT/filename),full_page=True)
        return row

    def persist_report():
        report['finishedAt']=time.strftime('%Y-%m-%dT%H:%M:%S')
        path=OUT/f'expedition-{MODE}-results.json'
        path.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')

    if MODE in ['all','layout']:
        for width,height in VIEWPORTS:
            page.set_viewport_size({'width':width,'height':height})
            for route in ['map',*range(1,11)]:
                for field in ([False] if route=='map' else [False,True]):
                    try:
                        result=capture_layout(width,height,route,field)
                        if result['failures']:print('LAYOUT ISSUE '+json.dumps({k:result[k] for k in ['viewport','route','kind','failures']},ensure_ascii=False),flush=True)
                    except Exception as error:
                        report['layout'].append({'viewport':f'{width}x{height}','route':route,'kind':'field' if field else 'base','failures':[str(error)]})
                    persist_report()
            print(f'Layout checked {width}x{height}',flush=True)
            try:
                click('settings')
                result=page.evaluate('''()=>{const d=document.querySelector('.settings-dialog'),scroll=d.querySelector('.settings-scroll'),footer=d.querySelector('.settings-footer');const before=footer.getBoundingClientRect().toJSON();scroll.scrollTop=scroll.scrollHeight;return {dialog:d.getBoundingClientRect().toJSON(),footer:footer.getBoundingClientRect().toJSON(),footerBeforeScroll:before,close:document.querySelector('#settings-close').getBoundingClientRect().toJSON()};}''')
                failures=[]
                if result['dialog']['left']<0 or result['dialog']['right']>width+2:failures.append('settings-horizontal-overflow')
                if result['footer']['bottom']>height+2 or result['footer']['top']<0:failures.append('settings-footer-offscreen')
                if abs(result['footer']['y']-result['footerBeforeScroll']['y'])>1:failures.append('settings-footer-scrolls')
                report['settingsLayout'].append({'viewport':f'{width}x{height}','failures':failures,**result})
                if width in [375,873,1280]:page.screenshot(timeout=20000,path=str(OUT/f'settings-{width}x{height}.png'),full_page=True)
                page.locator('#settings-close').click()
            except Exception as error:report['settingsLayout'].append({'viewport':f'{width}x{height}','failures':[str(error)]})
            persist_report()

    if MODE in ['all','flow']:
        page.set_viewport_size({'width':1280,'height':800})
        def flow(n):
            setup(n,True)
            if n==1:
                for source,target in [((110,100),(365,205)),((110,265),(570,205))]:drag(*source,*target)
            elif n==2:
                drag(100,310,450,62);drag(100,60,450,149)
                alternative('time','evaporate');alternative('cold','condense');click('field-test')
            elif n==3:
                for item,target in [('water','first'),('ice','middle'),('melt','last'),('weight','balance')]:alternative(item,target)
                click('field-test')
            elif n==4:
                drag(345,65,345,205);click('field-test')
            elif n==5:
                page.mouse.move(*point(407,102));page.mouse.down()
                for row in range(5):
                    xs=[407,444,482,519,557,594,632,669]
                    if row%2:xs.reverse()
                    for x in xs:page.mouse.move(*point(x,102+row*34),steps=2)
                page.mouse.up();ready(True)
                click('field-test')
            elif n==6:
                alternative('A','air');alternative('B','air')
            elif n==7:
                drag(105,170,320,195);click('field-test');drag(105,170,550,195);click('field-test')
                alternative('condition','cold')
            elif n==8:
                alternative('tray','under');click('field-test');alternative('cold','plate');click('field-test')
            elif n==9:
                nodes=[(165,55),(300,135),(450,210),(450,280),(450,350)]
                for source,target in zip(nodes[:3],nodes[1:4]):drag(*source,*target)
                page.locator('.expedition-choices').evaluate("el=>{for(let p=el;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;}")
                page.locator('#field-from').select_option('3');page.locator('#field-to').select_option('4');click('field-connect')
            elif n==10:
                alternative('time','evaporate');alternative('cold','condense');click('field-test')
            assert chapter_ready(n),f'fieldReady({n}) remained false: '+str(read(f'state.fieldwork.chapters[{n}]'))
            assert not page.locator('[data-action="field-finish"]').is_disabled(),'earned finish button must enable'
            result=read(f'state.fieldwork.chapters[{n}]')
            if n==5:
                # Native JSON ignores optional undefined measurement fields.
                before=json.loads(read('JSON.stringify(state.fieldwork.chapters[5])'))
                page.reload(wait_until='networkidle');ready(True)
                assert chapter_ready(n),'field completion must survive reload'
                assert before==json.loads(read('JSON.stringify(state.fieldwork.chapters[5])')),'chapter data changed on reload'
            page.screenshot(timeout=20000,path=str(OUT/f'field-{n}-solved.png'),full_page=True)
            return result
        for n in range(1,11):
            try:
                result=flow(n);report['flows'].append({'name':f'field-{n}','pass':True,'chapter':result});print(f'PASS field {n}',flush=True)
            except Exception as error:
                report['flows'].append({'name':f'field-{n}','pass':False,'error':str(error)});print(f'FAIL field {n}: {error}',flush=True)
                page.screenshot(timeout=20000,path=str(OUT/f'field-{n}-failure.png'),full_page=True)
            persist_report()
        try:
            setup(5,False)
            def base_point(x,y):
                box=page.locator('.phaser-stage canvas').bounding_box()
                return (box['x']+x/720*box['width'],box['y']+y/330*box['height'])
            page.mouse.move(*base_point(70,100));page.mouse.down()
            for xy in [(170,100),(220,200),(300,100)]:page.mouse.move(*base_point(*xy),steps=12)
            page.mouse.up();ready(False)
            strokes=json.loads(read('JSON.stringify(state.activities.draw.strokes)'))
            assert strokes and len(strokes[0])>=3,'real base-lab drawing must produce a stored stroke'
            pixel_js="""()=>{const c=document.querySelector('.phaser-stage canvas'),g=c.getContext('2d');return [[100,100],[450,100]].map(([x,y])=>[...g.getImageData(x*c.width/720,y*c.height/330,1,1).data]);}"""
            before_pixels=page.evaluate(pixel_js)
            assert all(b>r+50 and g>r+40 for r,g,b,a in before_pixels),'drawn blue line must visibly appear in both comparison panels'
            page.reload(wait_until='networkidle');ready(False)
            assert strokes==json.loads(read('JSON.stringify(state.activities.draw.strokes)')),'drawing coordinates changed on reload'
            after_pixels=page.evaluate(pixel_js)
            assert all(b>r+50 and g>r+40 for r,g,b,a in after_pixels),'restored strokes must paint back onto the real canvas after reload'
            page.screenshot(timeout=20000,path=str(OUT/'base-5-drawing-restored.png'),full_page=True)
            report['flows'].append({'name':'base-drawing-serialization-and-visible-restoration','pass':True,'beforePixels':before_pixels,'afterPixels':after_pixels});print('PASS real drawing stored and visibly restored in both canvases after reload',flush=True)
        except Exception as error:
            report['flows'].append({'name':'base-drawing-serialization-and-visible-restoration','pass':False,'error':str(error)});print('FAIL drawing restoration: '+str(error),flush=True)
        persist_report()
        try:
            setup(1,False)
            page.evaluate('''async()=>{const {state,save}=await import('/src/state.js');const {render}=await import('/src/app.js');Object.assign(state.activities.observe,{step:2,pours:['tall','wide'],iceMoved:true,clothRub:3,clothWet:true,time:80,records:[{kind:'cloth',time:80}]});save();render();}''')
            ready(False);click('act-next-1');ready(True)
            assert read("state.fieldwork.active===1&&state.fieldwork.pending==='act-next-1'&&state.route===1"),'base experiment must enter its own field request before proceeding'
            alternative('water','tall');alternative('ice','wide')
            click('field-finish')
            page.wait_for_selector('.concept-dialog[open]')
            assert read('state.route===1&&state.fieldwork.active===1'),'concept preview must not advance or award progress'
            page.screenshot(timeout=20000,path=str(OUT/'field-1-concept-before-reward.png'))
            page.locator('[data-concept="continue"]').click()
            if page.locator('[data-action="field-claim"]:visible').count():
                page.screenshot(timeout=20000,path=str(OUT/'field-1-seal-reward.png'),full_page=True);click('field-claim')
            ready(False)
            assert read("state.route===2&&state.fieldwork.active===0&&state.fieldwork.pending===''&&state.pages.includes(1)"),'finishing the field request must resume the original next action'
            report['flows'].append({'name':'base-fieldwork-continuation-gate','pass':True});print('PASS base experiment -> field request -> original next action',flush=True)
        except Exception as error:
            report['flows'].append({'name':'base-fieldwork-continuation-gate','pass':False,'error':str(error)});print('FAIL continuation: '+str(error),flush=True)
        persist_report()
        try:
            setup('map',False)
            page.evaluate('''async()=>{const {state,save,setPreviewMode}=await import('/src/state.js');const {render}=await import('/src/app.js');setPreviewMode(false);state.settings.adminUnlock=false;state.pages=[1];state.completed=[];state.activities.observe.pours=['tall'];save();render();}''')
            click('settings')
            page.locator('#settings-unlock').evaluate("e=>{for(let p=e.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;}")
            page.locator('#settings-unlock').click();assert read('state.settings.adminUnlock===true')
            page.locator('#settings-close').click()
            page.evaluate('''async()=>{const {state,save}=await import('/src/state.js');const {chapterState}=await import('/src/fieldwork-model.js');const {render}=await import('/src/app.js');state.route=1;state.fieldwork.active=1;state.fieldwork.chapters[1]=chapterState(1);save();render();}''')
            ready(True);drag(110,100,365,205)
            assert read("state.fieldwork.chapters[1].marks.includes('water-tall')"),'preview activity should work in memory'
            persisted=page.evaluate("JSON.parse(localStorage.getItem('water-drop-lab:v1'))")
            assert persisted['pages']==[1] and not persisted['fieldwork']['chapters'],'preview activity leaked into student storage'
            click('settings')
            page.locator('#settings-unlock').evaluate("e=>{for(let p=e.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;}")
            page.locator('#settings-unlock').click();page.locator('#settings-close').click()
            assert read("state.settings.adminUnlock===false&&state.route==='map'&&state.pages.length===1&&state.pages[0]===1&&Object.keys(state.fieldwork.chapters).length===0&&state.activities.observe.pours.join(',')==='tall'"),'disabling preview must restore original student records'
            report['flows'].append({'name':'teacher-preview-student-record-isolation','pass':True});print('PASS teacher preview isolates real pointer activity from stored student progress',flush=True)
        except Exception as error:
            report['flows'].append({'name':'teacher-preview-student-record-isolation','pass':False,'error':str(error)});print('FAIL teacher preview: '+str(error),flush=True)
        persist_report()
        try:
            setup(1,True)
            page.evaluate("async()=>{const {state,save}=await import('/src/state.js');state.settings.adminUnlock=false;save();}")
            click('settings')
            page.locator('#settings-bgm').click();page.locator('#settings-bgm-volume').evaluate("el=>{el.value='75';el.dispatchEvent(new Event('input',{bubbles:true}));}")
            assert read('state.settings.bgm===true&&state.settings.sfx===false&&state.settings.bgmVolume===75')
            page.locator('#settings-sfx').click();assert read('state.settings.sfx===true')
            page.locator('#settings-reset').click();assert page.evaluate("document.activeElement.id==='settings-cancel-reset'")
            page.locator('#settings-cancel-reset').click();assert read('state.fieldwork.active===1')
            page.locator('#settings-reset').click();page.locator('#settings-confirm-reset').click()
            assert read("state.route==='home'&&state.settings.bgm===true&&state.settings.sfx===true&&state.settings.bgmVolume===75&&state.completed.length===0&&Object.keys(state.fieldwork.chapters).length===0")
            page.reload(wait_until='networkidle')
            assert read('state.settings.bgm===true&&state.settings.sfx===true&&state.settings.bgmVolume===75')
            report['flows'].append({'name':'settings-reset-audio-preservation','pass':True})
            print('PASS settings split audio, cancellation focus, reset and reload preservation',flush=True)
        except Exception as error:
            report['flows'].append({'name':'settings-reset-audio-preservation','pass':False,'error':str(error)});print('FAIL settings: '+str(error),flush=True)
        persist_report()

    if MODE in ['all','flow','core']:
        page.set_viewport_size({'width':1280,'height':800})
        for fault in ['cooling','connection']:
            name='core-repair-field10-ending-reload-'+fault
            try:
                # Isolated final-flow fixture: previously validated research records,
                # nine model-ready field chapters, and a compared working design.
                # The diagnosis, repair, water delivery and final field request are
                # performed through the actual UI below, never pre-completed.
                page.evaluate('''async fault=>{
                  document.querySelectorAll('dialog[open]').forEach(d=>d.close());
                  const {state,initialState,save,setPreviewMode}=await import('/src/state.js');
                  const {targetParts,testCollector}=await import('/src/domain.js');
                  const {newDiagnosis}=await import('/src/collector-model.js');
                  const {chapterState,fieldAction}=await import('/src/fieldwork-model.js');
                  const {resetFinalPreview}=await import('/src/workshop.js');
                  const {render}=await import('/src/app.js');
                  setPreviewMode(false);Object.assign(state,initialState());resetFinalPreview();
                  Object.assign(state.settings,{sound:false,bgm:false,sfx:false,reduced:true,adminUnlock:false});
                  state.route=10;state.lastScreen=10;state.completed=[1,2,3,4,5];state.pages=[1,2,3,4,5,6,7,8,9];
                  const parts=structuredClone(targetParts),bad=testCollector(parts,false,20),good=testCollector(parts,true,20);
                  Object.assign(state.lab.workshop,{parts,cold:true,angle:20,trials:[bad,good]});
                  state.evidence={
                    1:{records:['선행 관찰 기록 fixture']},
                    2:{prediction:60,result:65.4,mass:100,trials:[{fill:100,safe:false},{fill:75,safe:true}]},
                    3:{observations:['선행 증발·끓음 비교 기록 fixture']},
                    4:{chain:['air','cold','drops'],mass:252,transfer:'차가운 병 표면'},
                    5:{parts:structuredClone(parts),cold:true,angle:20,result:good,first:0,last:100,trials:2,comparison:[bad,good],reason:'cold'}
                  };
                  state.fieldwork.introSeen=true;
                  for(let n=1;n<=9;n++){
                    let c=chapterState(n);const act=(action,payload={})=>c=fieldAction(n,c,action,payload);
                    const place=(item,target)=>act('place',{item,target});
                    if(n===1)for(const item of ['water','ice'])for(const target of ['tall','wide'])place(item,target);
                    if(n===2){for(const [item,target] of [['cold','freeze'],['warm','melt'],['time','evaporate'],['cold','condense']])place(item,target);act('test');}
                    if(n===3){for(const [item,target] of [['water','first'],['ice','middle'],['melt','last'],['weight','balance']])place(item,target);act('test');}
                    if(n===4){act('setting',{value:100});act('test');act('setting',{value:75});act('test');}
                    if(n===5){for(let cell=0;cell<24;cell++)act('spread',{cell});place('destination','air');act('test');}
                    if(n===6){for(const site of ['surface','inside','level'])act('inspect',{site});place('A','air');place('B','air');act('test');}
                    if(n===7){place('pack','A');act('test');place('pack','B');act('test');place('condition','cold');}
                    if(n===8){act('test');place('cold','plate');place('tray','under');act('test');}
                    if(n===9)for(let from=0;from<4;from++)act('connect',{from,to:from+1});
                    state.fieldwork.chapters[n]=c;
                  }
                  state.lab.final.diagnosis=newDiagnosis(state.evidence[5],fault);save();render();
                }''',fault)
                ready(False);page.reload(wait_until='networkidle');ready(False)
                assert read('state.lab.final.diagnosis.fault')==fault
                assert not read('state.lab.final.diagnosis.resolved||state.restored||state.fieldwork.chapters[10]')
                click('diagnose-'+fault);click('diagnosis-evidence-'+('4' if fault=='cooling' else '5'))
                page.locator('#close-dialog').click()
                if fault=='cooling':click('core-cooling')
                else:page.locator('#diagnosis-funnel').evaluate("el=>{el.value='420';el.dispatchEvent(new Event('change',{bubbles:true}));}")
                click('diagnosis-test');assert read('state.lab.final.diagnosis.resolved')
                click('connect-core')
                page.locator('#final-valve').focus();page.keyboard.press('End')
                click('test-core');assert read('state.lab.final.tested')
                page.locator('#final-lever').focus();page.keyboard.press('End');ready(True)
                assert read("state.route===10&&!state.restored&&state.fieldwork.active===10&&state.fieldwork.pending==='field-ending'"),'lever must open the unsolved final field request before the ending'
                assert page.locator('[data-action="field-finish"]').is_disabled()
                alternative('time','evaporate');alternative('cold','condense');click('field-test')
                assert chapter_ready(10)
                page.screenshot(timeout=20000,path=str(OUT/f'core-{fault}-field10-ready.png'),full_page=True)
                click('field-finish');page.wait_for_selector('.concept-dialog[open]')
                assert not read('state.restored'),'video must open before granting the final completion'
                page.locator('[data-concept="continue"]').click();page.wait_for_selector('.ending-main')
                assert read("state.route==='ending'&&state.restored&&state.pages.includes(10)&&state.fieldwork.active===0&&state.fieldwork.pending===''&&state.lab.final.tested&&state.lab.final.diagnosis.resolved"),'final field finish must preserve repaired core state and unlock the ending'
                assert read('state.evidence[5].cold&&state.evidence[5].parts.funnel.x===420')
                page.reload(wait_until='networkidle');page.wait_for_selector('.ending-main')
                assert read("state.route==='ending'&&state.restored&&state.pages.includes(10)&&state.lab.final.diagnosis.resolved&&state.fieldwork.chapters[10].done")
                page.screenshot(timeout=20000,path=str(OUT/f'core-{fault}-ending-restored.png'),full_page=True)
                report['flows'].append({'name':name,'pass':True,'fixture':'Prior five research records, pages 1–9, model-ready field chapters 1–9, and compared valid target design; core repair and field 10 completed through UI.','fault':fault,'final':read("({route:state.route,restored:state.restored,pages:state.pages,fieldwork:state.fieldwork.chapters[10],diagnosisResolved:state.lab.final.diagnosis.resolved})")})
                print('PASS '+fault+' repair -> real lever -> field 10 -> ending -> reload',flush=True)
            except Exception as error:
                report['flows'].append({'name':name,'pass':False,'error':str(error)});print('FAIL '+name+': '+str(error),flush=True)
                page.screenshot(timeout=20000,path=str(OUT/f'core-{fault}-failure.png'),full_page=True)
            persist_report()

    # Unfinished generated assets are reported distinctly; they are not silent passes.
    report['pendingGeneratedAssets']=[r for r in report['httpErrors'] if any(name in r['url'] for name in ['story-repair.webp','rescue-reward.webp'])]
    report['unexpectedHttpErrors']=[r for r in report['httpErrors'] if r not in report['pendingGeneratedAssets']]
    report['expectedNavigationCancellations']=[r for r in report['networkFailures'] if (r['url'].startswith('blob:') or '/assets/concepts/' in r['url']) and r['failure']=='net::ERR_ABORTED']
    report['unexpectedNetworkFailures']=[r for r in report['networkFailures'] if r not in report['expectedNavigationCancellations']]
    report['summary']={'screens':len(report['layout']),'layoutFailures':sum(bool(row.get('failures')) for row in report['layout']),'settingsScreens':len(report['settingsLayout']),'settingsLayoutFailures':sum(bool(row.get('failures')) for row in report['settingsLayout']),'flowPasses':sum(row['pass'] for row in report['flows']),'flowFailures':sum(not row['pass'] for row in report['flows']),'pageErrors':len(report['pageErrors']),'consoleErrors':len(report['consoleErrors']),'networkFailures':len(report['networkFailures']),'unexpectedNetworkFailures':len(report['unexpectedNetworkFailures']),'unexpectedHttpErrors':len(report['unexpectedHttpErrors']),'pendingGeneratedAssets':len(report['pendingGeneratedAssets'])}
    persist_report();print(json.dumps(report['summary'],ensure_ascii=False),flush=True)
    if MODE=='core':
        # Preserve the earlier 14 checked flows; add only the new regression run.
        prior_path=OUT/'expedition-flow-results.json'
        if prior_path.exists():
            prior=json.loads(prior_path.read_text(encoding='utf-8'))
            names={row['name'] for row in report['flows']}
            prior['flows']=[row for row in prior['flows'] if row['name'] not in names]+report['flows']
            prior['additionalCoreReport']='expedition-core-results.json';prior['finishedAt']=report['finishedAt']
            for key in ['pageErrors','consoleErrors','httpErrors','networkFailures']:
                prior[key]=prior.get(key,[])+report.get(key,[])
            prior['summary'].update(flowPasses=sum(row['pass'] for row in prior['flows']),flowFailures=sum(not row['pass'] for row in prior['flows']),pageErrors=len(prior['pageErrors']),consoleErrors=len(prior['consoleErrors']),networkFailures=len(prior['networkFailures']))
            prior_path.write_text(json.dumps(prior,ensure_ascii=False,indent=2),encoding='utf-8')
    context.close();browser.close()
    assert not report['summary']['layoutFailures'] and not report['summary']['settingsLayoutFailures'] and not report['summary']['flowFailures'] and not report['pageErrors'] and not report['consoleErrors'] and not report['unexpectedHttpErrors'] and not report['unexpectedNetworkFailures'],report['summary']

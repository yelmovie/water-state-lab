"""Real pointer and time-drag checks in one isolated, disposable Chrome context.

QA_URL defaults to the source server on port 4324. QA_MODE can be all, flow,
layout or final. Layout artifacts are written under docs/reviews/screenshots on D:.
The field seals used by the original experiment flow are explicit fixtures;
scripts/expedition-qa.py owns the separate field-mission interaction checks.
"""
import json, os
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/reviews/screenshots/upgrade-20261024/time-drag'
OUT.mkdir(parents=True,exist_ok=True)
(ROOT/'tmp').mkdir(exist_ok=True)
os.environ['TEMP']=os.environ['TMP']=str(ROOT/'tmp')
URL=os.environ.get('QA_URL','http://127.0.0.1:4324')
MODE=os.environ.get('QA_MODE','all')
PREPARED={
    1:"Object.assign(state.activities.observe,{step:2,pours:['tall','wide'],iceMoved:true,clothWet:true});",
    5:"state.activities.draw.strokes=[[[70,100],[130,180],[250,100],[290,200]]];state.inquiry.drawPrediction='thin';",
    6:"state.activities.compare.baseline=true;state.activities.compare.heat=100;",
    7:"Object.assign(state.activities.dew,{wiped:['cold','room'],sealed:true});state.inquiry.dewHypothesis='air';",
    8:"""Object.assign(state.activities.dew,{wiped:['cold','room'],sealed:true,time:100,rewiped:true,againTime:100,again:true,
        records:[{kind:'before',cold:dewTrial(0),room:dewTrial(0,false),sealed:true},
        {kind:'after',cold:dewTrial(100),room:dewTrial(100,false),sealed:true}]});
        Object.assign(state.activities.explain,{evidence:['sealed','contrast'],chain:['air','cold','drops'],bottleWiped:true});
        state.inquiry.transferPrediction='cold';"""
}
ACTIVITY_KEYS={1:'observe',5:'draw',6:'compare',7:'dew',8:'explain'}
report={'url':URL,'mode':MODE,'errors':[],'layout':[],'timeDrags':[],'flows':[]}

def save_report():
    name='results.json' if MODE=='all' else f'results-{MODE}.json'
    (OUT/name).write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')

with sync_playwright() as p:
    browser=p.chromium.launch(channel='chrome',headless=True)
    page=browser.new_page(viewport={'width':1280,'height':800})
    page.set_default_timeout(30000)
    page.set_default_navigation_timeout(30000)
    errors=report['errors']
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(URL,wait_until='networkidle')

    def read(expression):
        return page.evaluate('async()=>{const {state}=await import("/src/state.js");return '+expression+';}')

    def ready():
        page.wait_for_selector('.phaser-stage[data-ready=true]')
        page.wait_for_function("()=>document.querySelector('.phaser-stage canvas')?.getBoundingClientRect().width>100")

    def setup(route,extra=''):
        page.evaluate('''async({route,extra})=>{const {state,initialState,save,setPreviewMode}=await import('/src/state.js');
            document.querySelectorAll('dialog[open]').forEach(d=>d.close());setPreviewMode(false);
            const {render}=await import('/src/app.js');Object.assign(state,initialState());
            Object.assign(state.settings,{sound:false,bgm:false,sfx:false,reduced:true,adminUnlock:true});state.route=route;
            state.fieldwork.introSeen=true;
            const {targetParts,testCollector}=await import('/src/domain.js');
            const {newDiagnosis}=await import('/src/collector-model.js');
            const {dewTrial}=await import('/src/activity-model.js');
            const {chapterState}=await import('/src/fieldwork-model.js');
            const {handleInquiry}=await import('/src/inquiry.js');
            // Reset the session-only time preview between independent fixtures.
            handleInquiry('ix-draw-new',{render(){}});
            state.fieldwork.chapters[1]={...chapterState(1),marks:['water-tall','water-wide','ice-tall','ice-wide']};
            state.fieldwork.chapters[2]={...chapterState(2),marks:['freeze','melt','evaporate','condense']};
            state.fieldwork.chapters[10]={...chapterState(10),marks:['evaporate','condense']};
            eval(extra);save();render();}''',{'route':route,'extra':extra})
        ready()

    def click(action):
        selector='[data-action="'+action+'"]'
        page.locator(selector).evaluate_all("es=>es.forEach(e=>{for(let p=e.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;})")
        page.locator(selector+':visible').first.click()

    def value(selector,number):
        page.locator(selector).evaluate("(e,n)=>{e.value=String(n);e.dispatchEvent(new Event('change',{bubbles:true}));}",number)

    def point(x,y):
        box=page.locator('.phaser-stage canvas').bounding_box()
        return (box['x']+x/720*box['width'],box['y']+y/330*box['height'])

    def drag(x,y,tx,ty,hold=0):
        ready();page.mouse.move(*point(x,y));page.mouse.down()
        page.mouse.move(*point(tx,ty),steps=15)
        if hold:page.wait_for_timeout(hold)
        page.mouse.up();ready()

    def time_drag(n,fraction):
        """Move the native range thumb with real pointer input, never JS events."""
        slider=page.locator(f'#inquiry-time-{n}')
        slider.scroll_into_view_if_needed()
        box=slider.bounding_box()
        values=slider.evaluate('(e)=>({value:+e.value,min:+e.min,max:+e.max})')
        # The custom thumb is 36px wide plus 2px horizontal input padding.
        inset=min(20,box['width']/4)
        track=box['width']-2*inset
        current=(values['value']-values['min'])/(values['max']-values['min'])
        start=box['x']+inset+track*current
        target=box['x']+inset+track*fraction
        if fraction==0:target=box['x']+1
        if fraction==1:target=box['x']+box['width']-1
        middle=box['y']+box['height']/2
        page.mouse.move(start,middle);page.mouse.down()
        page.mouse.move(target,middle,steps=18);page.mouse.up();ready()

    def verify_time_drag(n,label=''):
        maximum=110 if n==5 else 100
        key=ACTIVITY_KEYS[n]
        time_drag(n,1)
        before=read(f'state.activities.{key}')
        live=before['againTime'] if n==7 and before['rewiped'] else before['time']
        assert live==maximum,{'stage':n,'expected':maximum,'actual':live}
        time_drag(n,.25)
        shown=page.evaluate('async n=>(await import("/src/inquiry.js")).observationTime(n)',n)
        assert 0<shown<maximum,{'stage':n,'preview':shown}
        assert read(f'state.activities.{key}')==before,{'stage':n,'message':'rewind changed original observations'}
        assert page.locator('[data-action="ix-record"]').is_disabled(),{'stage':n,'message':'record enabled while reviewing'}
        if MODE!='layout':page.screenshot(path=str(OUT/f'flow-{n}{label}-preview.png'))
        time_drag(n,1)
        assert not page.locator('[data-action="ix-record"]').is_disabled(),{'stage':n,'message':'record stayed disabled at latest time'}
        assert read(f'state.activities.{key}')==before
        report['timeDrags'].append({'stage':n,'label':label,'maximum':maximum,'preview':shown,'savedRecordsUnchanged':True})
        save_report()

    def check_time_layouts():
        for width,height in [(1280,800),(1024,768),(768,1024)]:
            page.set_viewport_size({'width':width,'height':height})
            for n in [1,5,6,7,8]:
                setup(n,PREPARED[n])
                page.locator(f'#inquiry-time-{n}').scroll_into_view_if_needed()
                result=page.evaluate('''()=>{
                    const root=document.querySelector('.time-controls');
                    const box=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height};};
                    const hit=(a,b)=>Math.min(a.right,b.right)-Math.max(a.left,b.left)>2&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>2;
                    const children=[...root.children].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.height;}).map(e=>({name:e.className||e.id,...box(e)}));
                    const buttons=[...root.querySelectorAll('button')].map(e=>({name:e.dataset.action,...box(e)}));
                    const overlaps=[];
                    for(const group of [children,buttons])group.forEach((a,i)=>group.slice(i+1).forEach(b=>{if(hit(a,b))overlaps.push([a.name,b.name]);}));
                    const controls=box(root),canvas=box(document.querySelector('.phaser-stage canvas'));
                    const ranges=[...root.querySelectorAll('input[type=range]')].map(e=>({id:e.id,...box(e)}));
                    return {pageWidthOverflow:document.documentElement.scrollWidth>innerWidth+2,
                        controlsOutsideWidth:controls.left< -2||controls.right>innerWidth+2,
                        overlaps,canvasOverlap:hit(controls,canvas),controls,ranges,
                        undersizedRanges:ranges.filter(r=>r.height<48||r.width<48)};
                }''')
                result.update({'viewport':f'{width}x{height}','stage':n})
                report['layout'].append(result)
                page.screenshot(path=str(OUT/f'stage-{n}-{width}x{height}.png'))
                save_report()
                print(f'LAYOUT: {width}x{height} stage {n} range={result["ranges"][0]["height"]:.1f}px overlaps={len(result["overlaps"])}',flush=True)
        page.set_viewport_size({'width':1280,'height':800})

    def interaction_flow():
        setup(1)
        for x in [300,535]:drag(100,150,x,150)
        assert read('state.activities.observe.pours.length')==2
        click('act-observe-step-1');drag(195,150,520,150)
        assert read('state.activities.observe.iceMoved')
        click('act-observe-step-2');ready();page.mouse.click(*point(360,150));ready()
        verify_time_drag(1)
        click('ix-record');click('act-next-1');ready()
        cards=page.evaluate("async()=>{const {sortCards}=await import('/src/activity-model.js');return sortCards;}")
        for card in cards[:2]:drag(360,74,{'solid':130,'liquid':360,'gas':590}[card['type']],245)
        for card in cards[2:]:
            click('ix-sort-place-'+card['type']);click('ix-sort-check')
        assert read('Object.keys(state.activities.sort.placed).length')==6
        click('act-complete-1')
        assert read('state.completed.includes(1) && state.evidence[1].records.length===6')
        click('reward-map')
        report['flows'].append('immediate pouring, ice, cloth time drag and mixed classifications')
        print('PASS: immediate pouring, ice, cloth and mixed canvas/button classifications earn the first record',flush=True)

        setup(5)
        page.mouse.move(*point(70,100));page.mouse.down()
        for xy in [(130,180),(250,100),(290,200)]:page.mouse.move(*point(*xy),steps=12)
        page.mouse.up();ready()
        assert read('state.activities.draw.strokes[0].length')>=3
        click('ix-draw-predict-thin')
        verify_time_drag(5)
        assert read('state.activities.draw.records.length')==3
        click('ix-draw-view-0')
        assert read('state.inquiry.drawMode==="record" && state.activities.draw.time===110')
        page.reload(wait_until='networkidle')
        assert read('state.activities.draw.records.length===3 && state.activities.draw.time===110')
        report['flows'].append('drawing, three time records, record review and reload preservation')
        print('PASS: actual drawing, three time records, record review and reload preservation',flush=True)

        setup(6,PREPARED[6])
        verify_time_drag(6)
        click('ix-record')
        for site in ['surface','inside','level']:click('ix-lens-'+site)
        assert read('state.activities.compare.pins.length')==3
        report['flows'].append('heating time drag and three alternative lens observations')
        print('PASS: heating time drag and all three alternative lens observations',flush=True)

        setup(7)
        for action in ['ix-dew-predict-air','ix-wipe-cold','ix-wipe-room','act-dew-seal']:
            click(action)
        verify_time_drag(7,'-before')
        click('ix-record');ready()
        assert read('state.activities.dew.records.length')==2
        drag(205,125,215,175)
        assert read('state.activities.dew.rewiped && state.inquiry.dewRegion.length>0 && state.inquiry.dewRegion.length<20')
        verify_time_drag(7,'-again')
        click('ix-record')
        assert read('state.activities.dew.again')
        report['flows'].append('partial pointer wiping, rewind and condensation return')
        print('PASS: partial pointer wiping and condensation return in the wiped region',flush=True)

        setup(8,PREPARED[8])
        verify_time_drag(8)
        click('ix-record')
        assert read('state.activities.explain.transfer')
        report['flows'].append('new bottle time drag and explicit observation recording')
        print('PASS: new bottle time drag, preview guard and explicit observation recording',flush=True)

        setup(9)
        before=read('state.lab.workshop.parts.plate.x')
        drag(110,61,190,61)
        assert read('state.lab.workshop.parts.plate.x')!=before
        page.reload(wait_until='networkidle');ready()
        assert read('state.lab.workshop.parts.plate.x')!=before
        report['flows'].append('workshop part dragging and reload preservation')
        print('PASS: workshop part dragging and reload preservation',flush=True)

    def grip_flow():
        setup(9,'state.lab.workshop.parts=structuredClone(targetParts);state.lab.workshop.angle=20;state.lab.workshop.cold=true;')
        before=read('({angle:state.lab.workshop.angle,funnel:state.lab.workshop.parts.funnel})')
        # This starts 32 logical pixels left of the visible radius-24 handle.
        # The widened hit area must catch the drag without moving the funnel.
        drag(313,144,313,164)
        assert read('state.lab.workshop.angle')!=before['angle']
        assert read('state.lab.workshop.parts.funnel')==before['funnel']
        page.screenshot(path=str(OUT/'grip-stage-9.png'))
        report['flows'].append('stage 9 rotation handle responds outside its visible circle without moving funnel')
        print('PASS: stage 9 expanded rotation handle hit area',flush=True)

    def final_flow():
        for fault in ['cooling','connection']:
            setup(10,"""state.settings.adminUnlock=false;state.completed=[1,2,3,4,5];state.pages=[1,2,3,4,5,6,7,8,9];
                const result=testCollector(targetParts,true,20);
                state.evidence[4]={chain:['air','cold','drops']};
                state.evidence[5]={parts:structuredClone(targetParts),cold:true,angle:20,result,first:0,last:100};
                state.lab.final.diagnosis=newDiagnosis(state.evidence[5],'"""+fault+"');")
            page.reload(wait_until='networkidle');ready()
            assert read('state.lab.final.diagnosis.fault')==fault
            if fault=='cooling':
                assert page.locator('.compact-guide > .concept-revisit').count()==0
                click('buddy-hint')
                page.wait_for_selector('#coach-help')
                page.screenshot(path=str(OUT/'stage-10-hint-concept.png'))
                click('concept-replay')
                page.wait_for_selector('.concept-dialog[open]')
                page.locator('[data-concept="close"]').click()
                page.wait_for_selector('.concept-dialog',state='detached')
                if page.locator('#coach-help').count():page.locator('#coach-help .icon-btn').click()
                report['flows'].append('hint panel opens concept replay and returns to experiment')
            click('diagnose-'+fault);click('diagnosis-evidence-'+('4' if fault=='cooling' else '5'))
            page.locator('#dialog').evaluate('e=>e.close()')
            if fault=='cooling':click('core-cooling')
            else:value('#diagnosis-funnel',420)
            click('diagnosis-test');click('connect-core')
            # The visible valve radius is 23; x=517 is 32px left of its centre.
            drag(517,270,517,235)
            assert read('state.lab.final.valve')==100
            page.screenshot(path=str(OUT/f'grip-stage-10-{fault}.png'))
            click('test-core');value('#final-lever',100)
            page.wait_for_selector('.ending-main')
            assert read('state.restored && state.pages.includes(10) && state.evidence[5].cold && state.evidence[5].parts.funnel.x===420')
            page.reload(wait_until='networkidle');page.wait_for_selector('.ending-main')
            assert read('state.restored')
            report['flows'].append(fault+' diagnosis, evidence, repair, water delivery and saved ending')
            print('PASS: '+fault+' diagnosis, evidence, repair, water delivery and saved ending',flush=True)

    try:
        if MODE in ['all','layout']:check_time_layouts()
        if MODE in ['all','flow']:interaction_flow()
        if MODE in ['all','flow','final']:grip_flow();final_flow()
        invalid=[r for r in report['layout'] if r['pageWidthOverflow'] or r['controlsOutsideWidth'] or r['overlaps'] or r['canvasOverlap'] or r['undersizedRanges']]
        report['invalidLayouts']=invalid
        assert not errors,errors
        assert not invalid,invalid
        report['result']='passed'
        print(json.dumps({'errors':errors,'layouts':len(report['layout']),'timeDrags':len(report['timeDrags']),'result':'passed'}),flush=True)
    except Exception as error:
        report['result']='failed';report['failure']=str(error)
        page.screenshot(path=str(OUT/('failure.png' if MODE=='all' else f'failure-{MODE}.png')))
        raise
    finally:
        save_report()
        browser.close()

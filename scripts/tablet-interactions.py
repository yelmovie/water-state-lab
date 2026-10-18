"""Real pointer and button checks in an isolated, disposable Chrome context."""
import json, os
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
os.environ['TEMP']=os.environ['TMP']=str(ROOT/'tmp')

with sync_playwright() as p:
    browser=p.chromium.launch(channel='chrome',headless=True)
    page=browser.new_page(viewport={'width':1280,'height':800})
    page.set_default_timeout(10000)
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(os.environ.get('QA_URL','http://127.0.0.1:4320'),wait_until='networkidle')

    def read(expression):
        return page.evaluate('async()=>{const {state}=await import("/src/state.js");return '+expression+';}')

    def ready():
        page.wait_for_selector('.phaser-stage[data-ready=true]')
        page.wait_for_function("()=>document.querySelector('.phaser-stage canvas')?.getBoundingClientRect().width>400")

    def setup(route,extra=''):
        page.evaluate('''async({route,extra})=>{const {state,initialState,save}=await import('/src/state.js');
            const {render}=await import('/src/app.js');Object.assign(state,initialState());
            state.settings.sound=false;state.settings.reduced=true;state.settings.adminUnlock=true;state.route=route;
            const {targetParts,testCollector}=await import('/src/domain.js');
            const {newDiagnosis}=await import('/src/collector-model.js');
            eval(extra);save();render();}''',{'route':route,'extra':extra})
        ready()

    def click(action):
        button=page.locator('[data-action="'+action+'"]').first
        button.evaluate("e=>{for(let p=e.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;}")
        button.click()

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

    setup(1)
    for x in [300,535]:drag(100,150,x,150,3200)
    assert read('state.activities.observe.pours.length')==2
    click('act-observe-step-1');drag(195,150,520,150)
    assert read('state.activities.observe.iceMoved')
    click('act-observe-step-2');ready();page.mouse.click(*point(360,150));ready()
    for _ in range(4):click('ix-forward')
    click('ix-record');click('act-next-1');ready()
    cards=page.evaluate("async()=>{const {sortCards}=await import('/src/activity-model.js');return sortCards;}")
    for card in cards[:2]:drag(360,74,{'solid':130,'liquid':360,'gas':590}[card['type']],245)
    for card in cards[2:]:
        click('ix-sort-place-'+card['type']);click('ix-sort-check')
    assert read('Object.keys(state.activities.sort.placed).length')==6
    click('act-complete-1')
    assert read('state.completed.includes(1) && state.evidence[1].records.length===6')
    click('reward-map')
    print('PASS: pouring, ice, cloth and six canvas classifications earn the first record',flush=True)

    setup(5)
    page.mouse.move(*point(70,100));page.mouse.down()
    for xy in [(130,180),(250,100),(290,200)]:page.mouse.move(*point(*xy),steps=12)
    page.mouse.up();ready()
    assert read('state.activities.draw.strokes[0].length')>=3
    click('ix-draw-predict-thin')
    for _ in range(5):click('ix-forward')
    assert read('state.activities.draw.records.length')==3
    click('ix-draw-view-0')
    assert read('state.inquiry.drawMode==="record" && state.activities.draw.time===110')
    page.reload(wait_until='networkidle')
    assert read('state.activities.draw.records.length===3 && state.activities.draw.time===110')
    print('PASS: actual drawing, three time records, record review and reload preservation',flush=True)

    setup(6,'state.activities.compare.baseline=true;state.activities.compare.heat=100;state.activities.compare.time=100;')
    for site in ['surface','inside','level']:click('ix-lens-'+site)
    assert read('state.activities.compare.pins.length')==3
    print('PASS: all three lens observations remain available through alternative buttons',flush=True)

    setup(7)
    for action in ['ix-dew-predict-air','ix-wipe-cold','ix-wipe-room','act-dew-seal']:
        click(action)
    for _ in range(4):click('ix-forward')
    click('ix-record');ready()
    assert read('state.activities.dew.records.length')==2
    drag(205,125,215,175)
    assert read('state.activities.dew.rewiped && state.inquiry.dewRegion.length>0 && state.inquiry.dewRegion.length<20')
    for _ in range(4):click('ix-forward')
    click('ix-record')
    assert read('state.activities.dew.again')
    print('PASS: partial pointer wiping and condensation return in the wiped region',flush=True)

    setup(9)
    before=read('state.lab.workshop.parts.plate.x')
    drag(110,61,190,61)
    assert read('state.lab.workshop.parts.plate.x')!=before
    page.reload(wait_until='networkidle');ready()
    assert read('state.lab.workshop.parts.plate.x')!=before
    print('PASS: workshop part dragging and reload preservation',flush=True)

    for fault in ['cooling','connection']:
        setup(10,"""state.settings.adminUnlock=false;state.completed=[1,2,3,4,5];state.pages=[1,2,3,4,5,6,7,8,9];
            const result=testCollector(targetParts,true,20);
            state.evidence[4]={chain:['air','cold','drops']};
            state.evidence[5]={parts:structuredClone(targetParts),cold:true,angle:20,result,first:0,last:100};
            state.lab.final.diagnosis=newDiagnosis(state.evidence[5],'"""+fault+"');")
        page.reload(wait_until='networkidle');ready()
        assert read('state.lab.final.diagnosis.fault')==fault
        click('diagnose-'+fault);click('diagnosis-evidence-'+('4' if fault=='cooling' else '5'))
        page.locator('#dialog').evaluate('e=>e.close()')
        if fault=='cooling':click('core-cooling')
        else:
            value('#diagnosis-funnel',420)
        click('diagnosis-test');click('connect-core')
        value('#final-valve',100)
        click('test-core')
        value('#final-lever',100)
        page.wait_for_selector('.ending-main')
        assert read('state.restored && state.pages.includes(10) && state.evidence[5].cold && state.evidence[5].parts.funnel.x===420')
        page.reload(wait_until='networkidle');page.wait_for_selector('.ending-main')
        assert read('state.restored')
        print('PASS: '+fault+' diagnosis, evidence, repair, water delivery and saved ending',flush=True)

    assert not errors,errors
    print(json.dumps({'errors':errors,'result':'passed'}),flush=True)
    browser.close()

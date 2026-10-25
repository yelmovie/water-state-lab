"""Isolated QA for the 2026-10-24 upgrade; preserves previous QA evidence.

QA_URL chooses the server. QA_OUT chooses a new output directory under ROOT.
Modes: assets, experience (existing suite), network (existing suite), supplemental.
Only fresh Chrome profiles and synthetic learner records are used.
"""
import argparse
import hashlib
import json
import os
import re
import subprocess
import time
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / os.environ.get('QA_OUT', 'docs/reviews/screenshots/upgrade-20261024/final')
OUT.mkdir(parents=True, exist_ok=True)
os.environ['TEMP'] = os.environ['TMP'] = str(ROOT / 'tmp')
URL = os.environ.get('QA_URL', 'http://127.0.0.1:4318')
os.environ['QA_URL'] = URL


def write(name, data):
    (OUT / name).write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')


def assets():
    from PIL import Image
    source_paths = [ROOT / 'index.html', *sorted((ROOT / 'src').rglob('*'))]
    sources = {p.relative_to(ROOT).as_posix(): p.read_text(encoding='utf-8')
               for p in source_paths if p.is_file() and p.suffix in {'.js', '.ts', '.jsx', '.tsx', '.css', '.json', '.html'}}
    inventory, by_hash, totals = [], defaultdict(list), defaultdict(lambda: {'count': 0, 'bytes': 0})
    ffprobe = Path(os.environ.get('FFPROBE', 'D:/tools/ffmpeg/ffprobe.exe'))
    for path in sorted((ROOT / 'public/assets').rglob('*')):
        if not path.is_file():
            continue
        rel, suffix = path.relative_to(ROOT).as_posix(), path.suffix.lower()
        kind = ('image' if suffix in {'.png', '.jpg', '.jpeg', '.webp', '.svg'} else
                'video' if suffix in {'.mp4', '.webm'} else 'audio' if suffix in {'.ogg', '.mp3', '.wav'} else
                'font' if suffix in {'.woff', '.woff2', '.ttf'} else '3d' if suffix in {'.glb', '.gltf'} else 'other')
        row = {'path': rel, 'bytes': path.stat().st_size, 'kind': kind,
               'modified': time.strftime('%Y-%m-%dT%H:%M:%S', time.localtime(path.stat().st_mtime)),
               'sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
               'directReferences': [name for name, body in sources.items() if path.name in body]}
        if kind == 'image' and suffix != '.svg':
            with Image.open(path) as img:
                row['dimensions'] = list(img.size)
        if kind == 'video' and ffprobe.exists():
            probe = subprocess.run([str(ffprobe), '-v', 'error', '-show_entries',
                                    'stream=codec_name,width,height,pix_fmt:format=duration', '-of', 'json', str(path)],
                                   capture_output=True, text=True, check=True)
            row['probe'] = json.loads(probe.stdout)
            row['dynamicReference'] = 'src/concepts.js selects stage-${n}.webm or .mp4'
        elif path.parent.name == 'concepts':
            row['dynamicReference'] = 'src/concepts.js uses stage-${n}.webp'
        totals[kind]['count'] += 1
        totals[kind]['bytes'] += row['bytes']
        inventory.append(row)
        by_hash[row['sha256']].append(rel)
    missing = []
    for name, body in sources.items():
        for match in re.finditer(r"/assets/[A-Za-z0-9_./-]+\.[A-Za-z0-9]+", body):
            path = ROOT / 'public' / match.group(0).lstrip('/')
            if not path.is_file():
                missing.append({'source': name, 'path': match.group(0)})
    data = {'measuredAt': time.strftime('%Y-%m-%dT%H:%M:%S'), 'totals': dict(totals),
            'inventory': inventory, 'duplicateHashes': [paths for paths in by_hash.values() if len(paths) > 1],
            'missingLiteralPaths': missing, 'ffprobeAvailable': ffprobe.exists(),
            'note': 'Static references are candidates only; dynamic clip paths and sprite atlases are retained.'}
    write('asset-results.json', data)
    print(json.dumps({key: data[key] for key in ['totals', 'duplicateHashes', 'missingLiteralPaths', 'ffprobeAvailable']}, ensure_ascii=False))


def legacy(name):
    path = ROOT / 'scripts' / name
    source = path.read_text(encoding='utf-8')
    if name == 'experience-qa.py':
        source = source.replace("OUT=ROOT/'docs/reviews/screenshots/experience-20261022'", 'OUT=Path(os.environ[\'QA_UPGRADE_OUT\'])')
        os.environ['QA_UPGRADE_OUT'] = str(OUT)
        source = source.replace('            page.locator(f\'[data-action="{action}"]\').click();modal_rect(name,w,h)', '''            if action == 'notebook':
                page.locator('[data-action="settings"]').click()
                page.locator('#settings-notebook').evaluate("el=>{for(let p=el.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true}")
                page.locator('#settings-notebook').click()
            else:
                page.locator(f'[data-action="{action}"]').click()
            modal_rect(name,w,h)''')
    else:
        os.environ['QA_OUT'] = str(OUT)
    exec(compile(source, str(path), 'exec'), {'__file__': str(path), '__name__': '__main__'})


def supplemental():
    from playwright.sync_api import sync_playwright
    report = {'url': URL, 'screens': [], 'audioTransitions': [], 'videoPlayback': [], 'errors': [], 'httpErrors': []}
    sizes = [(1280, 800), (1024, 768), (1280, 720), (906, 755), (873, 580), (375, 812), (768, 1024), (1440, 900), (1920, 1080)]
    if os.environ.get('QA_VIEWPORTS'):
        sizes = [tuple(map(int, pair.lower().split('x'))) for pair in os.environ['QA_VIEWPORTS'].split(',')]
    with sync_playwright() as p:
        browser = p.chromium.launch(channel='chrome', headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800}, device_scale_factor=1)
        page = context.new_page()
        page.set_default_timeout(10000)
        page.on('pageerror', lambda e: report['errors'].append(str(e)))
        page.on('response', lambda r: report['httpErrors'].append({'url': r.url, 'status': r.status}) if r.status >= 400 else None)
        page.add_init_script('''{
          window.__qaOscillators=new Set();
          const proto=window.AudioContext?.prototype;
          if(proto){const create=proto.createOscillator;proto.createOscillator=function(...args){
            const node=create.apply(this,args),start=node.start.bind(node),stop=node.stop.bind(node);
            node.start=(...a)=>{window.__qaOscillators.add(node);return start(...a)};
            node.stop=(...a)=>{window.__qaOscillators.delete(node);return stop(...a)};
            node.addEventListener('ended',()=>window.__qaOscillators.delete(node));return node;
          }}
        }''')
        page.goto(URL, wait_until='networkidle')

        def setup(route='home', complete=False):
            page.evaluate('''async({route,complete})=>{
              document.querySelectorAll('dialog[open]').forEach(d=>d.close());
              const {state,initialState,setPreviewMode}=await import('/src/state.js');
              const {render}=await import('/src/app.js');setPreviewMode(false);Object.assign(state,initialState());
              Object.assign(state.settings,{sound:false,reduced:true,adminUnlock:false});
              state.fieldwork.introSeen=true;state.route=route;
              if(complete){state.restored=true;state.completed=[1,2,3,4,5];state.pages=[1,2,3,4,5,6,7,8,9,10];}
              render();
            }''', {'route': route, 'complete': complete})
            page.wait_for_timeout(150)

        def capture(name, width, height):
            result = page.evaluate('''()=>{
              const dialog=[...document.querySelectorAll('dialog[open]')].at(-1);
              const root=dialog||document.querySelector('main');
              const r=root.getBoundingClientRect();
              const images=[...root.querySelectorAll('img')].filter(i=>i.getClientRects().length).map(i=>({src:i.currentSrc,loaded:i.complete&&i.naturalWidth>0,width:i.getBoundingClientRect().width,height:i.getBoundingClientRect().height}));
              return {root:r.toJSON(),horizontalOverflow:document.documentElement.scrollWidth>innerWidth+2,
                verticalOverflow:document.documentElement.scrollHeight>innerHeight+2,dialog:!!dialog,
                scrollX:root.scrollWidth-root.clientWidth,images,
                buttons:[...root.querySelectorAll('button')].filter(b=>b.getClientRects().length).map(b=>({label:b.textContent.trim()||b.ariaLabel,width:b.getBoundingClientRect().width,height:b.getBoundingClientRect().height}))};
            }''')
            issues = []
            if result['horizontalOverflow'] or (result['dialog'] and result['scrollX'] > 2):
                issues.append('horizontal-overflow')
            if result['dialog'] and (result['root']['left'] < -1 or result['root']['right'] > width+1 or result['root']['top'] < -1 or result['root']['bottom'] > height+1):
                issues.append('dialog-outside-viewport')
            if any(not i['loaded'] or i['width'] <= 0 or i['height'] <= 0 for i in result['images']):
                issues.append('missing-or-zero-size-image')
            if any(b['height'] < 43.5 for b in result['buttons']):
                issues.append('button-height-under-44')
            report['screens'].append({'name': name, 'viewport': f'{width}x{height}', 'issues': issues, **result})
            page.screenshot(path=str(OUT / f'{name}-{width}x{height}.png'), full_page=True)

        def notebook():
            if page.locator('[data-action="notebook"]').count():
                page.locator('[data-action="notebook"]').click()
            else:
                page.locator('[data-action="settings"]').click()
                page.locator('#settings-notebook').evaluate("el=>{for(let p=el.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true}")
                page.locator('#settings-notebook').click()

        for width, height in sizes:
            page.set_viewport_size({'width': width, 'height': height})
            setup();capture('home', width, height)
            notebook();capture('notebook-empty', width, height);page.keyboard.press('Escape')
            page.locator('[data-action="settings"]').click();capture('settings', width, height);page.keyboard.press('Escape')
            setup('ending', True);capture('ending-complete', width, height)
            page.locator('[data-action="certificate"]').click()
            page.locator('#student-name').fill('물의 비밀을 찾아낸 우리 반 탐험가')
            capture('certificate', width, height)
            if width == 1280 and height == 800:
                page.pdf(path=str(OUT / 'certificate-print.pdf'), format='A4', print_background=True)
            page.keyboard.press('Escape')
            write('supplemental-results.json', report)
            print(f'Supplemental screens checked {width}x{height}', flush=True)

        page.set_viewport_size({'width': 1280, 'height': 800})
        setup()
        page.locator('[data-action="settings"]').click()
        page.locator('#settings-bgm').click()
        page.locator('#settings-close').click()
        if page.locator('[data-action="sound"]').get_attribute('aria-pressed') == 'false':
            page.locator('[data-action="sound"]').click()
        page.wait_for_timeout(250)

        def sound_row(name, expected):
            count = page.evaluate('window.__qaOscillators.size')
            report['audioTransitions'].append({'name': name, 'activeOscillators': count, 'expected': expected, 'pass': count == expected})

        sound_row('bgm enabled', 3)
        page.locator('[data-action="mission-1"]').last.click();page.wait_for_selector('[data-action="home"]');page.wait_for_timeout(150);sound_row('home to first mission', 3)
        page.locator('[data-action="home"]').first.click();page.wait_for_timeout(150);sound_row('mission back to home', 3)
        notebook();sound_row('notebook modal', 3);page.keyboard.press('Escape')
        page.evaluate('async()=>{const {openConcept}=await import("/src/concepts.js");openConcept(1,{reduced:true})}')
        sound_row('concept video open', 0)
        page.locator('[data-concept="close"]').click();page.wait_for_timeout(150);sound_row('concept closed', 3)
        page.locator('[data-action="sound"]').click();sound_row('master mute', 0)
        page.locator('[data-action="mission-1"]').last.click();sound_row('muted navigation', 0)
        page.reload(wait_until='networkidle');sound_row('muted reload', 0)
        for stage in range(1, 11):
            result = page.evaluate('''async n=>{
          const v=document.createElement('video');v.muted=true;v.playsInline=true;v.preload='auto';document.body.append(v);
          let waiting=0,stalled=0,started=false;const t=performance.now();
          v.addEventListener('waiting',()=>{if(started)waiting++});v.addEventListener('stalled',()=>stalled++);
          try{v.src=`/assets/concepts/stage-${n}.webm`;
            await new Promise((ok,no)=>{v.oncanplay=ok;v.onerror=()=>no(Error('decode '+n))});
            const readyMs=performance.now()-t;await v.play();started=true;
            await new Promise((ok,no)=>{v.onended=ok;setTimeout(()=>no(Error('timeout '+n)),15000)});
            return {stage:n,readyMs,ended:v.ended,waiting,stalled,duration:v.duration};
          }finally{v.pause();v.removeAttribute('src');v.load();v.remove()}
        }''', stage)
            report['videoPlayback'].append(result)
            write('supplemental-results.json', report)
            print(f'Complete video playback checked {stage}/10', flush=True)
        report['audioScope'] = 'Instrumented Web Audio node counts in actual Chrome navigation, no subjective speaker listening.'
        write('supplemental-results.json', report)
        browser.close()
    print(json.dumps({'screenCount': len(report['screens']), 'screenIssues': [{k:r[k] for k in ['name','viewport','issues']} for r in report['screens'] if r['issues']],
                      'audioTransitions': report['audioTransitions'], 'videoPlayback': report['videoPlayback'],
                      'errors': report['errors'], 'httpErrors': report['httpErrors']}, ensure_ascii=False), flush=True)
    assert not report['errors'] and not report['httpErrors'], 'Unexpected browser or HTTP errors'
    assert not any(r['issues'] for r in report['screens']), 'Inspect supplemental screen evidence'
    assert all(r['pass'] for r in report['audioTransitions']), 'Unexpected BGM instance count'
    assert all(r['ended'] and r['waiting'] == 0 and r['stalled'] == 0 for r in report['videoPlayback']), 'Incomplete or interrupted video playback'


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('mode', choices=['assets', 'experience', 'network', 'supplemental'])
    mode = parser.parse_args().mode
    if mode == 'assets':
        assets()
    elif mode == 'supplemental':
        supplemental()
    else:
        legacy('experience-qa.py' if mode == 'experience' else 'expedition-network.py')

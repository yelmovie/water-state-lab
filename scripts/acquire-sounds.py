"""Fetch the creator's CC0 pack; retain only the sounds used by the game."""
import io, json, re, urllib.request, zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = 'https://kenney.nl/assets/interface-sounds'
page = urllib.request.urlopen(SOURCE, timeout=30).read().decode()
links = re.findall(r'href=[\"\']([^\"\']+)[\"\']', page)
url = next(u for u in links if '.zip' in u)
if url.startswith('/'): url = 'https://kenney.nl' + url
pack = zipfile.ZipFile(io.BytesIO(urllib.request.urlopen(url, timeout=45).read()))
out = ROOT / 'public/assets/audio'
out.mkdir(parents=True, exist_ok=True)
mapping = {'click': 'click_003.ogg', 'drop': 'drop_003.ogg', 'success': 'confirmation_002.ogg', 'discover': 'confirmation_001.ogg', 'error': 'error_001.ogg', 'hint': 'question_002.ogg', 'connect': 'switch_002.ogg'}
used = {}
for kind, name in mapping.items():
    match = next((n for n in pack.namelist() if n.endswith('/'+name) or n == name), None)
    if match is None:
        print('MISSING', name, 'available:', ', '.join(n for n in pack.namelist() if n.endswith('.ogg')))
        raise SystemExit(1)
    (out/name).write_bytes(pack.read(match))
    used[kind] = name
license_file = next(n for n in pack.namelist() if 'license' in n.lower() and n.endswith('.txt'))
(out/'Kenney-LICENSE.txt').write_bytes(pack.read(license_file))
(out/'sources.json').write_text(json.dumps({'creator':'Kenney','license':'CC0-1.0','source':SOURCE,'download':url,'sounds':used}, indent=2), encoding='utf-8')
print(json.dumps({'source': SOURCE, 'sounds':used}, indent=2))

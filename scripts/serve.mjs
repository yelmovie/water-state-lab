import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const built = process.argv.includes('--dist');
const root = built ? path.join(process.cwd(),'dist') : process.cwd();
const port = Number(process.env.PORT || (built ? 4317 : 4316));
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.json':'application/json'};
http.createServer((req,res)=>{
  let relative;
  try { relative = decodeURIComponent(new URL(req.url,'http://localhost').pathname); } catch { res.writeHead(400).end();return; }
  if(!built && relative.startsWith('/assets/')) relative='/public'+relative;
  const file=path.resolve(root,'.'+(relative==='/'?'/index.html':relative));
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  fs.readFile(file,(err,data)=>{
    if(err){res.writeHead(404).end('Not found');return;}
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(data);
  });
}).listen(port,'127.0.0.1',()=>console.log(`Water Drop Lab: http://127.0.0.1:${port}`));

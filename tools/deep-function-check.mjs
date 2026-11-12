// Current offline integration suite. No live API calls, no secrets needed.
// Run: node tools/deep-function-check.mjs
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const files=fs.readdirSync(path.join(root,'tests')).filter(x=>x.endsWith('.test.mjs')).sort().map(x=>path.join(root,'tests',x));
const result=spawnSync(process.execPath,['--test',...files],{cwd:root,encoding:'utf8',timeout:90000,env:{...process.env}});
process.stdout.write(result.stdout||'');
process.stderr.write(result.stderr||'');
if(result.error)throw result.error;
if(result.status!==0)process.exitCode=1;

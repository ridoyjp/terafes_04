// Full *offline* tests: Node suite + focused voice checks. Live Safari/Gemini need real devices.
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
for(const script of ['tools/deep-function-check.mjs','tools/natural-voice-romaji-test.cjs','tools/smooth-full-page-voice-test.cjs']){
  const r=spawnSync(process.execPath,[path.join(root,script)],{cwd:root,encoding:'utf8',timeout:90000});
  if(r.stdout)process.stdout.write(r.stdout);
  if(r.stderr)process.stderr.write(r.stderr);
  if(r.status!==0)process.exitCode=1;
  if(r.error)throw r.error;
}

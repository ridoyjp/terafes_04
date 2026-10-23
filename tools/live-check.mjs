// Read-only health checks by default. --chat sends exactly ONE Gemini chat request.
const worker='https://gakuen-chatbot-ai.ridoy-gakuen-ai.workers.dev';
const origin='https://ridoyjp.github.io';
const sendChat=process.argv.includes('--chat');
const token=process.env.ADMIN_STATS_TOKEN;
const timeoutMs=15000;
async function check(label,url,options={}) {
  try {
    const response=await fetch(url,{...options,signal:AbortSignal.timeout(timeoutMs)});
    const raw=await response.text();
    let data; try{data=JSON.parse(raw)}catch{data={note:raw.slice(0,160)}}
    console.log(JSON.stringify({check:label,status:response.status,data},null,2));
    return response.status;
  } catch(e){console.error(label,e.name,e.message);process.exitCode=1;return 0;}
}
await check('Worker root (404 expected)',worker+'/');
if(token) await check('Protected usage dashboard',worker+'/admin/usage',{headers:{Authorization:'Bearer '+token,Origin:origin}});
else console.log('Admin stats skipped (ADMIN_STATS_TOKEN not set in current terminal).');
if(sendChat) {
  console.log('Sending ONE real Gemini request, which may count against free quota.');
  const status=await check('Chat API',worker+'/chat',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({message:'こんにちは',history:[],responseLanguage:'ja-JP'})});
  if(status!==200)process.exitCode=1;
} else console.log('Chat call skipped. Use: node tools/live-check.mjs --chat');

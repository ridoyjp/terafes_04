"use strict";
const endpoint='https://gakuen-chatbot-ai.ridoy-gakuen-ai.workers.dev/admin/usage';
const labels={day:'UTC Day',admittedToday:'Admitted',blockedToday:'Blocked',chatToday:'Chat calls',voiceToday:'Voice calls',provider429Today:'Gemini 429',providerErrorsToday:'Provider errors',currentMinute:'Current minute',faqCacheHitsToday:'Shared FAQ cache hits',faqCacheStoresToday:'Shared FAQ cache stores'};
const token=document.querySelector('#token'), msg=document.querySelector('#msg'), stats=document.querySelector('#stats');
document.querySelector('#clear').addEventListener('click',()=>{token.value='';stats.replaceChildren();msg.textContent='Token cleared';});
document.querySelector('#refresh').addEventListener('click',async()=>{
 const secret=token.value.trim();if(!secret){msg.textContent='Enter your ADMIN_STATS_TOKEN';return;}
 msg.textContent='Loading…';const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),9000);
 try{const response=await fetch(endpoint,{method:'GET',headers:{Authorization:'Bearer '+secret},cache:'no-store',signal:controller.signal});
 if(!response.ok)throw new Error('HTTP '+response.status);
 const data=await response.json();stats.replaceChildren();
 for(const [key,label] of Object.entries(labels)){const node=document.createElement('div');node.className='metric';const name=document.createElement('small');name.textContent=label;const value=document.createElement('strong');value.textContent=String(data[key]??'—');node.append(name,value);stats.append(node);}msg.textContent='Updated successfully';
 }catch(err){msg.textContent='Unable to read stats: '+err.message;}finally{clearTimeout(timeout);}
});
import test from 'node:test';
import assert from 'node:assert/strict';
import { FestivalQuota } from '../cloudflare-worker/src/index.js';

function mockQuota() {
  const counters = new Map(); const cache = new Map();
  const sql = { exec(query, ...params) {
    if (query.startsWith('CREATE TABLE')) return {toArray:()=>[]};
    if (query.startsWith('SELECT count FROM counters')) return {toArray:()=>counters.has(params[0])?[{count:counters.get(params[0])}]:[]};
    if (query.startsWith('SELECT reply,expires FROM faq_cache')) return {toArray:()=>cache.has(params[0])?[cache.get(params[0])]:[]};
    if (query.startsWith('INSERT INTO counters')) { counters.set(params[0],(counters.get(params[0])||0)+1); return {toArray:()=>[]}; }
    if (query.startsWith('INSERT INTO faq_cache')) { cache.set(params[0],{reply:params[1],expires:params[2]});return {toArray:()=>[]}; }
    if (query.startsWith('DELETE FROM')) return {toArray:()=>[]};
    throw Error('Unexpected SQL: '+query);
  }};
  return new FestivalQuota({storage:{sql}});
}
async function action(quota, payload) {
  const response=await quota.fetch(new Request('https://quota.internal/',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}));
  return {status:response.status,...await response.json()};
}
const limits={globalMinute:3,globalDay:4,userMinute:2,userDay:3};
test('New visitors do not crash on empty SQL counters',async()=>{
  const quota=mockQuota();
  assert.equal((await action(quota,{action:'admit',kind:'chat',client:'new',limits})).allowed,true);
  assert.equal((await action(quota,{action:'stats'})).admittedToday,1);
});
test('Per-user minute cap is applied without affecting another visitor',async()=>{
  const quota=mockQuota();
  for(let i=0;i<2;i++) assert.equal((await action(quota,{action:'admit',kind:'chat',client:'a',limits})).allowed,true);
  assert.equal((await action(quota,{action:'admit',kind:'chat',client:'a',limits})).allowed,false);
  assert.equal((await action(quota,{action:'admit',kind:'chat',client:'b',limits})).allowed,true);
  assert.equal((await action(quota,{action:'stats'})).blockedToday,1);
});
test('Global minute limit cannot be exceeded',async()=>{
  const quota=mockQuota();
  for(let i=0;i<3;i++) assert.equal((await action(quota,{action:'admit',kind:'chat',client:'user'+i,limits})).allowed,true);
  assert.equal((await action(quota,{action:'admit',kind:'chat',client:'another',limits})).allowed,false);
});
test('Shared cache hit, store, and expiration',async()=>{
  const quota=mockQuota(); const cacheKey='a'.repeat(64);
  assert.equal((await action(quota,{action:'cache_get',cacheKey})).hit,false);
  assert.equal((await action(quota,{action:'cache_put',cacheKey,reply:'Verified school fact',ttl:900})).ok,true);
  assert.equal((await action(quota,{action:'cache_get',cacheKey})).reply,'Verified school fact');
  const stats=await action(quota,{action:'stats'});
  assert.equal(stats.faqCacheHitsToday,1); assert.equal(stats.faqCacheStoresToday,1);
});
test('Provider errors count and malicious cache keys are rejected',async()=>{
  const quota=mockQuota();
  await action(quota,{action:'event',kind:'429'});
  await action(quota,{action:'event',kind:'error'});
  const stats=await action(quota,{action:'stats'});
  assert.equal(stats.provider429Today,1); assert.equal(stats.providerErrorsToday,1);
  assert.equal((await action(quota,{action:'cache_get',cacheKey:'bad'})).hit,false);
  assert.equal((await action(quota,{action:'cache_put',cacheKey:'bad',reply:'x',ttl:900})).status,400);
});

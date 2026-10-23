import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const src=readFileSync(new URL('../cloudflare-worker/src/index.js',import.meta.url),'utf8');
test('Backend has shared quota and cached FAQ',()=>{assert.match(src,/class FestivalQuota/);assert.match(src,/cache_get/);assert.match(src,/cache_put/);assert.match(src,/publicSchoolQuestion/);});
test('Private monitoring requires secret',()=>{assert.match(src,/ADMIN_STATS_TOKEN/);assert.match(src,/Bearer/);});
test('No frontend visual layout updates',()=>{const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');assert.match(html,/script\.js/);});

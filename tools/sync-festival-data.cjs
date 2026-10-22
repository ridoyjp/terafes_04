// Run at the repository root with: node tools/sync-festival-data.cjs
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const source = path.join(root, 'FESTIVAL_TEACHER_DATA_TEMPLATE.json');
const target = path.join(root, 'cloudflare-worker', 'src', 'festival-data.js');
const data = JSON.parse(fs.readFileSync(source, 'utf8'));
if (data.festival !== 'TTC 学園祭 2026') throw new Error('festival must be TTC 学園祭 2026');
if (!['DRAFT', 'APPROVED'].includes(data.status)) throw new Error('status must be DRAFT or APPROVED');
const textFields = ['approved_by','last_verified','opening_hours','entrance_fee','floor_map_url','toilets','reception','first_aid','accessibility','lost_and_found','photo_policy','contact_on_day','source_url','source_reference'];
for (const field of textFields) if (typeof data[field] !== 'string') throw new Error(field + ' must be text');
for (const field of ['event_dates','food_stalls','games','stage_events']) if (!Array.isArray(data[field])) throw new Error(field + ' must be an array');
for (const entries of [data.food_stalls,data.games,data.stage_events]) {
  for (const entry of entries) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) throw new Error('Invalid entry');
  }
}
if (data.status === 'APPROVED') {
  if (!data.approved_by.trim()) throw new Error('APPROVED requires approved_by (teacher name/role)');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.last_verified)) throw new Error('APPROVED requires last_verified YYYY-MM-DD');
  if (data.source_url && !/^https:\/\//.test(data.source_url)) throw new Error('source_url must use https');
  if (!data.source_url.trim() && !data.source_reference.trim()) throw new Error('APPROVED requires a public official source_url OR an official school document reference');
  const hasContent = data.event_dates.length || data.opening_hours.trim() || data.food_stalls.some(x=>x.name) || data.games.some(x=>x.name) || data.stage_events.some(x=>x.title) || data.floor_map_url.trim();
  if (!hasContent) throw new Error('APPROVED requires real festival details');
}
const output = '// Generated from teacher-reviewed JSON; edit the template, then re-run this script.\n' +
  'export const FESTIVAL_DATA = ' + JSON.stringify(data, null, 2) + ';\n';
fs.writeFileSync(target, output, 'utf8');
console.log(data.status === 'APPROVED' ? 'Official festival data validated and generated.' : 'Draft generated. No unapproved 2026 details will be shown as facts.');

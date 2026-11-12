// Small DOM simulation of the current five-button TTC Information Menu.
// Browser interaction is additionally checked in the packaged QA report.
import fs from 'node:fs';
import vm from 'node:vm';

const base = new URL('../../', import.meta.url);
export const js = fs.readFileSync(new URL('script.js',base),'utf8');
export const html = fs.readFileSync(new URL('index.html',base),'utf8');
export const css = fs.readFileSync(new URL('style.css',base),'utf8');
export const data = JSON.parse(fs.readFileSync(new URL('festival_floor_guide_2026.json',base),'utf8'));
export class Node {
  constructor(tag='div'){this.tag=tag;this.children=[];this.attrs={};this.events={};this.dataset={};this.className='';this.textContent='';this.hidden=false;}
  appendChild(x){this.children.push(x);return x;}
  replaceChildren(...x){this.children=x;}
  setAttribute(k,v){this.attrs[k]=v;}
  addEventListener(n,fn){this.events[n]=fn;}
  click(){if(typeof this.events.click!=='function') throw Error('No click handler');return this.events.click();}
  querySelectorAll(){return this.nav||[];}
}
export function buildMenu(){
  const ids=['floorGuideCount','festivalActivityCount','festivalMainOptions','festivalSuggestionChoices','festivalSuggestionControls','festivalSmartSuggestions','festivalSuggestionTitle','festivalSuggestionCounter','festivalRoomButtons'];
  const nodes=Object.fromEntries(ids.map(id=>[id,new Node()]));
  const nav=['games','food','ai','floors','all'].map(key=>{const n=new Node('button');n.dataset.festivalNav=key;return n;});
  nodes.festivalMainOptions.nav=nav;
  const quick=['food','games','ai','floors'].map(key=>{const n=new Node('button');n.dataset.quickNav=key;return n;});
  const calls=[];
  const ctx={
    window:{TTC_FLOOR_GUIDE:data},
    document:{getElementById:id=>nodes[id]||null, createElement:tag=>new Node(tag), querySelectorAll:()=>quick},
    closeInfoMenu:()=>calls.push({type:'close'}),
    resetInfoMenu:()=>ctx.window.resetFestivalInfoMenu?.(),
    setInfo:v=>calls.push({type:'info',open:v}),
    ask:(question,language,answer)=>calls.push({type:'ask',question,language,answer}),
    pendingChat:false,console
  };
  const begin=js.indexOf('(function initFestivalFloorGuide() {');
  const end=js.indexOf('})();',begin);
  if(begin<0||end<0)throw Error('Guide menu initializer is missing');
  vm.runInNewContext(js.slice(begin,end+4),ctx);
  const current=()=>nodes.festivalSuggestionChoices.children;
  const navTo=key=>nav.find(n=>n.dataset.festivalNav===key).click();
  return {nodes,nav,quick,calls,ctx,current,navTo};
}

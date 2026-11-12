import asyncio, json, mimetypes, urllib.parse, time, re, base64
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parent.parent
BASE='https://ttc-local.test/'
async def run():
  results=[]
  async with async_playwright() as p:
    browser=await p.chromium.launch(headless=True,**({'executable_path':'/usr/bin/chromium','args':['--no-sandbox','--disable-dev-shm-usage']} if Path('/usr/bin/chromium').exists() else {}))
    for label, opts in [
      ('Desktop Chromium',dict(viewport={'width':1440,'height':900},is_mobile=False,has_touch=False)),
      ('Android-size Chromium',dict(viewport={'width':393,'height':852},is_mobile=True,has_touch=True)),
      ('iPhone-size Chromium',dict(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)),
    ]:
      ctx=await browser.new_context(**opts)
      page=await ctx.new_page()
      api_calls=[]; fail=[]
      # Website navigation is blocked by this sandbox; inject the exact local
      # project source into about:blank to test DOM/CSS/JS without real network.
      html=(ROOT/'index.html').read_text(encoding='utf-8')
      html=re.sub(r'<script\s+src="[^"]+"\s*></script>', '', html)
      html=re.sub(r'<link[^>]+(?:rel="stylesheet"|rel="preload")[^>]*>', '', html)
      for asset in (ROOT/'assets').iterdir():
        if not asset.is_file(): continue
        mime=mimetypes.guess_type(asset.name)[0] or 'application/octet-stream'
        uri=f'data:{mime};base64,'+base64.b64encode(asset.read_bytes()).decode('ascii')
        html=html.replace('src="assets/'+asset.name+'"','src="'+uri+'"')
      await page.set_content(html,wait_until='domcontentloaded')
      for fn in ['style.css','hero-responsive.css','robot-talk.css','robot-body-glow.css']:
        await page.add_style_tag(content=(ROOT/fn).read_text(encoding='utf-8'))
      await page.add_script_tag(content=(ROOT/'config.js').read_text(encoding='utf-8'))
      await page.add_script_tag(content=(ROOT/'festival-floor-guide.js').read_text(encoding='utf-8'))
      # Failing AI endpoint simulation, without visiting network.
      await page.evaluate("""() => {window.__apiCalls=[];window.fetch=async (url,opts)=> { window.__apiCalls.push(JSON.parse(opts.body||'{}').message); return {ok:false,status:429,json:async()=>({error:'AI quota exhausted'})}; };}""")
      await page.add_script_tag(content=(ROOT/'script.js').read_text(encoding='utf-8'))
      await page.wait_for_timeout(100)
      async def check(name,condition):
        results.append((label,name,bool(condition)))
      await check('Home visible',await page.locator('#intro').is_visible())
      await check('Home icons 3',await page.locator('.intro-button-icon').count()==3)
      await check('No overflow home',await page.evaluate('document.documentElement.scrollWidth <= innerWidth+2'))
      await page.locator('#startButton').click()
      await check('Chat visible',await page.locator('#chat').evaluate("e=>e.classList.contains('active')"))
      await check('Menu initially closed',await page.locator('#infoList').is_hidden())
      await page.locator('#infoToggle').click()
      await check('Menu opens',await page.locator('#infoList').is_visible())
      await check('Five options',await page.locator('#festivalMainOptions button').count()==5)
      await page.locator('[data-festival-nav="games"]').click()
      await check('Games choices populate',await page.locator('#festivalSuggestionChoices button').count()>12)
      await page.locator('#festivalSuggestionChoices button').first.click()
      await check('Menu closed after event',await page.locator('#infoList').is_hidden())
      bubbles=await page.locator('#messages .bubble').all_inner_texts()
      await check('Guide reply 1101',any('1101' in b and '3D' in b for b in bubbles))
      await check('Local guide no API call',await page.evaluate('window.__apiCalls.length')==0)
      await page.locator('#input').fill('東京のおいしい食べ物は何ですか')
      await page.locator('#form button[type="submit"]').click()
      await page.wait_for_timeout(600)
      last=(await page.locator('#messages .bubble').all_inner_texts())[-1]
      await check('Quota message offers menu', '情報一覧' in last and ('AI' in last))
      await check('AI request reached quota route',await page.evaluate('window.__apiCalls.length')==1)
      await page.locator('#infoToggle').click()
      await page.locator('[data-festival-nav="food"]').click()
      await page.locator('#festivalSuggestionChoices button').first.click()
      bubbles=await page.locator('#messages .bubble').all_inner_texts()
      await check('Offline food still replies', '1F' in bubbles[-1] and 'コーヒー' in bubbles[-1])
      await check('No extra Gemini call for local food',await page.evaluate('window.__apiCalls.length')==1)
      await page.locator('#input').fill('501号室には何がありますか')
      await page.locator('#form button[type="submit"]').click()
      await page.wait_for_timeout(80)
      bubbles=await page.locator('#messages .bubble').all_inner_texts()
      await check('Typed room works offline', '501' in bubbles[-1] and '情報処理科' in bubbles[-1])
      await check('Typed room still zero extra AI',await page.evaluate('window.__apiCalls.length')==1)
      await page.locator('#infoToggle').click()
      await page.locator('[data-festival-nav="floors"]').click()
      floor=page.locator('#festivalSuggestionChoices button').filter(has_text='1F').first
      await floor.click()
      await check('Floor navigation shows room/event options',await page.locator('#festivalSuggestionChoices button').count()>=1)
      await page.locator('#backButton').click()
      await check('Back returns home',await page.locator('#intro').is_visible())
      await page.locator('#startButton').click()
      await check('Reopen menu closed',await page.locator('#infoList').is_hidden())
      await check('No overflow chat',await page.evaluate('document.documentElement.scrollWidth <= innerWidth+2'))
      # A stalled Gemini request must not block opening the menu or a local event.
      await page.evaluate("""() => {aiRetryAfter=0; aiPausedStatus=0; window.fetch= (url,opts) => new Promise((resolve,reject)=> {
        opts.signal?.addEventListener('abort',()=>reject(Object.assign(new Error('aborted'),{name:'AbortError'})));
        window.__stalledRequest=true;
      });}""")
      await page.locator('#input').fill('What is the capital of Nepal?')
      await page.locator('#form button[type="submit"]').click()
      await page.wait_for_timeout(75)
      await check('AI request stalled',await page.evaluate('window.__stalledRequest===true && pendingChat'))
      await page.locator('#infoToggle').click()
      await check('Menu usable during AI wait',await page.locator('#infoList').is_visible())
      await page.locator('[data-festival-nav="ai"]').click()
      await page.locator('#festivalSuggestionChoices button').first.click()
      await page.wait_for_timeout(80)
      await check('Event preempts pending AI',await page.evaluate('pendingChat===false'))
      latest=(await page.locator('#messages .bubble').all_inner_texts())[-1]
      await check('Stalled AI replaced by local facts', '11F' in latest and '3D' in latest)
      await check('No orphan typing bubble',await page.locator('.bot-typing').count()==0)
      # Failed network request: clear guidance, not app crash.
      await page.evaluate("""() => {window.fetch=async()=>{throw new TypeError('network disconnected');};}""")
      await page.locator('#input').fill('Tell me something about astronomy')
      await page.locator('#form button[type="submit"]').click()
      await page.wait_for_timeout(100)
      latest=(await page.locator('#messages .bubble').all_inner_texts())[-1]
      await check('Disconnected network offline notice', 'AI' in latest and '情報一覧' in latest)
      await check('No JS pageerrors',len(fail)==0)
      screenshot=ROOT/'QA'/'evidence'/(label.replace(' ','_')+'_QA.png')
      screenshot.parent.mkdir(parents=True,exist_ok=True)
      await page.screenshot(path=str(screenshot),full_page=False)
      await ctx.close()
    await browser.close()
  for group,name,ok in results:print(('PASS' if ok else 'FAIL'),group,name)
  failed=[x for x in results if not x[2]]
  print(f'BROWSER_QA: {len(results)-len(failed)}/{len(results)} PASS')
  (ROOT/'QA'/'evidence'/'browser_results.json').write_text(json.dumps({'tests':results,'pass':len(results)-len(failed),'total':len(results)},ensure_ascii=False,indent=2))
  return not failed
if __name__=='__main__':
 try: print('OVERALL',asyncio.run(run()))
 except Exception as e:import traceback;traceback.print_exc()

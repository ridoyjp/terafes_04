// Simulates rate-limit decisions locally; NEVER calls Gemini/Cloudflare.
// node tools/offline-load-test.mjs [visitors] [requestsPerVisitor]
const visitors=Math.max(1,Math.min(1000,Number(process.argv[2])||200));
const each=Math.max(1,Math.min(100,Number(process.argv[3])||5));
const globalDay=400,perUserDay=50,globalMinute=25,perUserMinute=6;
const users=new Map();let allowed=0,blocked=0;
for(let round=0;round<each;round++)for(let u=0;u<visitors;u++){
 const per=users.get(u)||0;
 if(allowed>=globalDay||per>=perUserDay){blocked++;continue;}users.set(u,per+1);allowed++;
}
console.log(JSON.stringify({mode:'OFFLINE simulation only',visitors,requestsPerVisitor:each,requestsAttempted:visitors*each,admittedDaily:allowed,blockedDaily:blocked,globalMinute,perUserMinute,note:'Does not contact live API; actual capacity and request arrival distribution vary.'},null,2));

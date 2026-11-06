type Lead = {id:string;name:string;phone:string;location:string;project:string;timing:string;photo:string};
export async function saveToSheets(lead:Lead, url:string, secret:string) {
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(url) || !secret) throw new Error('Sheets configuration is invalid');
  const response = await fetch(url, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({...lead,secret}),
    redirect:'follow',
    signal:AbortSignal.timeout(25000),
  });
  if (!response.ok) throw new Error('Sheets request failed');
  const result = await response.json() as {ok?:boolean;id?:string};
  if (result.ok !== true || result.id !== lead.id) throw new Error('Sheets did not confirm the contact');
}

import test from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPair,SignJWT,createLocalJWKSet,exportJWK} from 'jose';
import {config,allowedUser,seal,open,startFlow,finishFlow,readSsoSession,verifyTokens,logoutSsoSession} from '../lib/hub-sso';

const issuer='http://127.0.0.1:55431/auth/v1';
Object.assign(process.env,{HUB_SSO_LOCAL:'true',ATLAS_LOCAL_ORIGIN:'http://127.0.0.1:4185',HUB_LOCAL_ISSUER:issuer,HUB_LOCAL_CLIENT_ID:'fixture-client',HUB_LOCAL_ANON_KEY:'fixture-key',HUB_LOCAL_COOKIE_KEY:'a'.repeat(64),HUB_LOCAL_COORDINATION_KEY:'b'.repeat(43)});
test('local SSO refuses deployment and any non-fixed identity destination',()=>{
 const old=process.env.NODE_ENV;Object.assign(process.env,{NODE_ENV:'production'});assert.throws(config);if(old===undefined)Reflect.deleteProperty(process.env,'NODE_ENV');else Object.assign(process.env,{NODE_ENV:old});
 const original=process.env.HUB_LOCAL_ISSUER;process.env.HUB_LOCAL_ISSUER='https://evil.example';assert.throws(config);process.env.HUB_LOCAL_ISSUER=original;
});
test('user-editable claims and staff-only users cannot self-enrol into Hub SSO',()=>{
 assert.equal(allowedUser({id:'x',email_confirmed_at:'yes',app_metadata:{staff_access:true,hub_role:'tester'}}),true);
 for(const app_metadata of [{staff_access:true},{staff_access:'true',hub_role:'owner'},{staff_access:true,hub_role:'admin'}])assert.equal(allowedUser({id:'x',email_confirmed_at:'yes',app_metadata}),false);
 assert.equal(allowedUser({id:'x',app_metadata:{staff_access:true,hub_role:'owner'}}),false);
});
test('browser flow is encrypted, purpose-bound, nonce-bound and uses S256',async()=>{
 const f=await startFlow(),u=new URL(f.url),flow=await open(f.cookie,'atlas-oauth-flow');
 assert.equal(u.origin,'http://127.0.0.1:55431');assert.equal(u.searchParams.get('scope'),'openid email profile');assert.equal(u.searchParams.get('code_challenge_method'),'S256');assert.equal(u.searchParams.get('nonce'),flow.nonce);assert.equal(u.searchParams.get('state'),flow.state);assert.ok(!f.cookie.includes(String(flow.verifier)));assert.ok(!f.url.includes(String(flow.verifier)));
 await assert.rejects(()=>open(f.cookie,'atlas-local-session'));
});
test('tampered and expired sessions fail closed',async()=>{
 const good=await seal({accessToken:'private-fixture'},'atlas-local-session',30);
 const expired=await seal({accessToken:'private-fixture'},'atlas-local-session',-1);
 const original=fetch;let calls=0;globalThis.fetch=async()=>{calls++;throw Error('Unexpected network');};
 try {assert.equal(await readSsoSession(good.slice(0,-8)+'aaaaaaaa'),null);assert.equal(await readSsoSession(expired),null);assert.equal(calls,0);}finally{globalThis.fetch=original;}
});
test('wrong state, repeated callback fields and denial are refused before code exchange',async()=>{
 const f=await startFlow(),u=new URL(f.url),state=u.searchParams.get('state')!;
 const original=fetch;let calls=0;globalThis.fetch=async()=>{calls++;throw Error('Unexpected network');};
 try {for(const query of ['state=wrong&code=x',`state=${state}&code=x&code=y`,`state=${state}&code=x&error=access_denied`])await assert.rejects(()=>finishFlow(new URLSearchParams(query),f.cookie));assert.equal(calls,0);}finally{globalThis.fetch=original;}
});
test('real ES256 token verification rejects issuer, audience, nonce, client, subject, expiry and signature changes',async()=>{
 const {privateKey,publicKey}=await generateKeyPair('ES256');const jwk=await exportJWK(publicKey);jwk.kid='fixture';jwk.alg='ES256';const keys=createLocalJWKSet({keys:[jwk]});
 const sign=async(payload:Record<string,unknown>)=>new SignJWT(payload).setProtectedHeader({alg:'ES256',kid:'fixture'}).sign(privateKey);
 const now=Math.floor(Date.now()/1000);const id={iss:issuer,aud:'fixture-client',sub:'user',iat:now,exp:now+60,nonce:'nonce'};const access={iss:issuer,aud:'authenticated',sub:'user',iat:now,exp:now+60,client_id:'fixture-client'};
 const good={id_token:await sign(id),access_token:await sign(access)};const c={issuer,clientId:'fixture-client'};assert.equal((await verifyTokens(good,'nonce',c,keys)).id.sub,'user');
 for(const patch of [{iss:'https://evil.example'},{aud:'other-client'},{nonce:'other-nonce'},{exp:now-1}])await assert.rejects(()=>sign({...id,...patch}).then(id_token=>verifyTokens({...good,id_token},'nonce',c,keys)));
 for(const patch of [{client_id:'other-client'},{sub:'other-user'},{aud:'wrong'},{exp:now-1}])await assert.rejects(()=>sign({...access,...patch}).then(access_token=>verifyTokens({...good,access_token},'nonce',c,keys)));
 const other=await generateKeyPair('ES256');const forged=await new SignJWT(id).setProtectedHeader({alg:'ES256',kid:'fixture'}).sign(other.privateKey);await assert.rejects(()=>verifyTokens({...good,id_token:forged},'nonce',c,keys));
});
test('app cookies contain opaque handles and freshness is delegated to the authenticated Hub service',async()=>{
 const original=fetch;const calls:{url:string;options:RequestInit}[]=[];
 globalThis.fetch=async(url,options)=>{calls.push({url:String(url),options:options!});return Response.json({user:{id:'fixture',email_confirmed_at:'yes',app_metadata:{staff_access:true,hub_role:'tester'}},accessToken:'PRIVATE_SERVER_TOKEN'});};
 try {const session=await readSsoSession('c'.repeat(43));assert.equal(session?.user.id,'fixture');assert.equal(calls[0].url,'http://127.0.0.1:4184/internal/sessions/resolve');assert.equal(JSON.parse(String(calls[0].options.body)).handle,'c'.repeat(43));assert.ok(!String(calls[0].options.body).includes('PRIVATE_SERVER_TOKEN'));assert.equal((calls[0].options.headers as Record<string,string>).Authorization,'Bearer '+'b'.repeat(43));}finally{globalThis.fetch=original;}
});
test('Hub outage or revocation never falls back to an old token or public access',async()=>{
 const original=fetch;globalThis.fetch=async()=>new Response('',{status:503});try{assert.equal(await readSsoSession('c'.repeat(43)),null);await assert.rejects(()=>logoutSsoSession('c'.repeat(43)));}finally{globalThis.fetch=original;}
});

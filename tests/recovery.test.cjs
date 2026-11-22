'use strict';
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const test=require('node:test');
const assert=require('node:assert/strict');
const appDir=process.env.RADAR_APP_DIR;
if(!appDir) throw new Error('Defina RADAR_APP_DIR para o diretório local do aplicativo original.');
const Storage=require(path.join(appDir,'www/storage.js'));
const Core=require(path.join(appDir,'www/core.js'));
const Pool=require(path.join(appDir,'www/pool.js'));
const html=fs.readFileSync(path.join(__dirname,'../docs/recuperar/index.html'),'utf8');
const source=html.match(/<script id="recovery-data">([\s\S]*?)<\/script>/)[1];
const Recovery=vm.runInNewContext(source+'\nRecoveryData;',{TextEncoder});
const stamp='2026-11-22T12:00:00.000Z';
const games=[{id:'synthetic-1',nums:[1,2,3,4,5,6],createdAt:stamp,targetContest:null},{id:'synthetic-2',nums:[10,20,30,40,50,60],createdAt:stamp,targetContest:3200}];
const settings={basePrice:6,generationPreferences:Core.normalizeGenerationPreferences()};
function inspect(records){return Recovery.inspect(key=>records[key]??null,stamp);}
test('games and generation preferences roundtrip through real importer',()=>{
  const records={
    [Recovery.KEYS.tickets]:JSON.stringify({schemaVersion:2,tickets:games}),
    [Recovery.KEYS.settings]:JSON.stringify({schemaVersion:2,settings})
  };
  const before=JSON.stringify(records);
  const found=inspect(records);
  assert.equal(found.ticketsError,null);
  const imported=Storage.importBackup(found.tickets.content,[]);
  assert.equal(imported.ok,true);
  assert.deepEqual(imported.tickets,games);
  assert.deepEqual(imported.settings,settings);
  assert.equal(JSON.stringify(records),before);
});
test('pool export is accepted by real UI decoder without changing games or terms',()=>{
  const plan=Pool.generatePool({participants:5,budgetPerPerson:10,basePrice:6});
  const saved={kind:'MegaSenaRadarPool',version:1,createdAt:stamp,plan:{participants:plan.participants,budgetPerPerson:plan.budgetPerPerson,basePrice:plan.basePrice,games:plan.games}};
  const poolSource=fs.readFileSync(path.join(appDir,'www/pool-ui.js'),'utf8');
  const decodeMatch=poolSource.match(/  function decode\(raw\) \{([\s\S]*?)\n  \}\n\n  function persist/);
  assert.ok(decodeMatch,'real pool import decoder is available');
  const decode=vm.runInNewContext('function decode(raw){'+decodeMatch[1]+'\n}\ndecode;',{root:{MegaPool:Pool},MAX_FILE_BYTES:150000});
  const found=inspect({[Recovery.KEYS.pool]:JSON.stringify(saved)});
  const imported=decode(found.pool.content);
  assert.deepEqual(JSON.parse(JSON.stringify(imported.plan.games)),plan.games);
  assert.equal(imported.plan.participants,plan.participants);
  assert.equal(imported.plan.budgetPerPerson,plan.budgetPerPerson);
  assert.equal(imported.createdAt,stamp);
});
test('inspection reads only the three known keys and missing records create no backups',()=>{
  const readKeys=[];
  const found=Recovery.inspect(key=>{readKeys.push(key);return null;},stamp);
  assert.deepEqual(readKeys,Object.values(Recovery.KEYS));
  assert.equal(found.tickets,null);assert.equal(found.pool,null);
  assert.equal(found.ticketsError,null);assert.equal(found.poolError,null);
});
test('blocked storage produces errors without claiming the records are empty',()=>{
  const found=Recovery.inspect(()=>{throw new Error('blocked');},stamp);
  assert.equal(found.tickets,null);assert.equal(found.pool,null);
  assert.match(found.ticketsError,/não permitiu/);assert.match(found.poolError,/não permitiu/);
});
test('damaged tickets never prevent a valid separate pool export',()=>{
  const plan=Pool.generatePool({participants:5,budgetPerPerson:10,basePrice:6});
  const found=inspect({[Recovery.KEYS.tickets]:'{broken',[Recovery.KEYS.pool]:JSON.stringify({kind:'MegaSenaRadarPool',version:1,createdAt:stamp,plan:{participants:5,budgetPerPerson:10,basePrice:6,games:plan.games}})});
  assert.equal(found.tickets,null);assert.match(found.ticketsError,/não têm/);
  assert.ok(found.pool);assert.equal(found.poolError,null);
});
test('tickets without a persisted settings record retain the original default price',()=>{
  const found=inspect({[Recovery.KEYS.tickets]:JSON.stringify({schemaVersion:2,tickets:games})});
  const imported=Storage.importBackup(found.tickets.content,[]);
  assert.equal(imported.ok,true);assert.equal(imported.settings.basePrice,6);
  assert.deepEqual(imported.tickets,games);
});

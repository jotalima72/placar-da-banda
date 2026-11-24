import test from 'node:test';
import assert from 'node:assert/strict';
import {initial,activate,nextScene,validState,instruments,soloRule,soloTargets,MAX_MEMBERS} from '../src/rules.js';
test('ativação cobra Coesão e permite trocar sem contador de rodada',()=>{const s=initial(),n=activate(s,s.songs[0].id);assert.equal(n.cohesion,2);const changed=activate(n,s.songs[2].id);assert.equal(changed.cohesion,1);assert.equal(changed.active,s.songs[2].id);assert.equal('round' in changed,false);assert.equal('scene' in changed,false)});
test('troca preserva Solo e efeitos e renova somente o ritmo',()=>{let s=initial();s.members[0].solo='Sucesso';s.effects=[{id:'e',source:'Vocal',target:'Aliado',text:'+2'}];s=activate(s,s.songs[0].id);s.members[0].rhythmUsed=true;const n=activate(s,s.songs[2].id);assert.equal(n.members[0].solo,'Sucesso');assert.equal(n.members[0].rhythmUsed,false);assert.equal(n.effects.length,1)});
test('Bis é único por cena e sempre pago',()=>{let s=initial();s.hasBis=true;s=activate(s,s.songs[0].id);assert.throws(()=>activate(s,s.active));s=activate(s,s.active,{bis:true});assert.equal(s.cohesion,1);assert.equal(s.bisUsed,true);assert.throws(()=>activate(s,s.active,{bis:true}));assert.throws(()=>activate(s,s.active,{bis:true,free:true}))});
test('Hino gratuito é por sessão, não por cena',()=>{let s=initial();s.songs[0].grade=4;s=activate(s,s.songs[0].id,{free:true});assert.equal(s.cohesion,3);s=nextScene(s);assert.equal(s.hymnUsed,true);assert.throws(()=>activate(s,s.songs[0].id,{free:true}))});
test('ritmo imediato e nova cena',()=>{let s=initial();s=activate(s,s.songs[1].id);assert.ok(s.members.every(m=>m.rhythmUsed));s.members[0].solo='Falha';s=nextScene(s);assert.equal(s.active,null);assert.ok(s.members.every(m=>!m.solo&&!m.rhythmUsed));assert.equal(s.cohesion,2)});
test('importação rejeita estrutura e índices inválidos',()=>{const s=initial();assert.ok(validState(s));assert.equal(validState({}),false);s.members[0].instrument=99;assert.equal(validState(s),false)});

test('encerrar cena recupera usos de cena e preserva benefícios de sessão',()=>{const s=initial();s.bisUsed=true;s.hymnUsed=true;s.members[0].embaloUsed=true;s.members[0].solo='Sucesso';s.played=[s.songs[0].id];const n=nextScene(s);assert.equal(n.bisUsed,false);assert.equal(n.hymnUsed,true);assert.equal(n.members[0].embaloUsed,false);assert.equal(n.members[0].solo,null);assert.deepEqual(n.played,[]);assert.equal(n.cohesion,s.cohesion)});


test('placares antigos preservam os instrumentos e aceitam quinze integrantes', () => {
  assert.deepEqual(instruments.slice(0, 5).map(x => x[0]), ['Vocal', 'Guitarra solo', 'Guitarra base', 'Baixo', 'Bateria']);
  const s = initial();
  while (s.members.length < MAX_MEMBERS) s.members.push({...s.members[0], id: crypto.randomUUID(), instrument: 11 + (s.members.length % 7)});
  assert.ok(validState(s));
  assert.ok(validState(JSON.parse(JSON.stringify(s))));
  s.members.push({...s.members[0], id: crypto.randomUUID()});
  assert.equal(validState(s), false);
});

test('bastidores usam suas perícias e respeitam alvos e resistências', () => {
  const s = initial();
  const expected = [
    ['Assistente técnico', 'Consertar', 'ally'], ['Segurança', 'Atletismo', 'ally'],
    ['Produtor iniciante', 'Persuasão', 'ally'], ['Motorista', 'Dirigir', 'selfOrAlly'],
    ['Agente / divulgação', 'Persuasão', 'ally'], ['Iluminador / cenógrafo', 'Consertar', 'opponent'],
    ['Fã nº 1', 'Persuasão', 'ally'],
  ];
  for (const [name, skill, target] of expected) {
    const index = instruments.findIndex(x => x[0] === name);
    assert.notEqual(index, -1);
    s.members[0].instrument = index;
    assert.ok(validState(s));
    assert.equal(soloRule(index).skill, skill);
    assert.equal(soloRule(index).target, target);
    const targets = soloTargets(s.members, s.members[0]);
    assert.equal(targets.some(m => m.id === s.members[0].id), target === 'selfOrAlly');
    assert.equal(targets.length, target === 'opponent' ? 0 : target === 'ally' ? 3 : 4);
  }
  assert.equal(soloRule(instruments.findIndex(x => x[0] === 'Iluminador / cenógrafo')).resistance, 'Astúcia');
  assert.equal(soloRule(1).resistance, 'Espírito');
  assert.deepEqual(soloTargets([s.members[0]], {...s.members[0], instrument: 11}), []);
});

test('ativação libera bastidores e nova cena recupera suas tentativas', () => {
  let s = initial();
  s.members[0].instrument = instruments.findIndex(x => x[0] === 'Assistente técnico');
  s = activate(s, s.songs[0].id);
  assert.equal(s.members[0].rhythmUsed, false);
  s.members[0].solo = 'Falha';
  s = activate(s, s.songs[2].id);
  assert.equal(s.members[0].solo, 'Falha');
  assert.equal(nextScene(s).members[0].solo, null);
});

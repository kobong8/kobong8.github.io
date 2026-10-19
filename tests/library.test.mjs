import test from 'node:test';
import assert from 'node:assert/strict';
import { selectResources, normalize } from '../assets/library-core.mjs';
const items = [
  {id:'one',title:'Docker 2',type:'강의 자료',description:'컨테이너 기초',tags:['Volume'],topics:['DevOps'],addedAt:'2026-10-01',updatedAt:'2026-10-19'},
  {id:'two',title:'Docker 10',type:'실습 자료',description:'실습',tags:['Docker'],topics:['DevOps'],addedAt:'2026-10-18',updatedAt:null},
  {id:'three',title:'AI Guide',type:'학회·포럼 정리',description:'활용',tags:['Agent'],topics:['AI'],addedAt:'2026-10-10',updatedAt:null},
];
test('여러 단어 AND 검색과 분류/주제 교집합', () => {
  assert.equal(selectResources(items,{query:' Docker  VOLUME ',category:'강의 자료',topic:'DevOps'})[0].id,'one');
  assert.equal(selectResources(items,{query:'컨테이너'}).length,1);
  assert.equal(selectResources(items,{query:'Docker',topic:'AI'}).length,0);
  assert.equal(selectResources(items,{query:'없는 자료'}).length,0);
});
test('최신 등록, 업데이트 fallback, 숫자를 고려한 제목순', () => {
  assert.deepEqual(selectResources(items).map(item=>item.id),['two','three','one']);
  assert.deepEqual(selectResources(items,{sort:'updated'}).map(item=>item.id),['one','two','three']);
  assert.deepEqual(selectResources(items,{sort:'title'}).map(item=>item.id),['three','one','two']);
  assert.deepEqual(items.map(item=>item.id),['one','two','three']);
});
test('전각·대소문자·공백 정규화 및 빈 검색', () => {
  assert.equal(normalize(' ＤＯＣＫＥＲ\n Volume '),'docker volume');
  assert.equal(selectResources(items,{query:'   '}).length,3);
});
test('자료가 120개로 늘어나도 누락 없이 표시하고 필터링', () => {
  const many = Array.from({length:120},(_,i)=>({...items[i%3],id:`item-${i}`}));
  assert.equal(selectResources(many).length,120);
  assert.equal(selectResources(many,{topic:'AI'}).length,40);
  assert.equal(selectResources(many,{category:'강의 자료'}).length,40);
});

import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const index = readFileSync(join(root, 'index.html'), 'utf8');
const detailPath = join(root, 'portfolio_case_gps.html');
assert.ok(existsSync(detailPath), 'GPS 인턴십 상세 페이지가 있어야 합니다.');
const detail = readFileSync(detailPath, 'utf8');

assert.match(index, /id="project-01"[^>]+data-modal-open="gps-modal"/s);
assert.match(index, /id="gps-modal"[^>]+aria-labelledby="gps-modal-title"/s);
assert.match(index, /data-src="portfolio_case_gps\.html/);
assert.equal((index.match(/class="project-card"/g) ?? []).length, 7);

for (const expected of [
  '31,468대',
  '678대',
  '2.15%',
  '51.0%',
  '47.3배',
  '후보군 AS 확인률',
  '분석 대상 내 좌표 관련 고장 재현율',
]) {
  assert.ok(detail.includes(expected), `상세 페이지에 ${expected}가 있어야 합니다.`);
}

assert.doesNotMatch(detail, /모델 정확도 11\.2%|오탐률 88\.8%|모든 GPS 고장의 51%를 예측/);
assert.match(detail, /@media\s*\(max-width:\s*720px\)/);
assert.match(detail, /aria-label="후보군과 비후보군 AS 확인률 비교"/);

console.log('internship portfolio case checks passed');

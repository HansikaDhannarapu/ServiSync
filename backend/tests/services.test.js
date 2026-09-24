import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeProblem } from '../services/aiService.js';
import { overlaps,validInterval,containsInterval } from '../services/availabilityService.js';
import { allow } from '../middleware/auth.js';

test('AI fallback classifies a cooling and indoor unit leak as AC repair', async () => {
  const result=await analyzeProblem('AC is running but the room is not cooling and water is leaking from the indoor unit.');
  assert.equal(result.category,'AC Repair');
  assert.ok(result.requiredSkills.includes('AC Servicing'));
  assert.match(result.shortSummary,/not a technical diagnosis/);
});

test('manual category overrides the suggested category', async () => {
  const result=await analyzeProblem('A leak below the kitchen sink','General Maintenance');
  assert.equal(result.category,'General Maintenance');
});

test('availability treats touching appointments as separate and intersecting times as overlap', () => {
  assert.equal(overlaps('14:00','15:00','15:00','16:00'),false);
  assert.equal(overlaps('14:00','15:00','14:30','15:30'),true);
  assert.equal(overlaps('14:00','15:00','13:00','14:00'),false);
});

test('availability rejects malformed dates and reversed or invalid times', () => {
  assert.equal(validInterval('2026-09-26','09:00','10:00'),true);
  assert.equal(validInterval('2026-02-31','09:00','10:00'),false);
  assert.equal(validInterval('2026-09-26','10:00','09:00'),false);
  assert.equal(validInterval('2026-09-26','25:00','26:00'),false);
});

test('a booking must fit completely inside a provider availability window', () => {
  assert.equal(containsInterval('09:00','17:00','10:00','11:00'),true);
  assert.equal(containsInterval('09:00','10:00','09:30','10:30'),false);
});

test('role middleware rejects users outside its allowed roles', () => {
  let statusCode,body,nextCalled=false;
  const res={status(code){statusCode=code;return this;},json(value){body=value;return this;}};
  allow('PLATFORM_ADMIN')({user:{role:'CUSTOMER'}},res,()=>{nextCalled=true;});
  assert.equal(statusCode,403);
  assert.equal(body.message,'You do not have permission to do that.');
  assert.equal(nextCalled,false);
});

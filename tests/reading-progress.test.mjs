import assert from 'node:assert/strict'
import test from 'node:test'
import { readingProgress, showBackToTop } from '../app/utils/readingProgress.ts'

test('long article spans the distance between its own start and last visible line', () => {
  assert.equal(readingProgress(200, 1500, 600, 100), 0)
  assert.equal(readingProgress(100, 1500, 600, 100), 0)
  assert.equal(readingProgress(-400, 1500, 600, 100), 0.5)
  assert.equal(readingProgress(-900, 1500, 600, 100), 1)
  assert.equal(readingProgress(-1200, 1500, 600, 100), 1)
})

test('short and exactly fitting articles finish as their bottom becomes visible', () => {
  assert.equal(readingProgress(450, 300, 600, 100), 0.5)
  assert.equal(readingProgress(300, 300, 600, 100), 1)
  assert.equal(readingProgress(100, 500, 600, 100), 1)
  assert.equal(readingProgress(700, 300, 600, 100), 0)
})

test('empty body and obscured viewport have zero progress', () => {
  assert.equal(readingProgress(0, 0, 600, 100), 0)
  assert.equal(readingProgress(0, 100, 80, 100), 0)
})

test('back to top requires a long body and sufficient scroll on both screen sizes', () => {
  assert.equal(showBackToTop(800, 400, 800), false)
  assert.equal(showBackToTop(640, 2000, 800), false)
  assert.equal(showBackToTop(641, 2000, 800), true)
  assert.equal(showBackToTop(399, 2000, 360), false)
  assert.equal(showBackToTop(401, 2000, 360), true)
})

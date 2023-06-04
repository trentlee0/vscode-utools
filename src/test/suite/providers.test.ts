import * as assert from 'assert'

import { parseJsonPath } from '../../providers'

suite('providers', () => {
  test('parseJsonPath when character in', () => {
    const path = parseJsonPath(
      '/local/public/plugin.json',
      `  "logo": "logo.png",`,
      11
    )
    assert.equal(path, '/local/public/logo.png')
  })

  test('parseJsonPath when character out', () => {
    const path = parseJsonPath(
      '/local/public/plugin.json col out',
      `  "logo": "logo.png",`,
      9
    )
    assert.equal(path, undefined)
  })
})

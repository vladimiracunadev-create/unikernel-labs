'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');

const {
  SOURCE_PATH,
  TARGET_PATH,
  buildLauncherCatalogFromConfig,
} = require('./sync-launcher-catalog');

test('launcher catalog stays in sync with labs.config.json', () => {
  const sourceConfig = JSON.parse(fs.readFileSync(SOURCE_PATH, 'utf8'));
  const launcherCatalog = JSON.parse(fs.readFileSync(TARGET_PATH, 'utf8'));
  const generatedCatalog = buildLauncherCatalogFromConfig(sourceConfig);

  assert.deepEqual(launcherCatalog, generatedCatalog);
});

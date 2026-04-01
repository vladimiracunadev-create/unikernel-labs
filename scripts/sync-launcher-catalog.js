'use strict';

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const SOURCE_PATH = path.join(REPO_ROOT, 'labs.config.json');
const TARGET_PATH = path.join(
  REPO_ROOT,
  'launcher',
  'windows',
  'src',
  'UnikernelLabs.Launcher',
  'labs.windows.json'
);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function withLabPath(relativePath, command) {
  if (!command) {
    return '';
  }

  return relativePath
    ? `cd '{lab_path}' && ${command}`
    : `cd '{repo}' && ${command}`;
}

function buildLauncherCatalogFromConfig(config) {
  return config.labs
    .filter(lab => lab.startCommand && lab.stopCommand && lab.logsCommand)
    .map(lab => ({
      Id: lab.id,
      Name: lab.name,
      Description: lab.description,
      RelativePath: lab.path || '',
      StartCommand: withLabPath(lab.path, lab.startCommand),
      StopCommand: withLabPath(lab.path, lab.stopCommand),
      LogsCommand: withLabPath(lab.path, lab.logsCommand),
      Url: lab.url ?? null,
    }));
}

function syncLauncherCatalog() {
  const sourceConfig = readJson(SOURCE_PATH);
  const launcherCatalog = buildLauncherCatalogFromConfig(sourceConfig);
  fs.writeFileSync(TARGET_PATH, `${JSON.stringify(launcherCatalog, null, 2)}\n`, 'utf8');
  return launcherCatalog;
}

module.exports = {
  TARGET_PATH,
  SOURCE_PATH,
  buildLauncherCatalogFromConfig,
  syncLauncherCatalog,
};

if (require.main === module) {
  syncLauncherCatalog();
  console.log(`Launcher catalog synced from ${path.basename(SOURCE_PATH)}.`);
}

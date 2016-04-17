'use strict';

const dotenv = require('dotenv');
const fs = require('fs');
const yaml = require('js-yaml');

const yamlConf = function (options) {
  if (typeof options === 'string') {
    options = {path: options};
  }

  options = options || {};

  const defaults = {
    dotenv: {silent: true, path: './.env'},
    path: './config.yml',
    loadToProcess: false,
    localConfig: {path: './config.local.yml', force: false}
  };

  if (options.localConfig) {
    options.localConfig = Object.assign({}, defaults.localConfig, options.localConfig);
  }

  options = Object.assign({}, defaults, options);

  dotenv.load(options.dotenv);

  if (!fs.existsSync(options.path)) {
    throw new Error(`Config file not found: ${options.path}`);
  }

  let config = _loadConfig(options.path);

  // override values with local config if specified
  if (options.localConfig) {
    const isLocalConfig = fs.existsSync(options.localConfig.path);

    if (!isLocalConfig && options.localConfig.force) {
      throw new Error(`Local config was specified, but not found: ${options.localConfig}`);
    }

    if (isLocalConfig) {
      const localConfig = _loadConfig(options.localConfig.path);

      config = Object.assign({}, config, localConfig);
    }
  }

  if (!options.loadToProcess) {
    return config;
  }

  // make config accessible globally in process.config
  for (let variable in config) {
    if (process.config[variable]) {
      continue; // skip when it collides with already existing property
    }

    process.config[variable] = config[variable];
  }

  return config;
};

/**
 * load config file and parse it
 *
 * @param {String} path
 * @returns {*}
 */
const _loadConfig = function (path) {
  const rawConfig = fs.readFileSync(path, {encoding: 'utf-8'});
  const pattern = /process\.env\.(\w+)/g;
  const injected = rawConfig.replace(pattern, (match, envVar) => process.env[envVar]);

  return yaml.safeLoad(injected) || {};
};

module.exports = yamlConf;

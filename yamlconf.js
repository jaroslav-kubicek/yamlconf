'use strict';

const dotenv = require('dotenv');
const fs = require('fs');
const yaml = require('js-yaml');

const yamlConf = function (options) {
  options = options || {};

  const defaults = {
    dotenv: {silent: true, path: './.env'},
    filepath: './config.yml',
    localConfig: false,
    loadToProcess: false
  };

  options = Object.assign({}, defaults, options);

  dotenv.load(options.dotenv);

  if (!fs.existsSync(options.filepath)) {
    throw new Error(`Config file not found: ${options.filepath}`);
  }

  let config = _loadConfig(options.filepath);

  // if localConfig specified,
  if (options.localConfig) {
    if (!fs.existsSync(options.localConfig)) {
      throw new Error(`Local config was specified, but not found: ${options.localConfig}`);
    }

    const localConfig = _loadConfig(options.localConfig);

    config = Object.assign({}, config, localConfig);
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
 * @param {String} filepath
 * @returns {*}
 */
const _loadConfig = function (filepath) {
  const rawConfig = fs.readFileSync(filepath, {encoding: 'utf-8'});
  const pattern = /process\.env\.(\w+)/g;
  const injected = rawConfig.replace(pattern, (match, envVar) => process.env[envVar]);

  return yaml.safeLoad(injected) || {};
};

module.exports = yamlConf;

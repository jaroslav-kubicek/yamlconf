'use strict';

const expect = require('chai').expect;
const yamlconf = require('./..');

describe('yamlconf', function () {
  beforeEach(function () {
    this.preserveProps = Object.keys(process.config);
  });

  afterEach(function () {
    for (let prop in process.config) {
      if (this.preserveProps.indexOf(prop) === -1) {
        delete process.config[prop];
      }
    }

    delete process.env.MONGO;
  });

  it('should load desired config', function () {
    const config = yamlconf('./test/sample/basic/simpleConfig.yml');

    expect(config).to.be.an('object').with.keys(['mongo', 'apiLimit']);
  });

  it('should inject env variables into config when specified', function () {
    const config = yamlconf({
      path: './test/sample/withEnv/config.yml',
      dotenv: {path: './test/sample/withEnv/.env'}
    });

    expect(config.mongo).to.be.equal('mongoContainer');
    expect(config.mongo).to.be.equal(process.env.MONGO);
    expect(config.settings).to.be.an('object').with.keys(['cache', 'prefix']);
  });

  it('should merge local config with the main when specified', function () {
    const config = yamlconf({
      path: './test/sample/local/config.yml',
      localConfig: './test/sample/local/config.local.yml'
    });

    expect(config).to.be.an('object').with.keys(['lists', 'redis', 'settings']);
    expect(config.redis).to.be.equal('redis');
  });

  it('should load config into "process.config" when specified', function () {
    const config = yamlconf({
      path: './test/sample/basic/simpleConfig.yml',
      loadToProcess: true
    });

    expect(config.apiLimit).to.be.equal(150);
    expect(process.config.apiLimit).to.be.equal(config.apiLimit);
    expect(process.config).to.include.keys(['apiLimit', 'mongo']);
  });
});

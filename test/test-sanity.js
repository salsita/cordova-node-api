var assert = require('assert');
var CordovaApp = require('../main');
var path = require('path');
var fs = require('fs');
var fse = require('fs-extra');

describe('basic tests', function() {
  it('test', function(done) {
    var appPath = path.join(__dirname, 'apps/app1');
    if(fs.existsSync(appPath)){
      fse.removeSync(appPath);
    }
    var app1 = new CordovaApp(appPath);
    app1.create().then(function(){
      return app1.getPlatforms();
    }).then(function(platforms){
      assert.strictEqual(platforms.length, 0);

      return app1.addPlatform('android');
    }).then(function(platforms){
      assert.strictEqual(platforms.length, 1);
      assert.strictEqual(platforms[0], 'android');

      return app1.getPlatforms();
    }).then(function(platforms){
      assert.strictEqual(platforms.length, 1);
      assert.strictEqual(platforms[0], 'android');

      return app1.getPlugins();
    }).then(function(plugins){
      //by default, cordova add "cordova-plugin-whitelist" plugin
      assert.strictEqual(plugins.length, 1);

      return app1.addPlugin('cordova-plugin-camera');
    }).then(function(plugins){
      assert.strictEqual(plugins.length, 2);
      assert.strictEqual(plugins[0], 'cordova-plugin-camera');

      return app1.getPlugins();
    }).then(function(plugins){
      assert.strictEqual(plugins.length, 2);
      assert.strictEqual(plugins[0], 'cordova-plugin-camera');

      return app1.removePlugin('cordova-plugin-camera');
    }).then(function(plugins){
      assert.strictEqual(plugins.length, 1);

      return app1.removePlatform('android');
    }).then(function(platforms){
      // assert.strictEqual(platforms.length, 0);
      done();
    });
  });
});
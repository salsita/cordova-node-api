var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');
var cordova = require('cordova');

/****************************************
{
  <appPath1>: {
    create: promise,
    getPlatforms: promise,
    addPlatform: promise,
    removePlatform: promise,
    getPlugins: promise,
    addPlugin: promise,
    removePlugin: promise,
    build: promise
  },
  <appPath2>: {}
}
*****************************************/
var appPromises = {};

bindEvents();

function CordovaApp(_path){
  this.appPath = _path;
  var segs = _path.split(path.sep);
  segs.pop();
  var pfolder = segs.join(path.sep);
  if(!fs.existsSync(pfolder)){
    fs.mkdirSync(pfolder);
  }
  appPromises[this.appPath] = {};
}

CordovaApp.prototype.create = function(){
  appPromises[this.appPath].create = createPromise();
  cordova.create(this.appPath);

  //because we can't get create done event, so loop here
  var checkHandle = setInterval((function(){
    if(fs.existsSync(this.appPath)){
      clearInterval(checkHandle);
      appPromises[this.appPath].create.resolve();
    }
  }).bind(this), 200);
  return appPromises[this.appPath].create.promise;
};

CordovaApp.prototype.getPlatforms = function(){
  process.chdir(this.appPath);
  appPromises[this.appPath].getPlatforms = createPromise();
  cordova.platform('list');
  return appPromises[this.appPath].getPlatforms.promise;
};

CordovaApp.prototype.addPlatform = function(platform){
  process.chdir(this.appPath);
  appPromises[this.appPath].addPlatform = createPromise();
  cordova.platform('add', platform);
  return appPromises[this.appPath].addPlatform.promise;
};

CordovaApp.prototype.removePlatform = function(platform){
  process.chdir(this.appPath);
  appPromises[this.appPath].removePlatform = createPromise();
  cordova.platform('remove', platform);
  return appPromises[this.appPath].removePlatform.promise;
};

CordovaApp.prototype.getPlugins = function(){
  process.chdir(this.appPath);
  appPromises[this.appPath].getPlugins = createPromise();
  cordova.plugin('list');
  return appPromises[this.appPath].getPlugins.promise;
};

CordovaApp.prototype.addPlugin = function(plugin){
  process.chdir(this.appPath);
  appPromises[this.appPath].addPlugin = createPromise();
  cordova.plugin('add', plugin);
  return appPromises[this.appPath].addPlugin.promise;
};

CordovaApp.prototype.removePlugin = function(plugin){
  process.chdir(this.appPath);
  appPromises[this.appPath].removePlugin = createPromise();
  cordova.plugin('remove', plugin);
  return appPromises[this.appPath].removePlugin.promise;
};

CordovaApp.prototype.build = function (platform){
  process.chdir(this.appPath);
  appPromises[this.appPath].build = createPromise();
  cordova.build(platform);
  return appPromises[this.appPath].build.promise;
};

function createPromise(){
  var promise = {};
  promise.promise = new Promise(function(resolve, reject) {
    promise.resolve = resolve;
    promise.reject = reject;
  });
  return promise;
}

module.exports = CordovaApp;


// if(!fs.existsSync(nativeAppsPath)){
//   fse.mkdirs(nativeAppsPath);
// }

function bindEvents(){
  cordova.on('after_platform_ls', function(args){
    if(appPromises[args.projectRoot].getPlatforms){
      appPromises[args.projectRoot].getPlatforms.resolve(args.cordova.platforms);
      appPromises[args.projectRoot].getPlatforms = null;
    }
  });

  cordova.on('after_platform_add', function(args){
    if(appPromises[args.projectRoot].addPlatform){
      appPromises[args.projectRoot].addPlatform.resolve(args.cordova.platforms);
      appPromises[args.projectRoot].addPlatform = null;
    }
  });

  cordova.on('after_platform_rm', function(args){
    if(appPromises[args.projectRoot].removePlatform){
      //args.cordova.platforms contains the platform removed, I think it is a cordova bug.
      appPromises[args.projectRoot].removePlatform.resolve(args.cordova.platforms);
      appPromises[args.projectRoot].removePlatform = null;
    }
  });

  cordova.on('after_plugin_ls', function(args){
    if(appPromises[args.projectRoot].getPlugins){
      appPromises[args.projectRoot].getPlugins.resolve(args.cordova.plugins);
      appPromises[args.projectRoot].getPlugins = null;
    }
  });

  cordova.on('after_plugin_add', function(args){
    if(appPromises[args.projectRoot].addPlugin){
      appPromises[args.projectRoot].addPlugin.resolve(args.cordova.plugins);
      appPromises[args.projectRoot].addPlugin = null;
    }
  });

  cordova.on('after_plugin_rm', function(args){
    if(appPromises[args.projectRoot].removePlugin){
      appPromises[args.projectRoot].removePlugin.resolve(args.cordova.plugins);
      appPromises[args.projectRoot].removePlugin = null;
    }
  });

  cordova.on('after_build', function(args){
    if(appPromises[args.projectRoot].build){
      appPromises[args.projectRoot].build.resolve();
      appPromises[args.projectRoot].build = null;
    }
  });
}

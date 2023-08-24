#!/usr/bin/env node

var Liftoff = require('liftoff');
var argv = require('minimist')(process.argv.slice(2));
var name="th2v";
var path = require('path');
var cli = new Liftoff({
  name: name, // 命令名字
  processTitle: name,
  moduleName: name,
  configName: 'fis-conf', // 配置文件 名称
  // only js supported!
  extensions: {
    '.js': null
  }
});


cli.launch({
  cwd: argv.r || argv.root,
  configPath: argv.f || argv.file
}, function(env) {
  var fis;
  if (!env.modulePath) {
    fis = require('..');
  } else {
    fis = require(env.modulePath);
  }
  console.log('env: ', env);
  console.log('argv: ', argv._);
  console.log('local fis: ', fis.cli.name, fis.cli.info.version);
  console.log("fis require paths: ", path.dirname(__dirname));
  // 初始化项目 带 
  if (argv._[0] === 'init') {
    let tempFiles = path.dirname(__dirname) + "\\demo";
    fis.util.copy(tempFiles, env.cwd);
    console.log("init success");
    return 
  }

  // 配置插件查找路径，优先查找本地项目里面的 node_modules
  // 然后才是全局环境下面安装的 fis3 目录里面的 node_modules
  //fis.require.paths.unshift(path.join(env.cwd, 'node_modules',name));
  fis.require.paths.unshift(path.join(path.dirname(__dirname), 'node_modules'));
  fis.require.paths.push(path.join(path.dirname(__dirname), 'node_modules'));

  fis.cli.run(argv, env);
});

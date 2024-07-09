#!/usr/bin/env node

var fis = (module.exports = require("fis3"));

fis.require.prefixes.unshift("th2v");
fis.cli.name = "th2v";
fis.cli.info = require("./package.json");
fis.cli.version = require("./version.js");

//-动态 输入主要 是配合 jenkins 来做这个处理-
var argv = require('minimist')(process.argv.slice(2));
var Method, buildVersion, buildProject;
if (argv._[1]) {
  Method = argv._[1].split('|')[0];
  buildVersion = argv._[1].split('|')[1];
  buildProject = argv._[1].split('|')[2] ? argv._[1].split('|')[2] + "/" : '';
  if (!buildVersion) {
    buildVersion = "v" + Date.now()
  }
}
//--

var FrameWork = require("./plugin/frame-work.js");
var plugins = {};
var plugin = function (name, options) {
  var localPlugin = plugins[name];
  if (typeof localPlugin === "function") {
    localPlugin.options = options;
    return localPlugin;
  } else {
    return fis.plugin.apply(fis, arguments);
  }
};

// 设置过滤 ignore 文件及目录
fis.set("project.ignore", [
  "node_modules/**",
  ".gitignore",
  "**/_*.scss",
  ".docs/**",
  ".dist/**",
  ".git/**",
  ".svn/**",
  ".idea/**",
  "fis-conf.js",
]);

// [强烈推荐] CommonJs 模块化支持插件。 详情请见 README
fis.hook("commonjs");

// fis3-hook-relative
// 启用插件
fis.hook("relative");
// 让所有文件，都使用相对路径。
fis.match("**", {
  relative: true,
});

// fis-lint-jshint
// JShint 代码检查
fis.config.set("modules.lint.js", "jshint");

// jshint configure plugin settings
fis.config.set("settings.lint.jshint", {
  //ignored some files
  //ignored : 'static/libs/**.js',
  ignored: ["lib/**"],

  //using Chinese reporter
  i18n: "zh-CN",

  //jshint options
  camelcase: true,
  curly: true,
  eqeqeq: true,
  forin: true,
  immed: true,
  latedef: true,
  newcap: true,
  noarg: true,
  noempty: true,
  node: true,
  esnext: "esversion: 6",
});

// fis-spriter-csssprites  最高支持到 node 8.x
fis.config.set("modules.spriter", "csssprites");

// 获取项目的根目录
// const rootPath = fis.project.getProjectPath();
// const rootPath = process.cwd();
// console.log("fis.project.root", fis.project.root);
// console.log('rootPath', rootPath);
// console.log("fis.project.getProjectPath()", fis.project.getProjectPath());
// 输出整的构建日志
// fis.config.set("log", {
//   level: fis.log.LOG_ALL, // 日志输出级别，可选项：LOG_NONE、LOG_ERROR、LOG_WARN、LOG_INFO、LOG_DEBUG
//   file: {
//     path: rootPath + "./fis-debug.log", // 日志输出文件路径
//     level: fis.log.LOG_ALL, // 日志输出级别
//   },
// });

// 替换插件资源路径插件
function replacer(opt) {
  if (!Array.isArray(opt)) {
    opt = [opt];
  }
  var r = [];
  opt.forEach(function (raw) {
    r.push(fis.plugin("replace", raw));
  });
  return r;
}


// Cli 配置
fis.th = function (options) {
  // 配置
  var framework = {
    cache: false, //开启localstorage缓存
    combo: false, // 开启合并
    comboPattern: "",
    urlPattern: "", // 静态资源加载路径模式
    urlPrefix: "", // 静态资源加载路径模式
  };

  var OPTIONS = fis.util.merge(
    {
      framework: framework,
    },
    options
  );
  // 启动运行
  // console.log(argv._)
  console.log(Method)
  console.log(buildVersion)

  // 这里生成一个Txt, 用于记录版本号, 方便Jenkins 构建 及处理
  var txtInfo = `VERSION=${buildVersion}`
  fis.util.write(fis.project.getProjectPath() + "/info.txt", txtInfo, 'utf-8')
  //--


  // console.log(fis.info)
  // 设置 media
  fis.project.currentMedia(Method)
  if (Method == 'jkprod') {
    // 清除缓存
    fis.cache.clean('compile');
    if (!buildProject) {
      buildProject = OPTIONS.name + "/" 
    }
    OPTIONS.ossDomain = OPTIONS.ossDomain + buildProject + buildVersion + "/"
  }
  // ----
  var _u = "",
    _ary = Array.of(OPTIONS.name, OPTIONS.version);
  _ary.forEach((str) => str && (_u += "/" + str));
  //---



  fis.set("frame", {
    framework: framework,
    paths: OPTIONS.paths,
    prefix: _u,
  });

  // config -wL
  fis
    .match("**", {
      useHash: false,
      release: false,
    })
    .match(/^\/(?!lib).*\/[^/]+\.js$/i, {
      // 设置js文件为babel解析，支持es6的写法。
      isJsLike: true,
      lint: plugin("jshint", {
        ignored: ["lib/**.js"],
      }),
      parser: plugin("babel-latest", {
        // babel options
      }),
    })
    .match(/\.scss$/i, {
      rExt: ".css", // from .scss to .css
      parser: plugin("sass3", {
        //fis-parser-sass option
      }),
    })
    .match("::package", {
      // npm install [-g] fis3-postpackager-loader
      // 分析 __RESOURCE_MAP__ 结构，来解决资源加载问题
      spriter: plugin("csssprites", {
        htmlUseSprite: true,
        layout: "matrix",
        scale: 0.5,
        margin: "15",
        styleReg:
          /(<style(?:(?=\s)[\s\S]*?["'\s\w\/\-]>|>))([\s\S]*?)(<\/style\s*>|$)/gi,
      }),
      postpackager: FrameWork,
    })
    .match("/{views,components,modules}/**", {
      //query: '?=t' + Date.now()
    })
    .match("*.{js,es,es6,jsx,ts,tsx}", {
      // 允许你在 js 中直接 require 文件。比如图片，json, 其他静态文件。
      preprocessor: fis.plugin("js-require-file"),
    })
    .match("/components/common/common.js", {
      isLink: true,
      isMod: true,
      useCache: false,
      release: _u + "/static/common.js",
    })
    .match(/^\/views\/.*?([^/]+\.js)$/, {
      release: _u + "/static/$1",
      // js混淆
      // optimizer: fis.plugin("js-obfuscator", { obfuscatorLeval: "low" }),
    })
    .match(
      /^\/(?:views\/modules|components\/widget|modules)\/.*?([^/]+)\.js$/,
      {
        isMod: true,
        moduleId: "$1",
        id: "$1",
        release: _u + "/static/$1",
      }
    )
    .match(/^\/views\/(?!modules).*\.js$/, {
      postprocessor: function (content, file) {
        return content.replace(/require(\(.*\))/g, "require.async$1");
      },
    })
    .match("reset.(css|scss)", {
      packOrder: -100, //用来控制合并时的顺序，值越小越在前面。配合 packTo 一起使用。
    })
    .match(/^\/components\/widget\/.*\.(?:css|scss)$/i, {
      packOrder: 10,
    })
    .match(/^\/components\/.*\.(?:css|scss)$/i, {
      packOrder: 20,
    })
    .match(/^\/views\/.*\.(?:css|scss)$/i, {
      packOrder: 30,
    })
    .match(/^\/(?:views|components|vue)\/.*?([^/]+)(\.vue)$/i, {
      isMod: true,
      moduleId: "$1",
      id: "$1",
      rExt: ".js",
      parser: plugin("vue"),
      release: _u + "/static/vue/$1",
    })
    .match(/^\/(?:views|components).*\.(?:css|scss)$/, {
      useSprite: true,
      isCssLike: true,
      packTo: "/modules/style.css",
      isPack: true,
      release: true,
    })
    .match(/.*\/([^/]+)\.css\.map$/i, {
      isPack: true,
      release: true,
    })
    .match("/modules/(**.css)", {
      release: _u + "/static/$1",
    })
    .match("/lib/**", {
      release: _u + "/$0",
    })
    .match(
      /.*?([^/]+\.(?:svg|tif|tiff|wbmp|png|bmp|fax|gif|ico|jfif|jpe|jpeg|jpg|woff|cur))$/,
      {
        //useHash: true,
        release: _u + "/static/images/$1",
      }
    )
    .match(/.*?([^/]+\.(?:mp3|ogg|wav))$/, {
      //useHash: true,
      release: _u + "/static/audio/$1",
    })
    .match("/views/tpl/**.html", {
      isPack: true,
    })
    .match("/views/tpl/**.js", {
      isPack: true,
    })
    .match(/^(?!.*tpl).*\/([^/]+\.html)$/i, {
      isViews: true,
      useCache: false,
      postprocessor: function (content, file, settings) {
        file.base = OPTIONS.base;
        return content.replace(/<!--([\s\S]*?)-->/g, "");
      },
      release: _u + "/$1",
    })
    .match(/^.*tpl.*\/([^/]+\.js)$/i, {
      packTo: "/views/tpl.js",
      isPack: true,
      release: true,
    })
    .hook("amd", {
      paths: OPTIONS.paths,
      shim: OPTIONS.shim,
      forwardDeclaration: true,
      skipBuiltinModules: true,
    })
    .match("**", {
      deploy: plugin("local-deliver", {
        to: OPTIONS.deploy,
      }),
    });

  // prod
  fis
    .media("prod")
    .match("/lib/**", {
      domain: OPTIONS.domain,
    })
    .match(/^\/(?!lib).*\/[^/]+\.js$/i, {
      useHash: true,
      query: "",
      optimizer: plugin("uglify-js", {
        // option of uglify-js
        mangle: {
          except: "exports, module, require, define,$",
        },
        compress: {
          drop_console: true,
        },
      }),
    })
    .match(/\.(css|scss)$/i, {
      optimizer: plugin("clean-css"),
    })
    .match("/modules/(**.css)", {
      useHash: true,
    })
    .match(/\.png$/i, {
      optimizer: plugin("png-compressor"),
    })
    .match(
      /.*?([^/]+\.(?:svg|tif|tiff|wbmp|png|bmp|fax|gif|ico|jfif|jpe|jpeg|jpg|woff|cur))$/,
      {
        useHash: true,
      }
    )
    .match(/^(?!.*tpl).*\/([^/]+\.html)$/i, {
      isProd: true,
    })
    .match("**", {
      deploy: [
        plugin("local-deliver", {
          to: OPTIONS.prodPloay || OPTIONS.deploy,
        })
      ],
    });

  // ---oss版
  fis
    .media("prodoss")
    .match("/lib/**", {
      domain: OPTIONS.ossDomain,
    })
    .match(/^\/(?!lib).*\/[^/]+\.js$/i, {
      useHash: true,
      query: "",
      optimizer: plugin("uglify-js", {
        // option of uglify-js
        mangle: {
          except: "exports, module, require, define,$",
        },
        compress: {
          drop_console: true,
        },
      }),
    })
    .match(/\.(css|scss)$/i, {
      optimizer: plugin("clean-css"),
    })
    .match("/modules/(**.css)", {
      useHash: true,
    })
    .match(/\.png$/i, {
      optimizer: plugin("png-compressor"),
    })
    .match(
      /.*?([^/]+\.(?:svg|tif|tiff|wbmp|png|bmp|fax|gif|ico|jfif|jpe|jpeg|jpg|woff|cur))$/,
      {
        useHash: true,
      }
    )
    .match(/^(?!.*tpl).*\/([^/]+\.html)$/i, {
      isProd: true,
    })
    .match("**", {
      deploy: replacer([
        {
          from: "static/",
          to: OPTIONS.ossDomain + "static/",
        },
        {
          from: "//lib/",
          to: "/lib/",
        },
      ]).concat(
        fis.plugin("local-deliver", {
          to: OPTIONS.prodPloay || OPTIONS.deploy,
        })
      ),
    });

  // -- jenkins
  fis
    .media("jkprod")
    .match("/lib/**", {
      domain: OPTIONS.ossDomain,
    })
    .match(/^\/(?!lib).*\/[^/]+\.js$/i, {
      useHash: true,
      query: "",
      optimizer: plugin("uglify-js", {
        // option of uglify-js
        mangle: {
          except: "exports, module, require, define,$",
        },
        compress: {
          drop_console: true,
        },
      }),
    })
    .match(/\.(css|scss)$/i, {
      optimizer: plugin("clean-css"),
    })
    .match("/modules/(**.css)", {
      useHash: true,
    })
    .match(/\.png$/i, {
      optimizer: plugin("png-compressor"),
    })
    .match(
      /.*?([^/]+\.(?:svg|tif|tiff|wbmp|png|bmp|fax|gif|ico|jfif|jpe|jpeg|jpg|woff|cur))$/,
      {
        useHash: true,
      }
    )
    .match(/^(?!.*tpl).*\/([^/]+\.html)$/i, {
      isProd: true,
    })
    .match("**", {
      // 增加OSS Domain Cdn前辍
      deploy: replacer([
        {
          from: "static/",
          to: OPTIONS.ossDomain + "static/",
        },
        {
          from: "//lib/",
          to: "/lib/",
        },
      ]).concat(
        // 特殊处理
        fis.plugin("local-deliver", {
          to: "./dist",
        }),



      ),
    });
};

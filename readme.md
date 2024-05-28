## th2v 2021 版构建工具

```js
    // 编辑开发 
    th2v release -wL

    // 本地编译发布 
    th2v release prod

    // 本地编译发布 (js css img) 采用 oss / cdn 版本
    th2v release prodoss 

    // jenkins 编译发布,需配合  package.json  中的scripts 命令一起使用
    //  package.json
      //  "scripts": {
      //     "test": "echo \"Error: no test specified\" && exit 1",
      //     "build": "th2v release jkprod"
      //  }
    // ---
    //  fis-conf.js 
    //      jenkins打包目录 要用相对路径  "./dist" 默认是用这个
    //      jenkinsPath: "./dist"
    th2v release jkprod

```

### 问题处理

- 出现800A138F的错误 WIN7, WIN10
  找到你放js文件的位置，然后右击鼠标， 选择打开方式，会看到如下图 
  ![](https://gitee.com/codeour/res/raw/master/img/20210723091338.jpg)  
  改成node.exe 默认打开就可以了
  
  
 
### 更新日志

#### 2024-5-28 

- th2v release jkprod|v20240528|gansu-shop
  -支持 版本, 项目路径

#### 2021-7-22 增加 

- jenkins 构建的支持 
- 升级部分依赖
- 升级支持 node 12.x 以上的
- csssprites 因最高版本只支持到node8, 所以此功能 失效

#### 2020-6-11  增加 功能

- 1. crossorigin="anonymous"

#### 2018-11-28 th2 升级=>th2v

- 1. 修复一些错误 css 合并错误 
- 2. 增加 OSS 自定义域名
- 3. 优化 css -moz- 的支持
- 4. add javascript-obfuscator 
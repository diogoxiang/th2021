## th2v 2021 版构建工具

```js
    // 编辑开发 
    fis3 release -wL

    // 本地编译发布 
    fis3 release prod

    // 本地编译发布 (js css img) 采用 oss / cdn 版本
    fis3 release prodoss 

    // jenkins 编译发布 
    fis3 release jkprod

```

## 2021-7-22 增加 

- jenkins 构建的支持 
- 升级部分依赖
- 升级支持 node 12.x 以上的
- csssprites 因最高版本只支持到node8 

## 2020-6-11  增加 功能

- 1. crossorigin="anonymous"



## 2018-11-28 th2 升级=>th2v

- 1. 修复一些错误 css 合并错误 
- 2. 增加 OSS 自定义域名
- 3. 优化 css -moz- 的支持
- 4. add javascript-obfuscator 
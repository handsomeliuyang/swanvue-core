


# swanvue-core

基于百度小程序swan-core，替换其中的MVVM框架san，使用vue的小程序框架。

由于百度小程序只开源了js部分，对于native部分没有开源，此项目的目标就是把未开源的部分还原回去，界面渲染框架使用vue

## 思路

1. mock native部分代码，运行swan-core代码
2. 渲染部分使用vue替换san
3. 添加自定义组件
4. 渲染与逻辑分离，创建两个web运行环境，native实现渲染与逻辑通信
4. 实现编译脚本，对小程序代码进行转译

## build
```shell
// 编译出master, slave
npm run build:test

// 运行测试项目
cd test
npm start
```

## 技术交流群

群名称：swanvue-core-交流群

群   号：733617647

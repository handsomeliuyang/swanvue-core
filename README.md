


# wxavue
> Vue.js 小程序版, fork 自 [vuejs/vue@2.5.21](https://github.com/vuejs/vue)，hook template 的解析，新增platform

`wxavue` 是一个支持微信小程序 Api，使用 [Vue.js](https://vuejs.org) 为运行内核的前端框架。框架基于 `Vue.js` 核心，`wxavue` 修改了 `Vue.js` 的 runtime 和 compiler 实现，使其能支持小程序的Api，直接支持运行小程序的代码。

## 名称由来

`wxavue`：Wxapp Api Vue Kernel

## 最终目标

1. 基于MVVM框架Vue，实现一套小程序框架，渲染层与逻辑层分离，提升性能的同学，实现可控性
2. 完全兼容运行微信小程序

## 思路

1. wxml 转换为 Vue's AST
2. 基于 Vue 对象，封装 Page 函数
3. 打包工程，实现工程目录的转换
4. 逐步完善小程序的 component 和 api

## build
```shell
npm run dev:wxavue
```

## example
1. simple：examples/wxavue/simple
2. wxdemo：examples/wxavue/wxdemo

## 技术交流群

群名称：wxavue-交流群

群   号：733617647




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

## TODO列表
1. 项目初始化  —— done
2. 添加wxavue platform，并能正常打包 —— done
3. parser添加hook api，对外输出Page函数，创建一个simple demo — done
4. 不支持svg和math里的标签，与view会发生冲突，通过module实现hook parser，替换wxml的标签 —— done
5. wxml标签支持，并转换为Vue支持的AST语法树：
  ```
  1. bindtap="fun" 转换为 v-on:click="fun($event)" --- done
  2. xxx="item-{{id}}" 转换为 v-bind:xxx="'item-'+(id)" --- done
  3. view 转换为 div ---- done
  4. text 转换为 div ---- done
  5. image 转换为 img ---- done
  ```
6. 按微信小程序的navigator，结合vue-router, 生成Vue的内置组件navigator --- done
7. wxdemo改进：
  1. 使用webpack打包 ---- done
  2. 图片统一放置在pages同级目录images里 --- done
  3. 读取小程序的app.json的pages，当路由配置 --- done
  4. vue-router搭建框架 --- done
  5. 使用Vue Single File Components --- undo
  6. 修改vue-loader的compiler --- undo
  7. template使用precompile --- undo
8. 实现data不用预初始化 --- undo

## 技术交流群

群名称：wxavue-交流群

群   号：733617647

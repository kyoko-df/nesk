# Nesk

> Nest Koa版本，fork自 [Nest@4.6.5](https://github.com/nestjs/nest)，整体流程和方法和Nest基本一致，底层换成了koa框架。

## 安装

```
npm install @neskjs/commom
npm install @neskjs/core
```

cli在路上，或者也可以使用nest生态工具修改一下

## 区别点

### 方法扩展

Koa的集成度没有Express高，所以增加了

1. koa-bodyparse，可以在全局options(bodyparser)中关闭。
2. 404处理，可以在全局options(errorHandler)中关闭。
3. koa-views，通过app.engine启用

### 中间件

因为koa的中间件使用方式不同于express，且基本依赖于context(ctx)上下文，所以在guard， interceptor等原本提供request参数的地方都换成了context。

在param上也提供ctx()，来获取ctx或者ctx上的方法在controller层使用。

### @Nest包使用

Nest提供了一些例如grahql的包，里面完全没有依赖express，所以不需要在提供@nesk的包，但是这些包会依赖@nestjs/core或者@nestjs/common，所以只需要安装module-alias，然后在package.json里添加

```
"_moduleAliases": {
  "@nestjs/common": "node_modules/@neskjs/common",
  "@nestjs/core": "node_modules/@neskjs/core"
}
```

最后在very开始的地方注入：

```js
require('module-alias/register')
```

## 注意

1. 如果你完全没看懂上面在说什么，请先熟悉[Nest中文指南](https://docs.nestjs.cn/)
2. Nesk还在改进中，目前基本流程可以跑通，欢迎你的贡献
3. 我相信你会喜欢上这种开发模式（:>）


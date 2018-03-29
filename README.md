# Nesk

> Nest Koa版本，fork自 [Nest@4.6.5](https://github.com/nestjs/nest)，整体流程和方法和Nest基本一致，底层换成了koa框架。

## 区别点

### 方法扩展

Koa的集成度没有Express高，所以增加了

1. koa-bodyparse，可以在全局options(bodyparser)中关闭。
2. 404处理，可以在全局options(errorHandler)中关闭。
3. koa-views，通过app.engine启用

### 中间件

因为koa的中间件使用方式不同于express，且基本依赖于context(ctx)上下文，所以在guard， interceptor等原本提供request参数的地方都换成了context。

在param上也提供ctx()，来获取ctx或者ctx上的方法在controller层使用。

## 注意

1. 如果你完全没看懂上面在说什么，请先熟悉[Nest中文指南](https://docs.nestjs.cn/)
2. Nesk还在改进中，目前基本流程可以跑通，欢迎你的贡献
3. 我相信你会喜欢上这种开发模式（:>）


## 从Nest到Nesk -- 模块化Node框架的尝试到实践

首先上一下项目地址（:>):

[Nest](https://github.com/nestjs/nest)

[Nesk](https://github.com/kyoko-df/nesk)

### Nest初认识

Nest是一个深受angular激发的基于express的node框架，按照官网说明是一个旨在提供一个开箱即用的应用程序体系结构，允许轻松创建高度可测试，可扩展，松散耦合且易于维护的应用程序。

在设计层面虽然说是深受angular激发，但其实从后端开发角度来说类似于大家熟悉的Java Spring架构，使用了大量切面编程技巧，再通过装饰器的结合完全了关注上的分离。同时使用了Typescript(也支持Javascript)为主要开发语言，更保证了整个后端系统的健壮性。

### 强大的Nest架构

那首先为什么需要Nest框架，我们从去年开始大规模使用Node来替代原有的后端View层开发，给予了前端开发除了SPA以外的前后端分离方式。早期Node层的工作很简单-渲染页面代理接口，但在渐渐使用中大家会给Node层更多的寄托，尤其是一些内部项目中，你让后端还要将一些现有的SOA接口进行包装，对方往往是不愿意的。那么我们势必要在Node层承接更多的业务，包括不限于对数据的组合包装，对请求的权限校验，对请求数据的validate等等，早期我们的框架是最传统的MVC架构，但是我们翻阅业务代码，往往最后变成复杂且很难维护的Controller层代码（从权限校验到页面渲染一把撸到底:)）。

那么我们现在看看Nest可以做什么？从一个最简单的官方例子开始看：

```ts
async function bootstrap() {
  const app = await NestFactory.create(ApplicationModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
```

这里就启动了一个nest实例，先不看这个ValidationPipe，看ApplicationModule的内容：

```ts
@Module({
  imports: [CatsModule],
})
export class ApplicationModule implements NestModule {
  configure(consumer: MiddlewaresConsumer): void {
    consumer
      .apply(LoggerMiddleware)
      .with('ApplicationModule')
      .forRoutes(CatsController);
  }
}
```

```ts
@Module({
  controllers: [CatsController],
  components: [CatsService],
})
export class CatsModule {}
```

这里看到nest的第一层入口module，也就是模块化开发的根本，所有的controller，component等等都可以根据业务切分到某个模块，然后模块之间还可以嵌套，成为一个完整的体系，借用张nest官方的图：

![module](./Modules_1.png)


在nest中的component概念其实一切可以注入的对象，对于依赖注入这个概念在此不做深入解释，可以理解为开发者不需要实例化类，框架会进行实例化且保存为单例。

```ts
@Controller('cats')
@UseGuards(RolesGuard)
@UseInterceptors(LoggingInterceptor, TransformInterceptor)
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Post()
  @Roles('admin')
  async create(@Body() createCatDto: CreateCatDto) {
    this.catsService.create(createCatDto);
  }

  @Get()
  async findAll(): Promise<Cat[]> {
    return this.catsService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', new ParseIntPipe())
    id,
  ): Promise<Cat> {
    return this.catsService.findOne(id);
  }
}
```

Controller的代码非常精简，很多重复的工作都通过guards和interceptors解决，第一个装饰器Controller可以接受一个字符串参数，即为路由参数，也就是这个Controller会负责/cats路由下的所有处理。首先RolesGuard会进行权限校验，这个校验是自己实现的，大致结构如下：

```ts
@Guard()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(request, context: ExecutionContext): boolean {
    const { parent, handler } = context;
    const roles = this.reflector.get<string[]>('roles', handler);
    if (!roles) {
      return true;
    }

    // 自行实现
  }
}
```

context可以获取controller的相关信息，再通过反射拿到handler上是否有定义roles的元信息，如果有就可以在逻辑里根据自己实现的auth方法或者用户类型来决定是否让用户访问相关handler。

interceptors即拦截器，它可以：

- 在方法执行之前/之后绑定额外的逻辑
- 转换从函数返回的结果
- 转换从函数抛出的异常
- 根据所选条件完全重写函数 (例如, 缓存目的)

本示例有两个拦截器一个用来记录函数执行的时间，另一个对结果进行一层包装，这两个需求都是开发中很常见的需求，而且拦截器会提供一个rxjs的观察者流来处理函数返回，支持异步函数，我们可以通过map()来mutate这个流的结果，可以通过do运算符来观察函数观察序列的执行状况，另外可以通过不返回流的方式，从而阻止函数的执行，LoggingInterceptor例子如下：

```ts
@Interceptor()
export class LoggingInterceptor implements NestInterceptor {
  intercept(dataOrRequest, context: ExecutionContext, stream$: Observable<any>): Observable<any> {
    console.log('Before...');
    const now = Date.now();

    return stream$.do(
      () => console.log(`After... ${Date.now() - now}ms`),
    );
  }
}
```

回到最初的ValidationPipe，它是一个强大的校验工具，我们看到前面的controller代码中插入操作中有一个CreateCatDto，dto是一种数据传输对象，一个dto可以这样定义：

```ts
export class CreateCatDto {
  @IsString() readonly name: string;

  @IsInt() readonly age: number;

  @IsString() readonly breed: string;
}
```

然后ValidationPipe会检查body是否符合这个dto，如果不符合就会就会执行你在pipe中设置的处理方案。具体是如何实现的可以再写一篇文章了，所以我推荐你看[nest中文指南](https://docs.nestjs.cn/)(顺便感谢翻译的同学们)

示例的完整代码可以看[01-cats-app](https://github.com/nestjs/nest/tree/master/examples/01-cats-app)

也就是说业务团队中的熟练工或者架构师可以开发大量的模块，中间件，异常过滤器，管道，看守器，拦截器等等，而不太熟练的开发者只需要完成controller的开发，在controller上像搭积木般使用这些设施，即完成了对业务的完整搭建。

### Nesk-一个落地方案的尝试

虽然我个人很喜欢Nest，但是我们公司已经有一套基于koa2的成熟框架Aconite，而Nest是基于express的，查看了下Nest的源码，对express有一定的依赖，但是koa2和express在都支持async语法后，差异属于可控范围下。另外nest接受一个express的实例，在nesk中我们只需要调整为koa实例，那么也可以是继承于koa的任何项目实例，我们的框架在2.0版本也是一个在koa上继承下来的node框架，基于此，我们只需要一个简单的adapter层就可以无缝接入Aconite到nesk中，这样减少了nesk和内部服务的捆绑，而将所有的公共内部服务整合保留在aconite中。Nest对于我们来说只是一个更完美的开发范式，不承接任何公共模块。

所以我们需要的工作可以简单总结为：
1. 支持Koa
2. 适配Aconite

支持Koa我们在Nest的基础上做了一些小改动完成了Nesk来兼容Koa体系。我们只需要完成Nesk和Aconite中间的Adapter层，就可以完成Nesk的落地，最后启动处的代码变成：

```ts
import { NeskFactory } from '@neskjs/core';
import { NeskAconite } from '@hujiang/nesk-aconite';
import { ApplicationModule } from './app.module';
import { config } from './common/config';
import { middwares } from './common/middlware';

async function bootstrap() {
  const server = new NeskAconite({
    projectRoot: __dirname,
    middlewares,
    config
  });
  const app = await NeskFactory.create(ApplicationModule, server);
  await app.listen(config.port);
}
```

最后Nest有很多@nest scope下的包，方便一些工具接入nest，如果他们与express没有关系，我们其实是可以使用的。但是包内部往往依赖@nest/common或者@nesk/core，这里可以使用module-alias，进行一个重指向（你可以尝试下graphql的例子）:

```
"_moduleAliases": {
  "@nestjs/common": "node_modules/@neskjs/common",
  "@nestjs/core": "node_modules/@neskjs/core"
}
```

Nesk的地址[Nesk](https://github.com/kyoko-df/nesk)，我们对Nesk做了基本流程测试目前覆盖了common和core，其它的在等待改进，欢迎一切愿意一起改动的开发者。

### 不足与期待

其实从一个更好的方面来说，我们应当允许nest接受不同的底层框架，即既可以使用express，也可以使用koa，通过一个adapter层抹平差异。不过这一块的改造成本会大一些。

另一方面nest有一些本身的不足，在依赖注入上，还是选择了ReflectiveInjector，而Angular已经开始使用了StaticInjector，理论上StaticInjector减少了对Map层级的查找，有更好的性能，这也是我们决定分叉出一个nesk的原因，可以做一些更大胆的内部代码修改。另外angular的依赖注入更强大，有例如useFactory和deps等方便测试替换的功能，是需要nest补充的.

最后所有的基于Koa的框架都会问到一个问题，能不能兼容eggjs(:))，其实无论是Nest还是Nesk都是一个强制开发规范的框架，只要eggjs还建立在koa的基础上，就可以完成集成，只是eggjs在启动层面的改动较大，而且开发范式和nest差异比较多，两者的融合并没有显著的优势。

总之Node作为一个比较灵活的后端开发方式，每个人心中都有自己觉得合适的开发范式，如果你喜欢这种方式，不妨尝试下Nest或者Nesk。

import { Get, Post, Controller, Render, Body, Ctx } from '../../../src/common';

@Controller('test')
export class TestController {
  @Get()
  @Render('index')
  async root(@Ctx() ctx) {
    return { message: 'Hello world!' };
    // console.log(ctx)
    // await ctx.render('index', { message: 'Hello world!' })
  }

  @Get('abc')
  @Render('index')
  test() {
    return { message: 'test' };
  }
}

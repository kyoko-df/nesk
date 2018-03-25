import { Get, Post, Controller, Render, Body, Ctx } from '../../../src/common';

@Controller()
export class AppController {
  @Get()
  // @Render('index')
  root(@Ctx() ctx) {
    // return { message: 'Hello world!' };
    ctx.render('index', { message: 'Hello world!' })
  }

  @Get('test')
  @Render('index')
  test() {
    return { message: 'test' };
  }
}

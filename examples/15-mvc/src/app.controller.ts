import { Get, Post, Controller, Render, Body, Ctx } from '../../../src/common';

@Controller('')
export class AppController {
  @Get()
  @Render('index')
  async root(@Ctx() ctx) {
    return { message: 'Hello world!' };
    // await ctx.render('index', { message: 'Hello world!' })
  }
}

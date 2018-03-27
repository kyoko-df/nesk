import { ExceptionFilter, Catch } from '@neskjs/common';
import { HttpException } from '@neskjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, ctx) {
    const { response } = ctx;
    const status = exception.getStatus();

    response.status = status
    response.json({
      statusCode: status,
      message: `It's a message from the exception filter`,
    });
  }
}

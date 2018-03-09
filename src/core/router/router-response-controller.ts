import { RequestMethod, HttpStatus } from '../../common';
import { isNil, isObject, isFunction } from '../../common/utils/shared.utils';
import 'rxjs/add/operator/toPromise';

export class RouterResponseController {
  public async apply(resultOrDeffered, response, httpStatusCode: number) {
    const result = await this.transformToResult(resultOrDeffered);
    const res = response.status(httpStatusCode);
    if (isNil(result)) {
      return res.send();
    }
    return isObject(result) ? res.json(result) : res.send(String(result));
  }

  public async render(resultOrDeffered, response, template: string) {
    const result = await this.transformToResult(resultOrDeffered);
    response.render(template, result);
  }

  public async transformToResult(resultOrDeffered) {
    if (resultOrDeffered instanceof Promise) {
      return await resultOrDeffered;
    } else if (resultOrDeffered && isFunction(resultOrDeffered.subscribe)) {
      return await resultOrDeffered.toPromise();
    }
    return resultOrDeffered;
  }

  public getStatusByMethod(requestMethod: RequestMethod): number {
    switch (requestMethod) {
      case RequestMethod.POST:
        return HttpStatus.CREATED;
      default:
        return HttpStatus.OK;
    }
  }
}

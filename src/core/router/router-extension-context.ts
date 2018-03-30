import { isNil, isObject } from '@neskjs/common/utils/shared.utils';

const [METHOD_SET, METHOD_BODY, METHOD_JSON, METHOD_SEND] = [
  'set',
  'body',
  'json',
  'send',
];

export class RouterExtensionContext {
  public create(context) {
    let { response } = context;
    response = this.createProxy(response);
    return Object.assign({}, context, { response });
  }

  public createProxy(response) {
    const proxy = this.createResponseProxy();
    return new Proxy(response, {
      get: proxy,
    });
  }

  private createResponseProxy() {
    return (receiver, prop) => {
      if (prop === METHOD_JSON || prop === METHOD_BODY) {
        return (body?: string | number | boolean | object | Buffer) => {
          if (isNil(body)) return null;
          receiver[METHOD_BODY] = body;
        };
      }

      return receiver[prop];
    };
  }
}

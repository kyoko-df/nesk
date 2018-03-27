const CONTENT_TYPE = 'Content-Type';
const APPLICATION_JSON = 'application/json';

export class RouterExtensionContext {
  public create(context) {
    const { request, response } = context;
    this.createResponse(response);
    return context;
  }

  public createResponse(response) {
    response.json = this.addJsonMethod(response);
    response.send = this.addSendMethod(response);
  }

  private addJsonMethod(response) {
    return (obj: string | number | boolean | object) => {
      response.set(CONTENT_TYPE, APPLICATION_JSON);
      response.body = obj;
    };
  }

  private addSendMethod(response) {
    return (body: string | number | boolean | object | Buffer) =>
      (response.body = body);
  }
}

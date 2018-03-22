export class BaseExtension {
  public response(response) {
    Object.defineProperties(response, {
      json: {
        get() {
          return (obj:string|number|boolean|object) => {
            response.set('Content-Type', 'application/json');
            response.body = obj;
          };
        },
      },
      send: {
        get() {
          return (body: string|number|boolean|object|Buffer) => {
            response.body = body;
          }
        }
      }
    });
  }
}

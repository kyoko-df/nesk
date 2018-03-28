export interface KoaMiddleware {
    (ctx?: any, next?: any): void;
}

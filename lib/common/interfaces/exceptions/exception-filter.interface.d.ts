export interface ExceptionFilter {
    catch(exception: any, ctx: any): any;
}

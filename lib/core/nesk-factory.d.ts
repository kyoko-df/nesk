import { NeskApplicationOptions } from '@neskjs/common/interfaces/nesk-application-options.interface';
import { INeskApplication, INeskMicroservice, INeskApplicationContext } from '@neskjs/common';
import { NeskApplicationContextOptions } from '@neskjs/common/interfaces/nesk-application-context-options.interface';
import { NeskMicroserviceOptions } from '@neskjs/common/interfaces/microservices/nesk-microservice-options.interface';
export declare class NeskFactoryStatic {
    private readonly logger;
    /**
     * Creates an instance of the NestApplication (returns Promise)
     * @returns an `Promise` of the INestApplication instance
     */
    create(module: any): Promise<INeskApplication>;
    create(module: any, options: NeskApplicationOptions): Promise<INeskApplication>;
    create(module: any, koa: any, options: NeskApplicationOptions): Promise<INeskApplication>;
    /**
     * Creates an instance of the NeskMicroservice (returns Promise)
     *
     * @param  {} module Entry (root) application module class
     * @param  {NeskMicroserviceOptions} options Optional microservice configuration
     * @returns an `Promise` of the INeskMicroservice instance
     */
    createMicroservice(module: any, options?: NeskMicroserviceOptions): Promise<INeskMicroservice>;
    /**
     * Creates an instance of the NeskApplicationContext (returns Promise)
     *
     * @param  {} module Entry (root) application module class
     * @param  {NeskApplicationContextOptions} options Optional Nesk application configuration
     * @returns an `Promise` of the INeskApplicationContext instance
     */
    createApplicationContext(module: any, options?: NeskApplicationContextOptions): Promise<INeskApplicationContext>;
    private createNeskInstance<T>(instance);
    private initialize(module, container, config?, koa?);
    private createProxy(target);
    private createExceptionProxy();
    private applyLogger(options);
}
export declare const NeskFactory: NeskFactoryStatic;

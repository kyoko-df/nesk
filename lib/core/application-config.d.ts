import { PipeTransform, WebSocketAdapter, ExceptionFilter, NeskInterceptor, CanActivate } from '@neskjs/common';
import { ConfigurationProvider } from '@neskjs/common/interfaces/configuration-provider.interface';
export declare class ApplicationConfig implements ConfigurationProvider {
    private ioAdapter;
    private globalPipes;
    private globalFilters;
    private globalInterceptors;
    private globalGuards;
    private globalPrefix;
    constructor(ioAdapter?: WebSocketAdapter | null);
    setGlobalPrefix(prefix: string): void;
    getGlobalPrefix(): string;
    setIoAdapter(ioAdapter: WebSocketAdapter): void;
    getIoAdapter(): WebSocketAdapter;
    addGlobalPipe(pipe: PipeTransform<any>): void;
    useGlobalPipes(...pipes: PipeTransform<any>[]): void;
    getGlobalFilters(): ExceptionFilter[];
    addGlobalFilter(filter: ExceptionFilter): void;
    useGlobalFilters(...filters: ExceptionFilter[]): void;
    getGlobalPipes(): PipeTransform<any>[];
    getGlobalInterceptors(): NeskInterceptor[];
    addGlobalInterceptor(interceptor: NeskInterceptor): void;
    useGlobalInterceptors(...interceptors: NeskInterceptor[]): void;
    getGlobalGuards(): CanActivate[];
    addGlobalGuard(guard: CanActivate): void;
    useGlobalGuards(...guards: CanActivate[]): void;
}

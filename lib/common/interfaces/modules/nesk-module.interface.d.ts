import { MiddlewaresConsumer } from '../middlewares/middlewares-consumer.interface';
export interface NeskModule {
    configure(consumer: MiddlewaresConsumer): MiddlewaresConsumer | void;
}

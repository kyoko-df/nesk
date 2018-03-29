import {
  Module,
  MiddlewaresConsumer,
  NeskModule,
  RequestMethod,
} from '@neskjs/common';
import { graphqlKoa, graphiqlKoa } from 'apollo-server-koa';
import { GraphQLModule, GraphQLFactory } from '@nestjs/graphql';

import { CatsModule } from './cats/cats.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';

@Module({
  imports: [SubscriptionsModule.forRoot(), CatsModule, GraphQLModule],
})
export class ApplicationModule implements NeskModule {
  constructor(
    private readonly subscriptionsModule: SubscriptionsModule,
    private readonly graphQLFactory: GraphQLFactory,
  ) {}

  configure(consumer: MiddlewaresConsumer) {
    const schema = this.createSchema();
    this.subscriptionsModule.createSubscriptionServer(schema);

    consumer
      .apply(
        graphiqlKoa({
          endpointURL: '/graphql',
          subscriptionsEndpoint: `ws://localhost:3001/subscriptions`,
        }),
      )
      .forRoutes({ path: '/graphiql', method: RequestMethod.GET })
      .apply(graphqlKoa(req => ({ schema, rootValue: req })))
      .forRoutes({ path: '/graphql', method: RequestMethod.ALL });
  }

  createSchema() {
    const typeDefs = this.graphQLFactory.mergeTypesByPaths('./**/*.graphql');
    const schema = this.graphQLFactory.createSchema({ typeDefs });
    return schema;
  }
}

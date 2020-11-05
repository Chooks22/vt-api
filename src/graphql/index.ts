import { config } from 'dotenv';
config();

import { ApolloServer } from 'apollo-server';
import { createRateLimitDirective } from 'graphql-rate-limit';
import debug from '../modules/logger';
import { resolvers, typeDefs } from './root';

const rateLimitDirective = createRateLimitDirective({ identifyContext: (ctx) => ctx.id });

const logger = debug('app');
const server = new ApolloServer({
  schemaDirectives: {
    rateLimit: rateLimitDirective
  },
  typeDefs,
  resolvers,
  introspection: true,
  playground: {
    endpoint: '/playground'
  }
});

server.listen(+process.env.PORT || 2434).then(({ url }) => {
  logger.info(`Server ready at ${url}`);
});

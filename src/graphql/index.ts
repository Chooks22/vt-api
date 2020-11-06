import { config } from 'dotenv';
config();

import { ApolloServer } from 'apollo-server';
import { createRateLimitDirective } from 'graphql-rate-limit';
import debug from '../modules/logger';
import { resolvers, typeDefs } from './root';

const rateLimitDirective = createRateLimitDirective({ identifyContext: (ctx) => ctx.id });
const { NODE_ENV, PORT } = process.env;

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
  },
  tracing: NODE_ENV === 'development'
});

server.listen(+PORT || 2434).then(({ url }) => {
  logger.info(`Server ready at ${url}`);
});

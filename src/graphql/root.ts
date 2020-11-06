import { gql } from 'apollo-server';
import { GraphQLJSON } from 'graphql-type-json';
import { Query } from './query';
import { typeDefs as types } from './typeDefs';

const root = gql`
  scalar JSON
  type Query {
    root: String
  }
  directive @rateLimit(
    max: Int,
    window: String,
    message: String,
    identityArgs: [String],
    arrayLengthField: String
  ) on FIELD_DEFINITION
`;

export const typeDefs = types.concat(root);
export const resolvers = {
  JSON: GraphQLJSON,
  Query
};

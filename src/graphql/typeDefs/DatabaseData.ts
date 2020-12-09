import { gql } from 'apollo-server';

export const typeDef = gql`
  type DataObject {
    organizations: [String]!
    channels: Int!
    videos: Int!
  }
  extend type Query {
    data(
      channel_id: [ID]
      organizations: [String]
      exclude_organizations: [String]
    ): DataObject!
    @rateLimit(window: "1s", max: 10, message: "You are doing that too often.")
  }
`;

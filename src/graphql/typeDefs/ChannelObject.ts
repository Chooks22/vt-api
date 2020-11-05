import { gql } from 'apollo-server';

export const typeDef = gql`
  type ChannelObject {
    _id: ID!
    name: Names!
    organization: String!
    platform_id: PlatformId!
    channel_name: String
    channel_id: ID!
    details: JSON
    channeL_stats: ChannelStats
    description: String
    thumbnail: String
  }
  type Names {
    en: String!
    jp: String
    kr: String
    cn: String
  }
  type ChannelStats {
    published_at: Float
    views: Float
    subscribers: Float
    videos: Float
  }
  input SortFields {
    _id: Sort
    published_at: Sort
    subscribers: Sort
    videos: Sort
  }
  enum Sort {
    asc
    desc
  }
  extend type Query {
    channels(
      _id: [ID]
      name: String 
      organizations: [String]
      platforms: [PlatformId]
      channel_id: [ID]
      order_by: SortFields = { _id: asc }
      limit: Int = 25
    ): [ChannelObject]
    @rateLimit(window: "1s", max: 10, message: "You are doing that too often.")
  }
`;

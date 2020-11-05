import { gql } from 'apollo-server';

export const typeDef = gql`
  type VideoObject {
    _id: ID!
    platform_id: PlatformId!
    channel_id: ID!
    organization: String!
    title: String!
    time: Time
    status: VideoStatus!
    viewers: Float
  }
  type Time {
    published: Float
    scheduled: Float
    start: Float
    end: Float
    duration: Float
  }
  enum PlatformId {
    yt
    bb
    tt
  }
  enum VideoStatus {
    live
    upcoming
    ended
    uploaded
    missing
  }
  extend type Query {
    live(
      organizations: [String]
      platforms: [PlatformId]
    ): [VideoObject]
    @rateLimit(window: "1s", max: 10, message: "You are doing that too often.")
    videos(
      status: [VideoStatus]
      organization: [String]
      platforms: [PlatformId]
      limit: Int
    ): [VideoObject]
    @rateLimit(window: "1s", max: 10, message: "You are doing that too often.")
  }
`;

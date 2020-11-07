import { gql } from 'apollo-server';

export const typeDef = gql`
  type VideosResource {
    items: [VideoObject]!
    next_page_token: String
  }
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
  input SortVideosFields {
    published: Sort
    scheduled: Sort
    start: Sort
    duration: Sort
  }
  extend type Query {
    live(
      organizations: [String]
      platforms: [PlatformId]
    ): [VideoObject]!
    @rateLimit(window: "1s", max: 10, message: "You are doing that too often.")
    videos(
      channel_id: [ID]
      status: [VideoStatus]
      organizations: [String]
      platforms: [PlatformId]
      max_upcoming_mins: Int = 0
      order_by: SortVideosFields = { published: asc }
      next_page_token: String
      limit: Int = 25
    ): VideosResource!
    @rateLimit(window: "1s", max: 10, message: "You are doing that too often.")
  }
`;

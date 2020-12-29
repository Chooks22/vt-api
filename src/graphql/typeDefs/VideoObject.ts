import { gql } from 'apollo-server';

export const typeDef = gql`
  type PageInfo {
    total_results: Int!
    results_per_page: Int!
  }
  type VideosResource {
    items: [VideoObject]!
    next_page_token: String
    page_info: PageInfo!
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
    published: DateTime
    scheduled: DateTime
    start: DateTime
    end: DateTime
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
      exclude_organizations: [String]
      platforms: [PlatformId]
    ): [VideoObject]!
    @rateLimit(window: "1s", max: 10, message: "You are doing that too often.")
    videos(
      channel_id: [ID]
      status: [VideoStatus]
      title: String
      organizations: [String]
      exclude_organizations: [String]
      platforms: [PlatformId]
      max_upcoming_mins: Int = 0
      order_by: SortVideosFields = { published: desc }
      page_token: String
      limit: Int = 25
    ): VideosResource!
    @rateLimit(window: "1s", max: 10, message: "You are doing that too often.")
  }
`;

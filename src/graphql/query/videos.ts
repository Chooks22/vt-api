import { UserInputError, ApolloError } from 'apollo-server';
import { Videos } from '../../modules';

export async function videos(_, video) {
  try {
    const LIMIT = +video.limit || 50;
    if (LIMIT < 0 || LIMIT > 100) {
      return new UserInputError('limit must be between 1-100 inclusive.');
    }
    return Videos.find({
      status: video.status
        ? { $in: video.status }
        : { $nin: ['uploaded', 'missing'] },
      organization: video.organization
        ? { $in: video.organization }
        : { $nin: [] }
    }).sort({ 'time.published': 1 })
      .limit(LIMIT);
  } catch(err) {
    throw new ApolloError(err);
  }
}

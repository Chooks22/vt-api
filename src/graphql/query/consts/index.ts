export const getCacheKey = (query: string) => `${query}:${process.env.CACHE_MINUTE}`.replace(/ |\n/g, '');
export const parseOrganization = (organizations: string[]) => organizations.sort().map(org => org.toLowerCase());
export const cutChannelIds = (idList: string[]) => idList.map(id => id.slice(0, 3) + id.slice(-3));
export const cutGroupString = (groupList: string[]) => groupList.map(group => group.slice(0, 2) + group.slice(-2));

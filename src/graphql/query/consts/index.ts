export type Sort = 'asc'|'desc';
export const getNextToken = (text: any) => Buffer.from(text.toString()).toString('base64');
export const parseToken = (token: string) => Buffer.from(token, 'base64');
export const getCacheKey = (query: string, invalidate = true) => `${query}:${invalidate ? process.env.CACHE_MINUTE : 0}`.replace(/ |\n/g, '');
export const parseOrganization = (organizations: string[]) => organizations.sort().join('|');
export const cutChannelIds = (idList: string[]) => idList.map(id => id.slice(0, 3) + id.slice(-3));
export const cutGroupString = (groupList: string) => groupList.split('|').map(group => group.slice(0, 2) + group.slice(-2));
export const minsToMs = (mins: number) => mins * 6e4;
export const firstField = (obj: {[key: string]: any;}): [{[key: string]: any;}, string] => {
  const [key, value] = Object.entries(obj)[0];
  return [{ [key]: value }, `${key.slice(0, 2)}-${value[0]}`];
};

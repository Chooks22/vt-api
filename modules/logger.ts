import { debug as Debug } from 'debug';
export default function debug(namespace: string) {
  const logger = Debug(namespace);
  const log = logger.extend('[ LOG ]:');
  log.log = console.log.bind(console);
  const info = logger.extend('[ INFO ]:');
  info.log = console.info.bind(console);
  info.color = log.color;
  const warn = logger.extend('[ WARN ]:');
  warn.log = console.warn.bind(console);
  warn.color = '9';
  const error = logger.extend('[ ERROR ]:');
  error.log = console.error.bind(console);
  error.color = '196';
  return { extend: extend.bind(logger), log, info, warn, error };
}
function extend(this: debug.Debugger, namespace: string) {
  return debug(`${this.namespace}:${namespace}`);
}

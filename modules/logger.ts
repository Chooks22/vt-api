import { debug as Debug } from 'debug';
/* eslint-disable indent,no-multi-spaces */
const LOG_LEVEL = !process.env.LOG_LEVEL     ? 2
                : +process.env.LOG_LEVEL < 0 ? 0
                : +process.env.LOG_LEVEL > 3 ? 3
                : +process.env.LOG_LEVEL;
/* eslint-enable indent,no-multi-spaces */
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
  switch (LOG_LEVEL) {
  case 0: warn.enabled = false;
  case 1: info.enabled = false;
  case 2: log.enabled = false;
  }
  return { extend: extend.bind(logger), log, info, warn, error };
}
function extend(this: debug.Debugger, namespace: string) {
  return debug(`${this.namespace}:${namespace}`);
}

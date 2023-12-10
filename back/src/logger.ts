
import { configure, getLogger } from 'log4js';
import { environment } from './environment';

configure({
	appenders: {
		out: {
			type: 'stdout',
			layout: {
				type: 'pattern', pattern: '%[%d{yyyy-MM-dd hh:mm:ss} %p %f{1}:%l%] %m'
			}
		}
	},
	categories: {
		default: {
			appenders: ['out'],
			level: environment.LOGLEVEL || 'info',
			enableCallStack: true
		}
	}
});

export const logger = getLogger();
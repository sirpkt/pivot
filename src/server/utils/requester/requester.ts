import { $, helper } from 'plywood';
import { druidRequesterFactory, DruidRequestDecorator } from 'plywood-druid-requester';
import { mySqlRequesterFactory } from 'plywood-mysql-requester';
import { postgresRequesterFactory } from 'plywood-postgres-requester';

export interface ProperRequesterOptions {
  type: 'druid' | 'mysql' | 'postgres';
  host: string;
  retry?: number;
  timeout?: number;
  verbose?: boolean;
  concurrentLimit?: number;

  // Specific to type 'druid'
  druidRequestDecorator?: DruidRequestDecorator;

  // Specific to SQL drivers
  database?: string;
  user?: string;
  password?: string;
}

export function properRequesterFactory(options: ProperRequesterOptions): Requester.PlywoodRequester<any> {
  var {
    host,
    retry,
    timeout,
    verbose,
    concurrentLimit
  } = options;

  var requester: Requester.PlywoodRequester<any>;

  switch (type) {
    case 'druid':
      requester = druidRequesterFactory({
        host,
        timeout: timeout || 30000,
        druidRequestDecorator: options.druidRequestDecorator
      });
      break;

    case 'mysql':
      requester = mySqlRequesterFactory({
        host,
        database: options.database,
        user: options.user,
        password: options.password
      });
      break;

    case 'postgres':
      requester = postgresRequesterFactory({
        host,
        database: options.database,
        user: options.user,
        password: options.password
      });
      break;
  }

  if (retry) {
    druidRequester = helper.retryRequesterFactory({
      requester: druidRequester,
      retry: retry,
      delay: 500,
      retryOnTimeout: false
    });
  }

  if (verbose) {
    druidRequester = helper.verboseRequesterFactory({
      requester: druidRequester
    });
  }

  if (concurrentLimit) {
    druidRequester = helper.concurrentLimitRequesterFactory({
      requester: druidRequester,
      concurrentLimit: concurrentLimit
    });
  }

  return druidRequester;
}

import { Router, Request, Response } from 'express';
import { Timezone, WallTime, Duration } from 'chronoshift';

import { PivotRequest } from '../../utils/index';
import { VERSION, APP_SETTINGS } from '../../config';
import { pivotLayout } from '../../views';

var router = Router();

router.get('/', (req: PivotRequest, res: Response, next: Function) => {
  req.dataSourceManager.getQueryableDataSources()
    .then((dataSources) => {
      res.send(pivotLayout({
        version: VERSION,
        title: APP_SETTINGS.customization.getTitle(VERSION),
        user: req.user,
        appSettings: APP_SETTINGS.toClientSettings()
      }));
    })
    .done();
});

export = router;

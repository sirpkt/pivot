import { Router, Request, Response } from 'express';
import { Timezone, WallTime, Duration } from 'chronoshift';

import { PivotRequest } from '../../utils/index';
import { VERSION, SETTINGS_MANAGER } from '../../config';
import { pivotLayout } from '../../views';

var router = Router();

router.get('/', (req: PivotRequest, res: Response, next: Function) => {
  SETTINGS_MANAGER.getSettings()
    .then((appSettings) => {
      res.send(pivotLayout({
        version: VERSION,
        title: appSettings.customization.getTitle(VERSION),
        user: req.user,
        appSettings: appSettings.toClientSettings()
      }));
    })
    .done();
});

export = router;

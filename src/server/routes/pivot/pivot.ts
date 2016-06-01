import { Router, Request, Response } from 'express';
import { Timezone, WallTime, Duration } from 'chronoshift';

import { PivotRequest } from '../../utils/index';
import { VERSION, SETTINGS_MANAGER } from '../../config';
import { pivotLayout } from '../../views';

var router = Router();

router.get('/', (req: PivotRequest, res: Response, next: Function) => {
  SETTINGS_MANAGER.getSettings()
    .then((appSettings) => {
      var clientSettings = appSettings.toClientSettings();
      console.log('clientSettings', clientSettings.clusters[0]);

      res.send(pivotLayout({
        version: VERSION,
        title: appSettings.customization.getTitle(VERSION),
        user: req.user,
        appSettings: clientSettings
      }));
    })
    .done();
});

export = router;

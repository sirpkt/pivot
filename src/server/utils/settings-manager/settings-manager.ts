import * as Q from 'q';
import { External, Dataset } from 'plywood';
import { loadFileSync } from '../file/file';
import { AppSettings, Cluster } from '../../../common/models/index';

export interface SettingsLocation {
  location: 'local';
  readOnly: boolean;
  uri: string;
}

export class ClusterManager {
  public cluster: Cluster;
  public externals: External[] = [];
  public datasets: Dataset[] = [];

  constructor(cluster: SettingsLocation) {
    this.cluster = cluster;
  }
}

export class SettingsManager {
  public settingsLocation: SettingsLocation;
  public initialLoad: Q.Promise<AppSettings>;

  constructor(settingsLocation: SettingsLocation, log: (line: string) => void) {
    this.settingsLocation = settingsLocation;

    this.initialLoad = Q.fcall(() => {
      return AppSettings.fromJS(loadFileSync(settingsLocation.uri, 'yaml'));
    })
  }

  getSettings(): Q.Promise<AppSettings> {

  }

  updateSettings(newSettings: AppSettings): Q.Promise<boolean> {
    if (this.settingsLocation.readOnly) return Q(false);

  }
}

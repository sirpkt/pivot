import * as Q from 'q';
import { External, Dataset } from 'plywood';
import { loadFileSync } from '../file/file';
import { AppSettings, Cluster } from '../../../common/models/index';

export interface SettingsLocation {
  location: 'local';
  readOnly: boolean;
  uri: string;
}

export class LocalFileManager {
  public datasets: Dataset[] = [];
}


// For each external we want to maintain its source and weather it should introspect at all
export interface ManagedExternal {
  external: External;
  discovered?: boolean;
  suppressIntrospection?: boolean;
}

export class ClusterManager {
  public cluster: Cluster;
  public version: string;
  public requester: Requester.PlywoodRequester<any>;
  public managedExternals: ManagedExternal[] = [];

  constructor(cluster: SettingsLocation, initialExternals: ManagedExternal[], onExternalUpdate: (external: External) => void) {
    this.cluster = cluster;
    this.managedExternals = initialExternals;

    var druidRequester: Requester.PlywoodRequester<any> = null;
    if (cluster) {
      var druidRequestDecorator: DruidRequestDecorator = null;
      if (serverSettings.druidRequestDecoratorModule) {
        var logger = (str: string) => console.log(str);
        druidRequestDecorator = serverSettings.druidRequestDecoratorModule.druidRequestDecorator(logger, {
          config
        });
      }

      druidRequester = properRequesterFactory({
        host: cluster.host,
        timeout: cluster.timeout,
        verbose: VERBOSE,
        concurrentLimit: 5,
        
        druidRequestDecorator,

        database: cluster.database,
        user: cluster.user,
        password: cluster.password
      });
    }

    this.requester = druidRequester;
  }

  // Do initialization
  init(): Q.Promise<any> {

  }

  // Refresh the cluster now, will trigger onExternalUpdate and then return an empty promise then done
  refresh(): Q.Promise<any> {

  }
}

export class SettingsManager {
  public settingsLocation: SettingsLocation;
  public initialLoad: Q.Promise<AppSettings>;

  constructor(settingsLocation: SettingsLocation, log: (line: string) => void) {
    this.settingsLocation = settingsLocation;

    this.initialLoad = Q.fcall(() => {
      var appSettings = AppSettings.fromJS(loadFileSync(settingsLocation.uri, 'yaml'));

      // Collect all declared datasets
      // Get each of their externals
      // Make a cluster manager for each cluster and assign the correct initial externals to it.
      // Also make a LocalFileManager for the local files
      // Wait for all the cluster managers and the file manager to do their `init`

      return appSettings;
    })
  }

  getSettings(): Q.Promise<AppSettings> {

  }

  updateSettings(newSettings: AppSettings): Q.Promise<boolean> {
    if (this.settingsLocation.readOnly) return Q(false);

  }
}

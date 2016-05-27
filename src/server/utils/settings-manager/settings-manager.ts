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

function externalFromSource(source: string): External {
  
}


// For each external we want to maintain its source and weather it should introspect at all
export interface ManagedExternal {
  external: External;
  autoDiscovered?: boolean;
  suppressIntrospection?: boolean;
}

export class ClusterManager {
  public cluster: Cluster;
  public version: string;
  public requester: Requester.PlywoodRequester<any>;
  public managedExternals: ManagedExternal[] = [];

  constructor(cluster: SettingsLocation, initialExternals: ManagedExternal[], onExternalUpdate: (external: External) => void) {
    if (!cluster) throw new Error('must have cluster');
    this.cluster = cluster;
    this.managedExternals = initialExternals;

    var clusterType = 'druid'; // ToDo: cluster.type

    var druidRequestDecorator: DruidRequestDecorator = null;
    if (clusterType === 'druid' && serverSettings.druidRequestDecoratorModule) {
      var logger = (str: string) => console.log(str);
      druidRequestDecorator = serverSettings.druidRequestDecoratorModule.druidRequestDecorator(logger, {
        config
      });
    }

    var requester = properRequesterFactory({
      host: cluster.host,
      timeout: cluster.timeout,
      verbose: VERBOSE,
      concurrentLimit: 5,

      druidRequestDecorator,

      database: cluster.database,
      user: cluster.user,
      password: cluster.password
    });
    this.requester = requester;

    for (var managedExternal of this.managedExternals) {
      // ToDo: rewrite when External#attachRequester exists
      var externalValue = managedExternal.external.valueOf();
      externalValue.requester = requester;
      managedExternal.external = External.fromValue(externalValue);
    }
  }

  // Do initialization
  init(): Q.Promise<any> {
    const { cluster } = this;

    var curPromise: Q.Promise<any> = Q(null);

    // Get the version if needed
    if (!this.version) {
      curPromise = curPromise
        .then(() => DruidExternal.getVersion(this.requester))
        .then(
          (version) => {
            this.version = version;
          },
          (e) => {
            throw new Error(`Field to get version from cluster ${this.name} because ${e.message}`);
          }
        )
    }

    // If desired scan for other sources
    if (cluster.sourceListScan) {
      curPromise = curPromise
        .then(DruidExternal.getSourceList(druidRequester))
        .then(
          (sources) => {
             
          },
          (e) => {
            throw new Error(`Field to get version from cluster ${this.name} because ${e.message}`);
          }
        )
    }

    var intialIntorspectionTasks: Q.Promise<any>[] = [];
    for (var managedExternal of this.managedExternals) {

    }

    return curPromise;
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

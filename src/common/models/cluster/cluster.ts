import { Class, Instance, isInstanceOf } from 'immutable-class';

export type SourceListScan = "disable" | "auto";

export interface ClusterValue {
  host?: string;
  version?: string;
  timeout?: number;
  introspectionStrategy?: string;
  sourceListScan?: SourceListScan;
  sourceListRefreshOnLoad?: boolean;
  sourceListRefreshInterval?: number;
  sourceReintrospectOnLoad?: boolean;
  sourceReintrospectInterval?: number;
}

export interface ClusterJS {
  host?: string;
  version?: string;
  timeout?: number;
  introspectionStrategy?: string;
  sourceListScan?: SourceListScan;
  sourceListRefreshOnLoad?: boolean;
  sourceListRefreshInterval?: number;
  sourceReintrospectOnLoad?: boolean;
  sourceReintrospectInterval?: number;
}

function parseIntFromPossibleString(x: any) {
  return typeof x === 'string' ? parseInt(x, 10) : x;
}

var check: Class<ClusterValue, ClusterJS>;
export class Cluster implements Instance<ClusterValue, ClusterJS> {
  static DEFAULT_TIMEOUT = 40000;
  static DEFAULT_INTROSPECTION_STRATEGY = 'segment-metadata-fallback';
  static DEFAULT_SOURCE_LIST_REFRESH_INTERVAL = 15000;

  static isCluster(candidate: any): candidate is Cluster {
    return isInstanceOf(candidate, Cluster);
  }

  static fromJS(parameters: ClusterJS): Cluster {
    var {
      host,
      version,
      timeout,
      introspectionStrategy,
      sourceListScan,
      sourceListRefreshOnLoad,
      sourceListRefreshInterval,
      sourceReintrospectOnLoad,
      sourceReintrospectInterval
    } = parameters;

    // host might be written as druidHost or brokerHost
    host = host || (parameters as any).druidHost || (parameters as any).brokerHost;

    var value: ClusterValue = {
      host,
      version,
      timeout: parseIntFromPossibleString(timeout),
      introspectionStrategy: introspectionStrategy,
      sourceListScan: sourceListScan,
      sourceListRefreshOnLoad: sourceListRefreshOnLoad,
      sourceListRefreshInterval: parseIntFromPossibleString(sourceListRefreshInterval),
      sourceReintrospectOnLoad: sourceReintrospectOnLoad,
      sourceReintrospectInterval: parseIntFromPossibleString(sourceReintrospectInterval)
    };
    return new Cluster(value);
  }


  public host: string;
  public version: string;
  public timeout: number;
  public introspectionStrategy: string;
  public sourceListScan: SourceListScan;
  public sourceListRefreshOnLoad: boolean;
  public sourceListRefreshInterval: number;
  public sourceReintrospectOnLoad: boolean;
  public sourceReintrospectInterval: number;

  constructor(parameters: ClusterValue) {
    var host = parameters.host;
    if (typeof host !== 'string') throw new Error('must have host');
    this.host = host;

    this.version = parameters.version;

    this.timeout = parameters.timeout || Cluster.DEFAULT_TIMEOUT;
    this.introspectionStrategy = parameters.introspectionStrategy || Cluster.DEFAULT_INTROSPECTION_STRATEGY;
    this.sourceListScan = parameters.sourceListScan;

    this.sourceListRefreshOnLoad = parameters.sourceListRefreshOnLoad || false;
    this.sourceListRefreshInterval = parameters.sourceListRefreshInterval || Cluster.DEFAULT_SOURCE_LIST_REFRESH_INTERVAL;
    if (this.sourceListRefreshInterval && this.sourceListRefreshInterval < 1000) {
      throw new Error(`can not set sourceListRefreshInterval to < 1000 (is ${this.sourceListRefreshInterval})`);
    }

    this.sourceReintrospectOnLoad = parameters.sourceReintrospectOnLoad;
    this.sourceReintrospectInterval = parameters.sourceReintrospectInterval;
    if (this.sourceReintrospectInterval && this.sourceReintrospectInterval < 1000) {
      throw new Error(`can not set sourceReintrospectInterval to < 1000 (is ${this.sourceReintrospectInterval})`);
    }
  }

  public valueOf(): ClusterValue {
    return {
      host: this.host,
      version: this.version,
      timeout: this.timeout,
      introspectionStrategy: this.introspectionStrategy,
      sourceListScan: this.sourceListScan,
      sourceListRefreshOnLoad: this.sourceListRefreshOnLoad,
      sourceListRefreshInterval: this.sourceListRefreshInterval,
      sourceReintrospectOnLoad: this.sourceReintrospectOnLoad,
      sourceReintrospectInterval: this.sourceReintrospectInterval
    };
  }

  public toJS(): ClusterJS {
    var js: ClusterJS = {};
    js.host = this.host;
    js.version = this.version;
    js.timeout = this.timeout;
    js.introspectionStrategy = this.introspectionStrategy;
    js.sourceListScan = this.sourceListScan;
    js.sourceListRefreshOnLoad = this.sourceListRefreshOnLoad;
    js.sourceListRefreshInterval = this.sourceListRefreshInterval;
    js.sourceReintrospectOnLoad = this.sourceReintrospectOnLoad;
    js.sourceReintrospectInterval = this.sourceReintrospectInterval;
    return js;
  }

  public toJSON(): ClusterJS {
    return this.toJS();
  }

  public toString(): string {
    return `[Cluster ${this.host}]`;
  }

  public equals(other: Cluster): boolean {
    return Cluster.isCluster(other) &&
      this.host === other.host &&
      this.version === other.version &&
      this.introspectionStrategy === other.introspectionStrategy &&
      this.sourceListScan === other.sourceListScan &&
      this.sourceListRefreshOnLoad === other.sourceListRefreshOnLoad &&
      this.sourceListRefreshInterval === other.sourceListRefreshInterval &&
      this.sourceReintrospectOnLoad === other.sourceReintrospectOnLoad &&
      this.sourceReintrospectInterval === other.sourceReintrospectInterval;
  }

  public toClientCluster(): Cluster {
    // name only
  }

}
check = Cluster;

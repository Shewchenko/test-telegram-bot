/* istanbul ignore file */
// tslint:disable
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { Cache, CachingConfig, Store, WrapArgsType } from 'cache-manager';

export class CacheMock implements Cache {
  store: Store;
  async del(key: string, callback: (error: any) => void): Promise<void>;
  async del(key: string): Promise<any>;
  async del(
    key: string,
    callback?: (error: any) => void,
  ): Promise<void | Promise<any>> {
    return undefined;
  }

  async get<T>(
    key: string,
    callback: (error: any, result: T | undefined) => void,
  ): Promise<void>;
  async get<T>(key: string): Promise<T | undefined>;
  async get(key: string, callback?): Promise<any> {}

  async reset(): Promise<void>;
  async reset(cb: () => void): Promise<void>;
  async reset(cb?: () => void): Promise<Promise<void> | void> {
    return undefined;
  }

  async set<T>(key: string, value: T, options?: CachingConfig): Promise<T>;
  async set<T>(key: string, value: T, ttl: number): Promise<T>;
  async set<T>(
    key: string,
    value: T,
    options: CachingConfig,
    callback: (error: any) => void,
  ): Promise<void>;
  async set<T>(
    key: string,
    value: T,
    ttl: number,
    callback: (error: any) => void,
  ): Promise<void>;
  async set(
    key: string,
    value,
    options?: CachingConfig | number,
    callback?: (error: any) => void,
  ): Promise<any> {}

  wrap<T>(...args: WrapArgsType<T>[]): Promise<T> {
    return Promise.resolve(undefined);
  }
}

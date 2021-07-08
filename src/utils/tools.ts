export class Tools {
  public static parseCbParams<T>(param: string): T {
    return JSON.parse(param);
  }

  public static stringifyCbParams<T>(obj: T): string {
    return JSON.stringify(obj);
  }
}

export class SeederDB {
  public static async seed<
    S extends { repository: { create: (m: I) => any }; save: (m: I) => any },
    I,
  >(service: S, models: I[]) {
    for (const model of models) {
      await service.save(service.repository.create(model));
    }
  }
}

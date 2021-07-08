import { TypeOrmModule } from '@nestjs/typeorm';

import { RegisterEntityMocks } from '../registerEntityMocks';

export class ImportDbMock {
  public static get() {
    return [
      TypeOrmModule.forRoot({
        type: 'sqlite',
        database: ':memory:',
        entities: RegisterEntityMocks.getEntityMocks(),
        synchronize: true,
      }),
      TypeOrmModule.forFeature(RegisterEntityMocks.getEntityMocks()),
    ];
  }
}

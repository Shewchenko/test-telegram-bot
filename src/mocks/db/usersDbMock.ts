import { IUser } from '../../users/contracts/iUser';

export class UsersDbMock {
  public static get(): IUser[] {
    return [
      {
        name: 'user1',
        tgId: 1,
      },
      {
        name: 'user2',
        tgId: 2,
      },
    ] as IUser[];
  }
}

import { hashPassword } from '../auth';
import { UserType } from '../db/schema';

export const userFactory = async (user?: Partial<UserType>): Promise<UserType> => ({
  name: 'Ozzy Osbourne',
  email: 'ozzy@email.com',
  ...user,
  password: await hashPassword(user?.password ?? '123123123'),
});

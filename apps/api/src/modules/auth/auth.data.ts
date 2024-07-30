import { createWorkspace } from '../workspace/workspace.data';
import slugify from 'slugify';
import { generateRandomString } from 'oslo/crypto';
import { createNewNote } from '../workspace/note/note.data';
import { User, UserInsertType, UserSelectType } from '../../db/schema';
import { db } from '../../db';
import { hashPassword } from '../../auth';

export const createSampleWorkspace = async (user: Pick<UserSelectType, 'id' | 'name'>) => {
  const randomId = generateRandomString(6, 'abcdefghijklmnopqrstuvwxyz1234567890');

  const workspace = await createWorkspace({
    name: 'Sample workspace',
    slug: slugify(`${user.name}-${randomId}`, {
      strict: true,
      trim: true,
      lower: true,
      replacement: '-',
    }),
    authorId: user.id,
  });
  await createNewNote({
    name: 'example',
    defaultMarkdownContent: sampleContent,
    workspaceId: workspace.id,
    authorId: user.id,
    access: 'private',
  });
};

export const createNewUser = async (user: UserInsertType) => {
  const resultUsers = await db
    .insert(User)
    .values({
      ...user,
      password: await hashPassword(user.password),
    })
    .returning({ id: User.id, name: User.name });

  return resultUsers[0];
};

export const sampleContent = `
# Getting started with notical.run

### Let's do some math

Peter had ${'`state.peter = 200`'} watermelons.
He gave ${'`state.paul = 102`'} to Paul.
He gave ${'`state.rose = 42`'} to Rose.

How many watermelons does peter have now?
Answer: ${'`state.peter - state.paul - state.rose`'} watermelons.
`;

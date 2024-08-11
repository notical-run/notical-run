import { cleanupData } from '@notical/api/src/utils/test';
import * as userFactory from '@notical/api/src/factory/user';
import * as workspaceFactory from '@notical/api/src/factory/workspace';
import * as noteFactory from '@notical/api/src/factory/note';

export const resetDB = () => cleanupData();

export const factory = {
  ...userFactory,
  ...workspaceFactory,
  ...noteFactory,
};

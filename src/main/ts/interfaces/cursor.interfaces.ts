import { User } from './user.interfaces';

export interface SocketCursor {
  range: Range;
  nodeIndex: number;
  user: User;
  content: string;
}
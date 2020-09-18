import { User } from './user.interfaces';

export interface SocketSelection {
  range: Range;
  startNodeIndex: number;
  endNodeIndex: number;
  user: User;
  startContent: string;
  endContent: string;
}
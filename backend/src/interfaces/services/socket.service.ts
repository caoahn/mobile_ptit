export interface ISocketService {
  init(server: any): void;
  emitToUser(userId: number, event: string, data: any): void;
}

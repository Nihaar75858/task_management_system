import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import type { AppConfig } from '../config/configuration';
import type { JwtPayload } from '../types/jwt-payload.type';

function boardRoom(boardId: string): string {
  return `board:${boardId}`;
}

/**
 * All task mutations (create/update/move/delete/assignee/label changes)
 * broadcast here after they're persisted. Clients join a board's room via
 * "joinBoard" and only receive events for boards they're actually viewing
 * — and only after we've verified they own the underlying project.
 */
@Injectable()
@WebSocketGateway({
  namespace: '/realtime',
  cors: { origin: true, credentials: true },
})
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AppConfig, true>,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(socket: Socket): Promise<void> {
    const token = this.extractToken(socket);
    if (!token) {
      this.logger.warn(`Socket ${socket.id} connected with no token`);
      socket.disconnect(true);
      return;
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get('jwt.accessSecret', { infer: true }),
      });
      socket.data.userId = payload.sub;
    } catch {
      this.logger.warn(`Socket ${socket.id} presented an invalid token`);
      socket.disconnect(true);
    }
  }

  handleDisconnect(socket: Socket): void {
    this.logger.debug(`Socket ${socket.id} disconnected`);
  }

  @SubscribeMessage('joinBoard')
  async joinBoard(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { boardId: string },
  ): Promise<void> {
    const userId = socket.data.userId as string | undefined;
    if (!userId || !data?.boardId) return;

    const board = await this.prisma.board.findFirst({
      where: { id: data.boardId, project: { ownerId: userId } },
      select: { id: true },
    });

    if (!board) {
      // Silently ignore rather than error — avoids confirming/denying a
      // board's existence to a socket that doesn't own it.
      return;
    }

    await socket.join(boardRoom(data.boardId));
  }

  @SubscribeMessage('leaveBoard')
  async leaveBoard(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { boardId: string },
  ): Promise<void> {
    if (!data?.boardId) return;
    await socket.leave(boardRoom(data.boardId));
  }

  emitToBoard(boardId: string, event: string, payload: unknown): void {
    this.server.to(boardRoom(boardId)).emit(event, payload);
  }

  private extractToken(socket: Socket): string | undefined {
    const authToken = socket.handshake.auth?.token as string | undefined;
    if (authToken) return authToken;

    const header = socket.handshake.headers.authorization;
    if (header?.startsWith('Bearer ')) {
      return header.slice('Bearer '.length);
    }

    return undefined;
  }
}

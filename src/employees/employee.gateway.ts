import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EmployeeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('EmployeeGateway');

  handleConnection(client: Socket) {
    const employeeId = client.handshake.query.employeeId;
    const userId = client.handshake.query.userId;

    if (typeof employeeId === 'string' && employeeId) {
      client.join(employeeId);
      this.logger.log(`Client connected: ${client.id} joined room for employee ${employeeId}`);
    } else {
      this.logger.warn(`Client connected without employeeId: ${client.id}`);
    }

    if (typeof userId === 'string' && userId) {
      client.join(userId);
      this.logger.log(`Client connected: ${client.id} joined room for user ${userId}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  broadcastAppAssigned(data: { applicationId: string; employeeId: string; employeeName: string }) {
    this.server.to(data.employeeId).emit('appAssigned', data);
  }

  broadcastStatusChanged(data: {
    applicationId: string;
    index: string;
    newStatus: string;
    changedBy: string;
    timestamp: Date;
    employeeId: string;
  }) {
    this.server.to(data.employeeId).emit('statusChanged', data);
  }

  broadcastUserStatusChanged(data: {
    applicationId: string;
    index: string;
    newStatus: string;
    changedBy: string;
    timestamp: Date;
    userId: string;
  }) {
    this.server.to(data.userId).emit('statusChanged', data);
  }

  broadcastNewApplication(data: {
    applicationId: string;
    index: string;
    issue: string;
    createdAt: Date;
  }) {
    this.server.emit('newApplication', data);
  }
}

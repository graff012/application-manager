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

    if (typeof employeeId === 'string' && employeeId) {
      client.join(employeeId);
      this.logger.log(`Client connected: ${client.id} joined room for employee ${employeeId}`);
    } else {
      this.logger.warn(`Client connected without employeeId: ${client.id}`);
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
    newStatus: string;
    changedBy: string;
    timestamp: Date;
    employeeId: string;
  }) {
    this.server.to(data.employeeId).emit('statusChanged', data);
  }
}

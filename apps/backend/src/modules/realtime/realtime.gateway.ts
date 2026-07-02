import { Injectable } from '@nestjs/common';

// Preparado para @nestjs/websockets en una fase posterior.
@Injectable()
export class RealtimeGateway {
  readonly events = ['stock.low', 'order.ready', 'cash.closed', 'sale.created', 'notification.created'];
}

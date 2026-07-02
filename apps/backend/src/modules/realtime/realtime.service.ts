import { Injectable } from '@nestjs/common';

export type RealtimeEvent = 'stock.low' | 'order.ready' | 'cash.closed' | 'sale.created' | 'notification.created';

@Injectable()
export class RealtimeService {
  emit(event: RealtimeEvent, payload: Record<string, unknown>) {
    return { event, payload, mode: 'prepared' };
  }
}

import {
  Publisher,
  OrderCancelledEvent,
  Subjects,
} from '@bandziortickets/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}

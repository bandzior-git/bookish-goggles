import {
  Subjects,
  Publisher,
  PaymentCreatedEvent,
} from '@bandziortickets/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}

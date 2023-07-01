import { CustomError } from './custom-error';

export class DatabaseConnectionError extends CustomError {
  statusCode = 503;
  reason = 'Connecting to DB failed';

  constructor() {
    super('Error connecting to DB!');

    Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
  }

  serializeErrors() {
    return [{ message: this.reason }];
  }
}

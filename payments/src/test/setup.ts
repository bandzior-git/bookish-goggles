import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../app';
import jwt from 'jsonwebtoken';

declare global {
  var signup: (id?: string) => string[];
}

jest.mock('../nats-wrapper');

process.env.STRIPE_KEY =
  'sk_test_51OAtOvBwhRBntPf1WyNhzUQoWWzOs5fVaDV2fPIArnXvB7MQwa0G99nn1NU5ClWtAxb7JxvChIek96bysar8AHm000z67WMWGg';

let mongo: any;
beforeAll(async () => {
  process.env.JWT_KEY = 'asdfasdf';
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany();
  }
});

afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});

global.signup = (id?: string) => {
  //build JWT payload
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: 'test@test.com',
  };
  //Create JWT
  const token = jwt.sign(payload, process.env.JWT_KEY!);
  //Build session Object { jwt: MY_JWT}
  const session = { jwt: token };
  // Turn session object into JSON
  const sessionJSON = JSON.stringify(session);
  // Take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString('base64');

  // Return cockie with encoded data
  return [`session=${base64}`];
};

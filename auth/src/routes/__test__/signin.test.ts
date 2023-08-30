import request from 'supertest';
import { app } from '../../app';

it('fails when non-existing email is supplied', async () => {
  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'testung@test.com',
      password: 'password',
    })
    .expect(400);
});

it('fails when incorrect pass is supplied', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201);

  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: 'passw0rd',
    })
    .expect(400);
});

it('responds with a cockie on successful signin', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201);

  const response = await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(200);

  expect(response.get('Set-Cookie')).toBeDefined();
});

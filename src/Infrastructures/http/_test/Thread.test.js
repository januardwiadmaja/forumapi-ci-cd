import request from 'supertest';
import pool from '../../database/postgres/pool.js';
import ServerTestHelper from '../../../../tests/ServerTestHelper.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import AuthenticationsTableTestHelper from '../../../../tests/AuthenticationsTableTestHelper.js';
import container from '../../container.js';
import createServer from '../createServer.js';
// import AuthenticationTokenManager from '../../../Applications/security/AuthenticationTokenManager.js';

describe('/threads endpoint', () => {
  let server;
  let serverTestHelper;

  beforeAll(async () => {
    server = await createServer(container);
    serverTestHelper = new ServerTestHelper(server);
  });

  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 401 if headers not contain access token', async () => {
      // Arrange
      const requestPayload = {
        title: 'A thread',
        body: 'A long thread',
      };

      // Action
      const response = await request(server)
        .post('/threads')
        .send(requestPayload);

      // Assert
      expect(response.statusCode).toEqual(401);
    });

    it('should response 400 if thread payload not contain needed property', async () => {
      // Arrange
      const requestPayload = { title: 'A thread' };

      const { accessToken } = await serverTestHelper.getAccessTokenAndUserId();

      // Action
      const response = await request(server)
        .post('/threads')
        .set({ Authorization: `Bearer ${accessToken}` })
        .send(requestPayload);

      // Assert
      expect(response.statusCode).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual(
        'tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada',
      );
    });

    it('should response 400 if thread payload wrong data type', async () => {
      // Arrange
      const requestPayload = {
        title: 1234,
        body: 'A long thread',
      };

      const { accessToken } = await serverTestHelper.getAccessTokenAndUserId();

      // Action
      const response = await request(server)
        .post('/threads')
        .set({ Authorization: `Bearer ${accessToken}` })
        .send(requestPayload);

      // Assert
      expect(response.statusCode).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual(
        'tidak dapat membuat thread baru karena tipe data tidak sesuai',
      );
    });

    it('should response 201 and added thread', async () => {
      // Arrange
      const requestPayload = {
        title: 'A thread',
        body: 'A long thread',
      };

      const { accessToken } = await serverTestHelper.getAccessTokenAndUserId();

      // Action
      const response = await request(server)
        .post('/threads')
        .set({ Authorization: `Bearer ${accessToken}` })
        .send(requestPayload);

      // Assert
      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.addedThread).toBeDefined();
      expect(response.body.data.addedThread.title).toEqual(
        requestPayload.title,
      );
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 200 and thread detail', async () => {
      // Arrange
      const thread = {
        id: 'thread-123',
        title: 'A New Thread',
        body: 'Thread body',
        date: new Date().toISOString(),
      };

      // add user
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      // add thread
      await ThreadsTableTestHelper.addThread({ ...thread, owner: 'user-123' });

      // Action
      const response = await request(server).get(`/threads/${thread.id}`);

      // Assert
      expect(response.statusCode).toEqual(200);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.thread).toBeTruthy();
      expect(response.body.data.thread.id).toStrictEqual(thread.id);
      expect(response.body.data.thread.title).toStrictEqual(thread.title);
      expect(response.body.data.thread.body).toStrictEqual(thread.body);
    });

    it('should response 404 if thread is not exist', async () => {
      // Action
      const response = await request(server).get('/threads/thread-789');

      // Assert
      expect(response.statusCode).toEqual(404);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('thread tidak ditemukan');
    });
  });
});

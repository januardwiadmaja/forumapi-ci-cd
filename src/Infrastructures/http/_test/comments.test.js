import request from 'supertest';
import pool from '../../database/postgres/pool.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import AuthenticationsTableTestHelper from '../../../../tests/AuthenticationsTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import ServerTestHelper from '../../../../tests/ServerTestHelper.js';
import container from '../../container.js';
import createServer from '../createServer.js';

describe('threads comments endpoint', () => {
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
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  const dummyThread = {
    id: 'thread-123',
    title: 'A New Thread',
    body: 'Thread body',
    date: new Date().toISOString(),
  };

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 401 if headers not contain access token', async () => {
      // Arrange
      const requestPayload = { content: 'A comment' };

      const { userId } = await serverTestHelper.getAccessTokenAndUserId();

      // add thread
      await ThreadsTableTestHelper.addThread({ ...dummyThread, owner: userId });

      // Action
      const response = await request(server)
        .post(`/threads/${dummyThread.id}/comments`)
        .send(requestPayload);

      // Assert
      expect(response.statusCode).toEqual(401);
    });

    it('should response 404 if thread is not exist', async () => {
      // Arrange
      const requestPayload = { content: 'A comment' };

      const { accessToken } = await serverTestHelper.getAccessTokenAndUserId();

      // Action
      const response = await request(server)
        .post('/threads/thread-567/comments')
        .send(requestPayload)
        .set({ Authorization: `Bearer ${accessToken}` });

      // Assert
      expect(response.statusCode).toEqual(404);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('thread tidak ditemukan');
    });

    it('should response 400 if payload wrong data type', async () => {
      // Arrange
      const requestPayload = { content: 1234 };

      const { accessToken, userId } =
        await serverTestHelper.getAccessTokenAndUserId();

      // add thread
      await ThreadsTableTestHelper.addThread({ ...dummyThread, owner: userId });

      // Action
      const response = await request(server)
        .post(`/threads/${dummyThread.id}/comments`)
        .send(requestPayload)
        .set({ Authorization: `Bearer ${accessToken}` });

      // Assert
      expect(response.statusCode).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('komentar harus berupa string');
    });

    it('should response 400 if payload not contain needed property', async () => {
      // Arrange
      const { accessToken, userId } =
        await serverTestHelper.getAccessTokenAndUserId();

      // add thread
      await ThreadsTableTestHelper.addThread({ ...dummyThread, owner: userId });

      // Action
      const response = await request(server)
        .post(`/threads/${dummyThread.id}/comments`)
        .send({})
        .set({ Authorization: `Bearer ${accessToken}` });

      // Assert
      expect(response.statusCode).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual(
        'tidak dapat membuat komentar baru karena properti yang dibutuhkan tidak ada',
      );
    });

    it('should response 201 and added comment', async () => {
      // Arrange
      const requestPayload = { content: 'A comment' };

      const { accessToken, userId } =
        await serverTestHelper.getAccessTokenAndUserId();

      // add thread
      await ThreadsTableTestHelper.addThread({ ...dummyThread, owner: userId });
      // Action
      const response = await request(server)
        .post(`/threads/${dummyThread.id}/comments`)
        .send(requestPayload)
        .set({ Authorization: `Bearer ${accessToken}` });

      // Assert
      expect(response.statusCode).toEqual(201);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.addedComment).toBeTruthy();
      expect(response.body.data.addedComment.content).toEqual(
        requestPayload.content,
      );
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    const dummyComment = {
      id: 'comment-123',
      content: 'A comment',
      date: new Date().toISOString(),
      thread: 'thread-123',
      isDelete: false,
    };

    it('should response 200', async () => {
      // Arrange
      const { accessToken, userId } =
        await serverTestHelper.getAccessTokenAndUserId();

      // add thread
      await ThreadsTableTestHelper.addThread({ ...dummyThread, owner: userId });
      // add comment
      await CommentsTableTestHelper.addComment({
        ...dummyComment,
        owner: userId,
      });

      // Action
      const response = await request(server)
        .delete(`/threads/${dummyThread.id}/comments/${dummyComment.id}`)
        .set({ Authorization: `Bearer ${accessToken}` });

      // Assert
      expect(response.statusCode).toEqual(200);
      expect(response.body.status).toEqual('success');
    });

    it('should response 404 if comment is not exist', async () => {
      // Arrange
      const { accessToken, userId } =
        await serverTestHelper.getAccessTokenAndUserId();

      // add thread
      await ThreadsTableTestHelper.addThread({ ...dummyThread, owner: userId });

      // Action
      const response = await request(server)
        .delete(`/threads/${dummyThread.id}/comments/comment-678`)
        .set({ Authorization: `Bearer ${accessToken}` });

      // Assert
      expect(response.statusCode).toEqual(404);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('komentar tidak ditemukan');
    });

    it('should response 404 if comment is not valid or deleted', async () => {
      // Arrange
      const { accessToken, userId } =
        await serverTestHelper.getAccessTokenAndUserId();

      // add thread
      await ThreadsTableTestHelper.addThread({ ...dummyThread, owner: userId });
      // add comment
      await CommentsTableTestHelper.addComment({
        ...dummyComment,
        owner: userId,
      });

      // delete comment
      await request(server)
        .delete(`/threads/${dummyThread.id}/comments/${dummyComment.id}`)
        .set({ Authorization: `Bearer ${accessToken}` });

      // Action
      const response = await request(server)
        .delete(`/threads/${dummyThread.id}/comments/${dummyComment.id}`)
        .set({ Authorization: `Bearer ${accessToken}` });

      // Assert
      expect(response.statusCode).toEqual(404);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('komentar tidak valid');
    });

    it('should response 404 if comment is not exist in thread', async () => {
      // Arrange
      const { accessToken, userId } =
        await serverTestHelper.getAccessTokenAndUserId();

      // add thread
      await ThreadsTableTestHelper.addThread({ ...dummyThread, owner: userId });
      // add comment
      await CommentsTableTestHelper.addComment({
        ...dummyComment,
        owner: userId,
      });

      // add other thread
      await ThreadsTableTestHelper.addThread({
        ...dummyThread,
        id: 'other-thread',
        owner: userId,
      });

      // Action
      const response = await request(server)
        .delete(`/threads/other-thread/comments/${dummyComment.id}`)
        .set({ Authorization: `Bearer ${accessToken}` });

      // Assert
      expect(response.statusCode).toEqual(404);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual(
        'komentar dalam thread tidak ditemukan',
      );
    });

    it('should response 404 if thread is not exist', async () => {
      // Arrange
      const { accessToken } = await serverTestHelper.getAccessTokenAndUserId();

      // Action
      const response = await request(server)
        .delete('/threads/thread-456/comments/comment123')
        .set({ Authorization: `Bearer ${accessToken}` });

      // Assert
      expect(response.statusCode).toEqual(404);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('thread tidak ditemukan');
    });

    it('should response 403 if comment owner is not authorized', async () => {
      // Arrange
      const { userId } = await serverTestHelper.getAccessTokenAndUserId();
      const { accessToken: otherAccessToken } =
        await serverTestHelper.getAccessTokenAndUserId({
          username: 'otheruser',
          password: 'otherpassword',
          fullname: 'Anonymous',
        });

      // add thread
      await ThreadsTableTestHelper.addThread({ ...dummyThread, owner: userId });
      // add comment
      await CommentsTableTestHelper.addComment({
        ...dummyComment,
        owner: userId,
      });

      // Action
      const response = await request(server)
        .delete(`/threads/${dummyThread.id}/comments/${dummyComment.id}`)
        .set({ Authorization: `Bearer ${otherAccessToken}` });

      // Assert
      expect(response.statusCode).toEqual(403);
    });

    it('should response 401 if headers not contain access token', async () => {
      // Arrange
      const { userId } = await serverTestHelper.getAccessTokenAndUserId();

      // add thread
      await ThreadsTableTestHelper.addThread({ ...dummyThread, owner: userId });
      // add comment
      await CommentsTableTestHelper.addComment({
        ...dummyComment,
        owner: userId,
      });

      // Action
      const response = await request(server).delete(
        `/threads/${dummyThread.id}/comments/${dummyComment.id}`,
      );

      // Assert
      expect(response.statusCode).toEqual(401);
    });
  });
});

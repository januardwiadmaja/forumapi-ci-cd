import ThreadDetail from '../ThreadDetail.js';

describe('ThreadDetail entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'A thread',
      body: 'A long thread',
      comments: [],
    };

    // Action & Assert
    expect(() => new ThreadDetail(payload)).toThrowError(
      'THREAD_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload does not meet data type requirements', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'A thread',
      body: 'A long thread',
      date: '2026-04-19T00:00:00.000Z',
      username: 123,
      comments: 'some comments',
    };

    // Action & Assert
    expect(() => new ThreadDetail(payload)).toThrowError(
      'THREAD_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create ThreadDetail entities correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'A thread',
      body: 'A long thread',
      date: '2026-04-19T00:00:00.000Z',
      username: 'dicoding',
      comments: [],
    };

    // Action
    const threadDetail = new ThreadDetail(payload);

    // Assert
    expect(threadDetail).toBeInstanceOf(ThreadDetail);
    expect(threadDetail).toStrictEqual(
      new ThreadDetail({
        id: 'thread-123',
        title: 'A thread',
        body: 'A long thread',
        date: '2026-04-19T00:00:00.000Z',
        username: 'dicoding',
        comments: [],
      }),
    );
  });
});

import AddCommentUseCase from '../AddCommentUseCase.js';
import NewComment from '../../../Domains/comments/entities/NewComment.js';
import AddedComment from '../../../Domains/comments/entities/AddedComment.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import ThreadRepository from '../../../Domains/threads/ThreadRepository';
import { vi } from 'vitest';

describe('AddCommentUseCase', () => {
  it('should orchestrating the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = { content: 'A comment' };

    const mockAddedComment = new AddedComment({
      id: 'comment-123',
      content: 'A comment',
      owner: 'user-123',
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.checkThreadAvailability = vi.fn(() =>
      Promise.resolve(),
    );
    mockCommentRepository.addComment = vi.fn(() =>
      Promise.resolve(mockAddedComment),
    );

    /** creating use case instance */
    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedComment = await addCommentUseCase.execute(
      'user-123',
      'thread-123',
      useCasePayload,
    );

    // Assert
    expect(addedComment).toStrictEqual(
      new AddedComment({
        id: 'comment-123',
        content: 'A comment',
        owner: 'user-123',
      }),
    );

    expect(mockThreadRepository.checkThreadAvailability).toBeCalledWith(
      'thread-123',
    );
    expect(mockCommentRepository.addComment).toBeCalledWith(
      'user-123',
      'thread-123',
      new NewComment({ content: useCasePayload.content }),
    );
  });
});

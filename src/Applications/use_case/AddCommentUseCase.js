import NewComment from '../../Domains/comments/entities/NewComment.js';

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(userId, threadId, useCasePayload) {
    await this._threadRepository.checkThreadAvailability(threadId);
    const newComment = new NewComment(useCasePayload);
    return this._commentRepository.addComment(userId, threadId, newComment);
  }
}

export default AddCommentUseCase;

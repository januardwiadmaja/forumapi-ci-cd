import CommentDetail from '../../Domains/comments/entities/CommentDetail.js';
import ReplyDetail from '../../Domains/replies/entities/ReplyDetail.js';
import ThreadDetail from '../../Domains/threads/entities/ThreadDetail.js';

class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(threadId) {
    const threadDetail = await this._threadRepository.getThreadById(threadId);
    const threadComments =
      await this._commentRepository.getCommentsByThreadId(threadId);
    const threadCommentsReplies =
      await this._replyRepository.getRepliesByThreadId(threadId);

    threadDetail.comments = threadComments.map(
      (comment) =>
        new CommentDetail({
          ...comment,
          replies: comment.is_delete
            ? []
            : threadCommentsReplies
              .filter((reply) => reply.comment === comment.id)
              .map((reply) => new ReplyDetail(reply)),
        }),
    );

    return new ThreadDetail(threadDetail);
  }
}

export default GetThreadDetailUseCase;

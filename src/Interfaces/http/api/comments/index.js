import CommentsHandler from './handler.js';
import createCommentsRouter from './routes.js';

export default (container, authMiddleware) => {
  const commentsHandler = new CommentsHandler(container);
  return createCommentsRouter(commentsHandler, authMiddleware);
};

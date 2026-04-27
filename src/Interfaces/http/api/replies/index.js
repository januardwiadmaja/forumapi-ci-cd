import RepliesHandler from './handler.js';
import createRepliesRouter from './routes.js';

export default (container, authMiddleware) => {
  const repliesHandler = new RepliesHandler(container);
  return createRepliesRouter(repliesHandler, authMiddleware);
};

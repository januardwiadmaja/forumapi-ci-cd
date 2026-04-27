import express from 'express';

const createCommentsRouter = (handler, authMiddleware) => {
  const router = express.Router();

  router.post(
    '/:threadId/comments/:commentId/replies',
    authMiddleware,
    handler.postReplyHandler,
  );

  router.delete(
    '/:threadId/comments/:commentId/replies/:replyId',
    authMiddleware,
    handler.deleteReplyByIdHandler,
  );

  return router;
};

export default createCommentsRouter;

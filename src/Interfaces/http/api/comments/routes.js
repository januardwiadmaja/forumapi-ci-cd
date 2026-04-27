import express from 'express';

const createCommentsRouter = (handler, authMiddleware) => {
  const router = express.Router();

  router.post(
    '/:threadId/comments',
    authMiddleware,
    handler.postCommentHandler,
  );

  router.delete(
    '/:threadId/comments/:commentId',
    authMiddleware,
    handler.deleteCommentByIdHandler,
  );

  return router;
};

export default createCommentsRouter;

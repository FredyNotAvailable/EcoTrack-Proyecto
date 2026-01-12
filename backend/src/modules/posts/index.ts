export * from './posts.types';
export * from './posts.service';
export * from './posts.controller';
import postsRouter, { commentsRouter } from './posts.routes';

export { postsRouter, commentsRouter };

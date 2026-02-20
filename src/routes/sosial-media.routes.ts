import { Hono } from 'hono';
import { SosialMediaController } from '../controllers/sosial-media.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { AppEnv } from '../types';

const sosialMediaController = new SosialMediaController();

export const sosialMediaRoutes = new Hono<{ Bindings: AppEnv['Bindings']; Variables: AppEnv['Variables'] }>();

sosialMediaRoutes.use('*', authMiddleware);

sosialMediaRoutes.get('/', (c) => sosialMediaController.index(c));
sosialMediaRoutes.get('/:id', (c) => sosialMediaController.show(c));
sosialMediaRoutes.post('/', (c) => sosialMediaController.store(c));
sosialMediaRoutes.put('/:id', (c) => sosialMediaController.update(c));
sosialMediaRoutes.delete('/:id', (c) => sosialMediaController.destroy(c));

import { Hono } from 'hono';
import { CollaborationSliderController } from '../controllers/collaboration-slider.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const collaborationSliderController = new CollaborationSliderController();

export const collaborationSliderRoutes = new Hono();

collaborationSliderRoutes.get('/public', (c) => collaborationSliderController.indexPublic(c));

collaborationSliderRoutes.use('*', authMiddleware);

collaborationSliderRoutes.get('/', (c) => collaborationSliderController.index(c));
collaborationSliderRoutes.get('/:id', (c) => collaborationSliderController.show(c));
collaborationSliderRoutes.post('/', (c) => collaborationSliderController.store(c));
collaborationSliderRoutes.put('/:id', (c) => collaborationSliderController.update(c));
collaborationSliderRoutes.delete('/:id', (c) => collaborationSliderController.destroy(c));
collaborationSliderRoutes.patch('/:id/order', (c) => collaborationSliderController.updateOrder(c));
collaborationSliderRoutes.patch('/:id/status', (c) => collaborationSliderController.updateStatus(c));

// backend/src/modules/users/user.routes.ts
import { Router } from 'express';
import { createUserController } from './user.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/authorize.middleware.js';

const router = Router();

router.post('/', authenticate, authorize('ADMIN', 'SUPERVISOR'), createUserController);

export default router;
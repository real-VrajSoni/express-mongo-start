import { Router } from 'express';
import * as controller from './user.controller.js';
import { validateUserBody, validateUserId } from './user.validation.js';

const router = Router();
router.param('id', validateUserId);

router.route('/')
  .get(controller.listUsers)
  .post(validateUserBody(), controller.createUser);

router.route('/:id')
  .get(controller.getUser)
  .patch(validateUserBody({ partial: true }), controller.updateUser)
  .delete(controller.deleteUser);

export default router;

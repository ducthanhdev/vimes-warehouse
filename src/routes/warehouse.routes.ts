import { Router } from 'express';
import { defaultWarehouseController } from '../controllers/warehouse.controller';

const router = Router();

router.get('/', defaultWarehouseController.getWarehouses);
router.get('/:id', defaultWarehouseController.getWarehouseById);

export default router;

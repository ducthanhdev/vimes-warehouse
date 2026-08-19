import { Router } from 'express';
import receiptRoutes from './receipt.routes';
import warehouseRoutes from './warehouse.routes';
import productRoutes from './product.routes';
import pageRoutes from './page.routes';

const router = Router();

router.use('/api/receipts', receiptRoutes);
router.use('/api/warehouses', warehouseRoutes);
router.use('/api/products', productRoutes);
router.use('/', pageRoutes);

export default router;

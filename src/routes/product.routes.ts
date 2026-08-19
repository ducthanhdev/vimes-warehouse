import { Router } from 'express';
import { defaultProductController } from '../controllers/product.controller';

const router = Router();

router.get('/', defaultProductController.getProducts);
router.get('/search', defaultProductController.searchProducts);
router.get('/:id', defaultProductController.getProductById);

export default router;

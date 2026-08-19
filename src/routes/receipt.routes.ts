import { Router } from 'express';
import { validate } from '../middleware/validate';
import {
  createReceiptSchema,
  updateReceiptSchema,
  receiptFilterSchema,
} from '../validators/receipt.validator';
import { defaultReceiptController } from '../controllers/receipt.controller';

const router = Router();

router.post('/amount-to-text', defaultReceiptController.amountToText);
router.get('/', validate(receiptFilterSchema, 'query'), defaultReceiptController.getReceipts);
router.get('/:id', defaultReceiptController.getReceiptById);
router.post('/', validate(createReceiptSchema, 'body'), defaultReceiptController.createReceipt);
router.put('/:id', validate(updateReceiptSchema, 'body'), defaultReceiptController.updateReceipt);
router.delete('/:id', defaultReceiptController.deleteReceipt);
router.patch('/:id/confirm', defaultReceiptController.confirmReceipt);
router.patch('/:id/cancel', defaultReceiptController.cancelReceipt);

export default router;

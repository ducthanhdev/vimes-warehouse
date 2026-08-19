import { Router } from 'express';
import { WarehouseRepository } from '../repositories/warehouse.repository';
import { ReceiptService } from '../services/receipt.service';

const router = Router();
const warehouseRepo = new WarehouseRepository();
const receiptService = new ReceiptService();

router.get('/', async (req, res, next) => {
  try {
    const filter = {
      ...req.query,
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
    };
    const result = await receiptService.getReceipts(filter as any);
    const warehouses = await warehouseRepo.findAll();

    const { page, total_pages } = result.pagination;
    const pagesRange: Array<number | string> = [];
    const delta = 2;

    for (let i = 1; i <= total_pages; i++) {
      if (
        i === 1 ||
        i === total_pages ||
        (i >= page - delta && i <= page + delta)
      ) {
        pagesRange.push(i);
      } else if (
        (i === page - delta - 1 || i === page + delta + 1) &&
        pagesRange[pagesRange.length - 1] !== '...'
      ) {
        pagesRange.push('...');
      }
    }

    res.render('pages/receipt-list', {
      title: 'Danh Sách Phiếu Nhập Kho | VIMES',
      receipts: result.data,
      pagination: result.pagination,
      pagesRange,
      warehouses,
      filter,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/receipts/new', async (req, res, next) => {
  try {
    const warehouses = await warehouseRepo.findAll();
    const today = new Date().toISOString().split('T')[0];
    res.render('pages/receipt-form', {
      title: 'Lập Phiếu Nhập Kho Mới (Mẫu 01-VT) | VIMES',
      receipt: null,
      warehouses,
      isEdit: false,
      today,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/receipts/:id/edit', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const receipt = await receiptService.getReceiptById(id);
    const warehouses = await warehouseRepo.findAll();
    res.render('pages/receipt-form', {
      title: `Sửa Phiếu Nhập Kho ${receipt.receipt_number} | VIMES`,
      receipt,
      warehouses,
      isEdit: true,
      today: typeof receipt.receipt_date === 'string'
        ? receipt.receipt_date
        : new Date(receipt.receipt_date).toISOString().split('T')[0],
    });
  } catch (error) {
    next(error);
  }
});

router.get('/receipts/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const receipt = await receiptService.getReceiptById(id);
    res.render('pages/receipt-detail', {
      title: `Phiếu Nhập Kho ${receipt.receipt_number} (Mẫu 01-VT) | VIMES`,
      receipt,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

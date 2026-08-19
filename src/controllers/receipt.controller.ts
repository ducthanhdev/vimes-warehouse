import { Request, Response, NextFunction } from 'express';
import { ReceiptService } from '../services/receipt.service';
import { ApiResponse } from '../models/types';

export class ReceiptController {
  private service: ReceiptService;

  constructor(service?: ReceiptService) {
    this.service = service || new ReceiptService();
  }

  getReceipts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getReceipts(req.query as any);
      const response: ApiResponse = {
        success: true,
        data: result,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  getReceiptById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const receipt = await this.service.getReceiptById(id);
      const response: ApiResponse = {
        success: true,
        data: receipt,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  createReceipt = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const receipt = await this.service.createReceipt(req.body);
      const response: ApiResponse = {
        success: true,
        message: `Tạo phiếu nhập kho ${receipt.receipt_number} thành công`,
        data: receipt,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  updateReceipt = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const receipt = await this.service.updateReceipt(id, req.body);
      const response: ApiResponse = {
        success: true,
        message: `Cập nhật phiếu ${receipt.receipt_number} thành công`,
        data: receipt,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  deleteReceipt = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      await this.service.deleteReceipt(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  confirmReceipt = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const receipt = await this.service.confirmReceipt(id);
      const response: ApiResponse = {
        success: true,
        message: `Xác nhận phiếu ${receipt.receipt_number} thành công`,
        data: receipt,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  cancelReceipt = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const receipt = await this.service.cancelReceipt(id);
      const response: ApiResponse = {
        success: true,
        message: `Hủy phiếu ${receipt.receipt_number} thành công`,
        data: receipt,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  amountToText = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const amount = Number(req.body.amount || 0);
      const text = this.service.convertAmountToText(amount);
      res.json({ success: true, data: { text } });
    } catch (error) {
      next(error);
    }
  };
}

export const defaultReceiptController = new ReceiptController();

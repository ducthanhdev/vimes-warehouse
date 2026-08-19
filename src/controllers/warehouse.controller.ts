import { Request, Response, NextFunction } from 'express';
import { WarehouseRepository } from '../repositories/warehouse.repository';

export class WarehouseController {
  private repo: WarehouseRepository;

  constructor(repo?: WarehouseRepository) {
    this.repo = repo || new WarehouseRepository();
  }

  getWarehouses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const warehouses = await this.repo.findAll();
      res.json({ success: true, data: warehouses });
    } catch (error) {
      next(error);
    }
  };

  getWarehouseById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const warehouse = await this.repo.findById(id);
      if (!warehouse) {
        res.status(404).json({ success: false, message: 'Kho hàng không tồn tại' });
        return;
      }
      res.json({ success: true, data: warehouse });
    } catch (error) {
      next(error);
    }
  };
}

export const defaultWarehouseController = new WarehouseController();

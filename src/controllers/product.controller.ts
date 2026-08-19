import { Request, Response, NextFunction } from 'express';
import { ProductRepository } from '../repositories/product.repository';

export class ProductController {
  private repo: ProductRepository;

  constructor(repo?: ProductRepository) {
    this.repo = repo || new ProductRepository();
  }

  getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const products = await this.repo.findAll();
      res.json({ success: true, data: products });
    } catch (error) {
      next(error);
    }
  };

  searchProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const keyword = (req.query.q as string) || '';
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const products = await this.repo.search(keyword, limit);
      res.json({ success: true, data: products });
    } catch (error) {
      next(error);
    }
  };

  getProductById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const product = await this.repo.findById(id);
      if (!product) {
        res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
        return;
      }
      res.json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  };
}

export const defaultProductController = new ProductController();

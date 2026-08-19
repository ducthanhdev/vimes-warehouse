import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/errors';
import { ApiResponse } from '../models/types';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (process.env.NODE_ENV !== 'test') {
    console.error('[Error]', err);
  }

  if (err instanceof ValidationError) {
    const response: ApiResponse = {
      success: false,
      message: err.message,
      errors: err.errors,
    };
    res.status(err.statusCode).json(response);
    return;
  }

  if (err instanceof AppError) {
    const response: ApiResponse = {
      success: false,
      message: err.message,
    };
    res.status(err.statusCode).json(response);
    return;
  }

  if ((err as any).code === '23505') {
    const response: ApiResponse = {
      success: false,
      message: 'Dữ liệu đã tồn tại (trùng lặp khóa duy nhất)',
    };
    res.status(409).json(response);
    return;
  }

  if ((err as any).code === '23503') {
    const response: ApiResponse = {
      success: false,
      message: 'Dữ liệu tham chiếu không tồn tại trong hệ thống',
    };
    res.status(400).json(response);
    return;
  }

  const response: ApiResponse = {
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Đã xảy ra lỗi máy chủ nội bộ'
      : err.message || 'Lỗi hệ thống',
  };
  res.status(500).json(response);
}

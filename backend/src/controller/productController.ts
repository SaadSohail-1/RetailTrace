import type { Request, Response, NextFunction } from 'express';
import { productService } from '../services/product.js';

export class ProductController {
    async validateApiKey(req: Request, res: Response): Promise<boolean> {
        // Extract API key from headers, query params, or body arguments
        const apiKey = (req.headers['x-api-key'] || req.query.apiKey || req.body?.apiKey) as string | undefined;
        const keyIdentifier = (req.headers['x-client-id'] || req.query.clientId) as string | undefined;

        if (!apiKey) {
        res.status(401).json({
            success: false,
            message: 'Unauthorized: API key is required.',
        });
        return false;
        }

        const isValid = await productService.verifyApiKey(apiKey, keyIdentifier);

        if (!isValid) {
        res.status(403).json({
            success: false,
            message: 'Forbidden: Invalid API key.',
        });
        return false;
        }

        return true;
  }

  /**
   * Handles HTTP POST request to create a new product
   */
  async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload = req.body;

      // Validate that the request body is present and is a non-empty object
      if (!payload || typeof payload !== 'object' || Array.isArray(payload) || Object.keys(payload).length === 0) {
        res.status(400).json({
          success: false,
          message: 'Request body must be a non-empty object.',
        });
        return;
      }

      // Call service layer to insert into database
      const newProduct = await productService.createProduct(payload);

      // Return 201 Created with the inserted document
      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: newProduct,
      });
    } catch (error) {
      // Pass error to express error handling middleware
      next(error);
    }
  }


}

export const productController = new ProductController();
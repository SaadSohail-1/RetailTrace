import { Router, type Request, type Response, type NextFunction } from 'express';
import { productController } from '../controller/productController.js';

const router = Router();

/**
 * Middleware to enforce API Key validation before hitting route handlers
 */
const requireApiKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const isAuthorized = await productController.validateApiKey(req, res);
    if (isAuthorized) {
      next();
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/products
 * @desc    Create a new product with dynamic body payload
 * @access  Protected (API Key required)
 */
router.post('/products', requireApiKey, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Create product in MongoDB via Controller/Service
    await productController.createProduct(req, res, next);

    // ================================================================
    // TODO: CONNECT BLOCKCHAIN HERE
    // - Mint NFT / Record transaction hash on-chain
    // - Service reference: await blockchainService.recordProduct(newProduct)
    // ================================================================

  } catch (error) {
    next(error);
  }
});

export default router;
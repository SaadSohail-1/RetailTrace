import { Collection, Document, InsertOneResult, ObjectId } from 'mongodb';
import { getDb } from '../config/db'; // Assuming a database connection helper
import crypto from 'crypto';


export class ProductService {
  private collectionName = 'products';
  private apiKeyCollectionName = 'api_keys';

  /**
   * Helper to get the products collection reference
   */
  private getCollection(): Collection<Document> {
    const db = getDb();
    return db.collection(this.collectionName);
  }

  /**
   * Verifies if a given API key is valid
   * @param rawApiKey The raw API key to verify
   * @param keyIdentifier Optional identifier for the API key
   * @returns A promise resolving to true if the key is valid, false otherwise
   */
  async verifyApiKey(rawApiKey: string, keyIdentifier?: string): Promise<boolean> {
    const collection = this.getCollection(this.apiKeyCollectionName);

    // Hash the incoming key (assuming SHA-256 hashing format)
    const hashedIncomingKey = crypto.createHash('sha256').update(rawApiKey).digest('hex');

    // Query criteria: either match exact keyIdentifier or search by hash
    const query = keyIdentifier
      ? { keyIdentifier }
      : { apiKeyHash: hashedIncomingKey };

    const keyRecord = await collection.findOne(query);

    if (!keyRecord) {
      return false;
    }

    // Direct hash comparison or constant-time comparison for security
    if (keyRecord.apiKeyHash) {
      const storedBuffer = Buffer.from(keyRecord.apiKeyHash, 'hex');
      const incomingBuffer = Buffer.from(hashedIncomingKey, 'hex');

      if (storedBuffer.length !== incomingBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(storedBuffer, incomingBuffer);
    }

    return false;
  }

  /**
   * Creates a new product with a dynamic payload
   * @param payload Dynamic object representing the product body
   * @returns The created document with its generated _id
   */
  async createProduct(payload: Record<string, any>): Promise<Document> {
    const collection = this.getCollection();

    // Attach automatic timestamps if not provided in dynamic payload
    const documentToInsert = {
      ...payload,
      createdAt: payload.createdAt ?? new Date(),
      updatedAt: payload.updatedAt ?? new Date(),
    };

    const result: InsertOneResult<Document> = await collection.insertOne(documentToInsert);

    // Fetch and return the newly inserted document
    const createdDocument = await collection.findOne({ _id: result.insertedId });

    if (!createdDocument) {
      throw new Error('Failed to retrieve product after insertion');
    }

    return createdDocument;
  }
}

export const productService = new ProductService();
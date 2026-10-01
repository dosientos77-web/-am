import { Product, IProduct } from '../models/Product';
import { Category } from '../models/Category';
import { ApiError } from '../utils/ApiError';

export interface CreateProductInput {
  restaurant: string;
  category: string;
  name: string;
  description?: string;
  image?: string;
  price: number;
}

export class ProductService {
  async create(input: CreateProductInput): Promise<IProduct> {
    // Verify category exists and belongs to restaurant
    const category = await Category.findOne({ _id: input.category, restaurant: input.restaurant });
    if (!category) throw new ApiError(400, 'Invalid category for this restaurant');

    const product = await Product.create({
      restaurant: input.restaurant,
      category: input.category,
      name: input.name,
      description: input.description || '',
      image: input.image || '',
      price: input.price,
      available: true,
    });
    return product;
  }

  async findAll(filters: { restaurant?: string; category?: string; available?: boolean } = {}): Promise<IProduct[]> {
    const query: Record<string, unknown> = {};
    if (filters.restaurant) query.restaurant = filters.restaurant;
    if (filters.category) query.category = filters.category;
    if (filters.available !== undefined) query.available = filters.available;

    return Product.find(query).populate('category', 'name').sort({ name: 1 });
  }

  async findById(id: string): Promise<IProduct> {
    const product = await Product.findById(id).populate('category', 'name');
    if (!product) throw new ApiError(404, 'Product not found');
    return product;
  }

  async update(id: string, data: Partial<CreateProductInput>): Promise<IProduct> {
    const product = await Product.findById(id);
    if (!product) throw new ApiError(404, 'Product not found');

    const allowedUpdates = ['name', 'description', 'image', 'price', 'category', 'available'];
    for (const key of allowedUpdates) {
      if (key in data) {
        (product as unknown as Record<string, unknown>)[key] = data[key as keyof CreateProductInput];
      }
    }

    await product.save();
    return product;
  }

  async delete(id: string): Promise<void> {
    const product = await Product.findById(id);
    if (!product) throw new ApiError(404, 'Product not found');
    await product.deleteOne();
  }
}

export const productService = new ProductService();

import { Category, ICategory } from '../models/Category';
import { ApiError } from '../utils/ApiError';

export interface CreateCategoryInput {
  name: string;
  description?: string;
  restaurant: string;
}

export class CategoryService {
  async create(input: CreateCategoryInput): Promise<ICategory> {
    const category = await Category.create({
      name: input.name,
      description: input.description || '',
      restaurant: input.restaurant,
    });
    return category;
  }

  async findByRestaurant(restaurantId: string): Promise<ICategory[]> {
    return Category.find({ restaurant: restaurantId }).sort({ name: 1 });
  }

  async findById(id: string): Promise<ICategory> {
    const category = await Category.findById(id);
    if (!category) throw new ApiError(404, 'Category not found');
    return category;
  }

  async update(id: string, data: Partial<CreateCategoryInput>): Promise<ICategory> {
    const category = await Category.findById(id);
    if (!category) throw new ApiError(404, 'Category not found');

    if (data.name) category.name = data.name;
    if (data.description !== undefined) category.description = data.description;

    await category.save();
    return category;
  }

  async delete(id: string): Promise<void> {
    const category = await Category.findById(id);
    if (!category) throw new ApiError(404, 'Category not found');
    await category.deleteOne();
  }
}

export const categoryService = new CategoryService();

import { Restaurant, IRestaurant } from '../models/Restaurant';
import { User } from '../models/User';
import { ApiError } from '../utils/ApiError';
import { RestaurantStatus, UserRole } from '../types';

export interface CreateRestaurantInput {
  name: string;
  description?: string;
  logo?: string;
  category: string;
  openingHours?: string;
  location?: string;
  phone?: string;
  ownerId: string;
}

export class RestaurantService {
  async create(input: CreateRestaurantInput): Promise<IRestaurant> {
    const owner = await User.findById(input.ownerId);
    if (!owner) {
      throw new ApiError(404, 'Owner not found');
    }

    const restaurant = await Restaurant.create({
      name: input.name,
      description: input.description || '',
      logo: input.logo || '',
      category: input.category,
      owner: input.ownerId,
      openingHours: input.openingHours || '',
      location: input.location || '',
      phone: input.phone || '',
      status: RestaurantStatus.PENDING_APPROVAL,
    });

    return restaurant;
  }

  async findAll(filters: { status?: RestaurantStatus; owner?: string } = {}): Promise<IRestaurant[]> {
    const query: Record<string, unknown> = {};
    if (filters.status) query.status = filters.status;
    if (filters.owner) query.owner = filters.owner;

    return Restaurant.find(query).sort({ createdAt: -1 });
  }

  async findById(id: string): Promise<IRestaurant> {
    const restaurant = await Restaurant.findById(id).populate('owner', 'name email');
    if (!restaurant) {
      throw new ApiError(404, 'Restaurant not found');
    }
    return restaurant;
  }

  async update(id: string, data: Partial<CreateRestaurantInput>, requesterId: string, requesterRole: UserRole): Promise<IRestaurant> {
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      throw new ApiError(404, 'Restaurant not found');
    }

    // Only owner or admin can update
    if (requesterRole !== UserRole.ADMIN && restaurant.owner.toString() !== requesterId) {
      throw new ApiError(403, 'Not authorized to update this restaurant');
    }

    const allowedUpdates = ['name', 'description', 'logo', 'category', 'openingHours', 'location', 'phone'];
    for (const key of allowedUpdates) {
      if (key in data) {
        (restaurant as unknown as Record<string, unknown>)[key] = data[key as keyof CreateRestaurantInput];
      }
    }

    await restaurant.save();
    return restaurant;
  }

  async approve(id: string): Promise<IRestaurant> {
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      throw new ApiError(404, 'Restaurant not found');
    }

    if (restaurant.status !== RestaurantStatus.PENDING_APPROVAL) {
      throw new ApiError(400, `Cannot approve restaurant with status ${restaurant.status}`);
    }

    restaurant.status = RestaurantStatus.ACTIVE;
    await restaurant.save();
    return restaurant;
  }

  async suspend(id: string): Promise<IRestaurant> {
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      throw new ApiError(404, 'Restaurant not found');
    }

    restaurant.status = RestaurantStatus.SUSPENDED;
    await restaurant.save();
    return restaurant;
  }

  async activate(id: string): Promise<IRestaurant> {
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      throw new ApiError(404, 'Restaurant not found');
    }

    restaurant.status = RestaurantStatus.ACTIVE;
    await restaurant.save();
    return restaurant;
  }
}

export const restaurantService = new RestaurantService();


import { Injectable } from '@nestjs/common';
import { MOCK_PRODUCTS, Product } from './products.mock';

@Injectable()
export class ProductsService {
  findAll(): Product[] {
    return MOCK_PRODUCTS;
  }

  findOne(id: number): Product | undefined {
    return MOCK_PRODUCTS.find(
      (product) => product.id === id,
    );
  }
}

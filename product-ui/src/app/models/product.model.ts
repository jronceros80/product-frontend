export interface Product {
    id?: number;
    name: string;
    price: number;
    category: ProductCategory;
    status: ProductStatus;
}

export interface CreateProductRequest {
    name: string;
    price: number;
    category: ProductCategory;
}

export interface UpdateProductRequest {
    name: string;
    price: number;
    category: ProductCategory;
    status: ProductStatus;
}

export enum ProductCategory {
    ELECTRONICS = 'Electronics',
    CLOTHING = 'Clothing',
    BOOKS = 'Books'
}

// Helper functions for category formatting
export const formatCategoryForDisplay = (category: ProductCategory): string => {
    return category.toUpperCase();
};

export const formatCategoryForApi = (category: string): ProductCategory => {
    // Convert from UI format (ELECTRONICS) to API format (Electronics)
    return ProductCategory[category as keyof typeof ProductCategory];
};

export enum ProductStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE'
}

export interface ProductFilters {
    name?: string;
    category?: ProductCategory | 'ALL';
    status?: ProductStatus | 'ALL';
}

export interface ProductListResponse {
    products: Product[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
} 
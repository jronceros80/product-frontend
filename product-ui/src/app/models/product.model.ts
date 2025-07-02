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

export const formatCategoryForDisplay = (category: ProductCategory): string => {
    return category.toUpperCase();
};

export const formatCategoryForApi = (category: string): ProductCategory => {
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
    limit?: number;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
}

export interface ProductListResponse {
    content: Product[];
    nextCursor?: string;
    previousCursor?: string;
    hasNext: boolean;
    hasPrevious: boolean;
    size: number;
    limit: number;
    pageInfo: {
        size: number;
        limit: number;
        hasNext: boolean;
        hasPrevious: boolean;
        nextCursor?: string;
        previousCursor?: string;
    };
}

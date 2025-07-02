export interface ApiProductResponse {
    id: number;
    name: string;
    price: number;
    category: string;
    active: boolean;
}

export interface ApiResponse {
    content: ApiProductResponse[];
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
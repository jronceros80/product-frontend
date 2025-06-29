export interface ApiProductResponse {
    id: number;
    name: string;
    price: number;
    category: string;
    active: boolean;
}

export interface ApiResponse {
    _embedded: {
        productResponseDTOList: ApiProductResponse[];
    };
    page: {
        totalElements: number;
        totalPages: number;
        number: number;
        size: number;
    };
} 
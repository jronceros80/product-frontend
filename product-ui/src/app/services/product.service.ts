import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
    Product,
    CreateProductRequest,
    UpdateProductRequest,
    ProductFilters,
    ProductListResponse,
    ProductStatus,
    ProductCategory
} from '../models/product.model';
import { ApiProductResponse, ApiResponse } from '../models/response.model';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private apiUrl = `${environment.apiUrl}/products`;

    constructor(private http: HttpClient) { }

    private mapProduct(apiProduct: ApiProductResponse): Product {
        return {
            id: apiProduct.id,
            name: apiProduct.name,
            price: apiProduct.price,
            category: apiProduct.category as ProductCategory,
            status: apiProduct.active ? ProductStatus.ACTIVE : ProductStatus.INACTIVE
        };
    }

    getProducts(
        filters: ProductFilters = {},
        cursor?: string,
        limit: number = 10
    ): Observable<ProductListResponse> {
        let params = new HttpParams()
            .set('limit', limit.toString());

        if (cursor) {
            params = params.set('cursor', cursor);
        }

        const sortBy = filters.sortBy || 'id';
        const sortDir = filters.sortDir || 'asc';
        params = params.set('sortBy', sortBy).set('sortDir', sortDir);

        if (filters.name && filters.name.trim()) {
            params = params.set('name', filters.name.trim());
        }

        if (filters.category && filters.category !== 'ALL') {
            const categoryForBackend = filters.category.toUpperCase();
            params = params.set('category', categoryForBackend);
        }

        if (filters.status && filters.status !== 'ALL') {
            const isActive = filters.status === ProductStatus.ACTIVE;
            params = params.set('active', isActive.toString());
        }

        return this.http.get<ApiResponse>(this.apiUrl, { params })
            .pipe(
                map(response => {
                    return {
                        content: response.content?.map(p => this.mapProduct(p)) || [],
                        nextCursor: response.nextCursor,
                        previousCursor: response.previousCursor,
                        hasNext: response.hasNext || false,
                        hasPrevious: response.hasPrevious || false,
                        size: response.size || 0,
                        limit: response.limit || limit,
                        pageInfo: response.pageInfo || {
                            size: response.size || 0,
                            limit: response.limit || limit,
                            hasNext: response.hasNext || false,
                            hasPrevious: response.hasPrevious || false,
                            nextCursor: response.nextCursor,
                            previousCursor: response.previousCursor
                        }
                    };
                }),
                catchError(error => {
                    console.error('Error fetching products:', error);
                    return of({
                        content: [],
                        hasNext: false,
                        hasPrevious: false,
                        size: 0,
                        limit: limit,
                        pageInfo: {
                            size: 0,
                            limit: limit,
                            hasNext: false,
                            hasPrevious: false
                        }
                    });
                })
            );
    }

    getProductById(id: number): Observable<Product> {
        return this.http.get<ApiProductResponse>(`${this.apiUrl}/${id}`)
            .pipe(
                map(response => this.mapProduct(response)),
                catchError(error => {
                    console.error('Error fetching product:', error);
                    throw error;
                })
            );
    }

    createProduct(product: CreateProductRequest): Observable<Product> {
        return this.http.post<ApiProductResponse>(this.apiUrl, product)
            .pipe(
                map(response => this.mapProduct(response))
            );
    }

    updateProduct(id: number, product: UpdateProductRequest): Observable<Product> {
        return this.http.put<ApiProductResponse>(`${this.apiUrl}/${id}`, product)
            .pipe(
                map(response => this.mapProduct(response))
            );
    }

    deleteProduct(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    toggleProductStatus(id: number): Observable<Product> {
        return this.http.patch<ApiProductResponse>(`${this.apiUrl}/${id}/toggle-status`, {})
            .pipe(
                map(response => this.mapProduct(response))
            );
    }
}

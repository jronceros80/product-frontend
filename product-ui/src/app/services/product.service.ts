import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import {
    Product,
    CreateProductRequest,
    UpdateProductRequest,
    ProductFilters,
    ProductListResponse,
    ProductStatus
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
            category: apiProduct.category as any,
            status: apiProduct.active ? ProductStatus.ACTIVE : ProductStatus.INACTIVE
        };
    }

    getProducts(
        filters: ProductFilters = {},
        page: number = 0,
        size: number = 10
    ): Observable<ProductListResponse> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        if (filters.name && filters.name.trim()) {
            params = params.set('name', filters.name.trim());
        }

        if (filters.category && filters.category !== 'ALL') {
            params = params.set('category', filters.category);
        }

        if (filters.status && filters.status !== 'ALL') {
            const isActive = filters.status === ProductStatus.ACTIVE;
            params = params.set('active', isActive.toString());
        }

        return this.http.get<ApiResponse>(this.apiUrl, { params })
            .pipe(
                map(response => ({
                    products: response._embedded?.productResponseDTOList.map(p => this.mapProduct(p)) || [],
                    totalElements: response.page?.totalElements || 0,
                    totalPages: response.page?.totalPages || 0,
                    currentPage: response.page?.number || page,
                    pageSize: response.page?.size || size
                })),
                catchError(error => {
                    console.error('Error fetching products:', error);
                    return of({
                        products: [],
                        totalElements: 0,
                        totalPages: 0,
                        currentPage: page,
                        pageSize: size
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
            .pipe(map(response => this.mapProduct(response)));
    }

    updateProduct(id: number, product: UpdateProductRequest): Observable<Product> {
        return this.http.put<ApiProductResponse>(`${this.apiUrl}/${id}`, product)
            .pipe(map(response => this.mapProduct(response)));
    }

    deleteProduct(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    toggleProductStatus(id: number): Observable<Product> {
        return this.http.patch<ApiProductResponse>(`${this.apiUrl}/${id}/toggle-status`, {})
            .pipe(map(response => this.mapProduct(response)));
    }
}

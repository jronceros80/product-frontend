import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, map, tap, shareReplay } from 'rxjs/operators';
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

    // Cache system
    private cache = new Map<string, { data: any; timestamp: number }>();
    private cacheTimeout = 5 * 60 * 1000; // 5 minutes cache timeout

    private productsCache$ = new BehaviorSubject<ProductListResponse | null>(null);

    constructor(private http: HttpClient) { }

    private getCacheKey(filters: ProductFilters, page: number, size: number): string {
        return `products_${JSON.stringify(filters)}_${page}_${size}`;
    }

    private isValidCache(timestamp: number): boolean {
        return Date.now() - timestamp < this.cacheTimeout;
    }

    private getCachedData(key: string): any {
        const cached = this.cache.get(key);
        if (cached && this.isValidCache(cached.timestamp)) {
            return cached.data;
        }
        return null;
    }

    private setCachedData(key: string, data: any): void {
        this.cache.set(key, { data, timestamp: Date.now() });
    }

    private clearCache(): void {
        this.cache.clear();
        this.productsCache$.next(null);
    }

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
        size: number = 10,
        useCache: boolean = true
    ): Observable<ProductListResponse> {
        const cacheKey = this.getCacheKey(filters, page, size);

        if (useCache) {
            const cachedData = this.getCachedData(cacheKey);
            if (cachedData) {
                console.log('Returning cached data for:', cacheKey);
                return of(cachedData);
            }
        }

        console.log('Fetching fresh data for:', cacheKey);

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
                tap(data => {
                    if (useCache) {
                        this.setCachedData(cacheKey, data);
                        console.log('Data cached for:', cacheKey);
                    }
                }),
                catchError(error => {
                    console.error('Error fetching products:', error);
                    return of({
                        products: [],
                        totalElements: 0,
                        totalPages: 0,
                        currentPage: page,
                        pageSize: size
                    });
                }),
                shareReplay(1) // Share result between multiple subscribers
            );
    }

    getProductById(id: number, useCache: boolean = true): Observable<Product> {
        const cacheKey = `product_${id}`;

        if (useCache) {
            const cachedData = this.getCachedData(cacheKey);
            if (cachedData) {
                console.log('Returning cached product:', id);
                return of(cachedData);
            }
        }

        console.log('Fetching fresh product data:', id);

        return this.http.get<ApiProductResponse>(`${this.apiUrl}/${id}`)
            .pipe(
                map(response => this.mapProduct(response)),
                tap(product => {
                    if (useCache) {
                        this.setCachedData(cacheKey, product);
                        console.log('Product cached:', id);
                    }
                }),
                catchError(error => {
                    console.error('Error fetching product:', error);
                    throw error;
                }),
                shareReplay(1)
            );
    }

    createProduct(product: CreateProductRequest): Observable<Product> {
        return this.http.post<ApiProductResponse>(this.apiUrl, product)
            .pipe(
                map(response => this.mapProduct(response)),
                tap(() => {
                    this.clearCache();
                    console.log('Cache cleared after product creation');
                })
            );
    }

    updateProduct(id: number, product: UpdateProductRequest): Observable<Product> {
        return this.http.put<ApiProductResponse>(`${this.apiUrl}/${id}`, product)
            .pipe(
                map(response => this.mapProduct(response)),
                tap(() => {
                    this.clearCache();
                    console.log('Cache cleared after product update');
                })
            );
    }

    deleteProduct(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`)
            .pipe(
                tap(() => {
                    this.clearCache();
                    console.log('Cache cleared after product deletion');
                })
            );
    }

    toggleProductStatus(id: number): Observable<Product> {
        return this.http.patch<ApiProductResponse>(`${this.apiUrl}/${id}/toggle-status`, {})
            .pipe(
                map(response => this.mapProduct(response)),
                tap(() => {
                    this.clearCache();
                    console.log('Cache cleared after status toggle');
                })
            );
    }

    public invalidateCache(): void {
        this.clearCache();
        console.log('Cache manually cleared');
    }

    public getCacheStats(): { size: number; keys: string[] } {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ProductService } from '../../services/product.service';
import { Product, ProductCategory, ProductStatus, ProductFilters, formatCategoryForDisplay } from '../../models/product.model';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
    selector: 'app-product-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatTableModule,
        MatPaginatorModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatFormFieldModule,
        MatCardModule,
        MatToolbarModule,
        MatChipsModule,
        MatProgressSpinnerModule,
        MatTooltipModule
    ],
    templateUrl: './product-list.component.html',
    styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit, OnDestroy {
    products: Product[] = [];
    totalElements = 0;
    currentPage = 0;
    pageSize = 10;
    loading = true;

    displayedColumns: string[] = ['id', 'name', 'price', 'category', 'status', 'actions'];

    filterForm: FormGroup;
    categories = Object.values(ProductCategory);
    statuses = Object.values(ProductStatus);
    formatCategoryForDisplay = formatCategoryForDisplay;

    private destroy$ = new Subject<void>();

    constructor(
        private productService: ProductService,
        private router: Router,
        private fb: FormBuilder,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) {
        this.filterForm = this.fb.group({
            name: [''],
            category: ['ALL'],
            status: ['ALL']
        });
    }

    ngOnInit(): void {
        this.loadProducts();
        this.setupFilterSubscription();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private setupFilterSubscription(): void {
        this.filterForm.valueChanges
            .pipe(
                debounceTime(800), // Increased debounce time to reduce API calls
                distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
                takeUntil(this.destroy$)
            )
            .subscribe(() => {
                this.currentPage = 0;
                this.loadProducts();
            });
    }

    loadProducts(useCache: boolean = true): void {
        this.loading = true;
        const filters: ProductFilters = this.filterForm.value;

        this.productService.getProducts(filters, this.currentPage, this.pageSize, useCache)
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => this.loading = false)
            )
            .subscribe({
                next: (response) => {
                    this.products = response.products || [];
                    this.totalElements = response.totalElements || 0;
                },
                error: (error) => {
                    console.error('Error loading products:', error);
                    this.snackBar.open('Error loading products. Please try again later.', 'Close', { duration: 5000 });
                    this.products = [];
                    this.totalElements = 0;
                }
            });
    }

    /**
     * Refresh data by clearing cache and reloading
     */
    refreshData(): void {
        this.productService.invalidateCache();
        this.loadProducts(false); // Force fresh data
        this.snackBar.open('Data refreshed successfully', 'Close', { duration: 2000 });
    }

    onPageChange(event: PageEvent): void {
        this.currentPage = event.pageIndex;
        this.pageSize = event.pageSize;
        this.loadProducts();
    }

    navigateToCreate(): void {
        this.router.navigate(['/products/create']);
    }

    navigateToDetail(product: Product): void {
        this.router.navigate(['/products', product.id]);
    }

    navigateToEdit(product: Product): void {
        this.router.navigate(['/products', product.id, 'edit']);
    }

    deleteProduct(product: Product): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {
                title: 'Confirm Deletion',
                message: `Are you sure you want to delete the product "${product.name}"?`,
                subtitle: 'This action cannot be undone.',
                confirmText: 'Delete',
                cancelText: 'Cancel'
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result && product.id) {
                this.productService.deleteProduct(product.id)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: () => {
                            this.snackBar.open('Product deleted successfully', 'Close', { duration: 3000 });
                            this.loadProducts();
                        },
                        error: (error) => {
                            console.error('Error deleting product:', error);
                            this.snackBar.open('Error deleting product', 'Close', { duration: 3000 });
                        }
                    });
            }
        });
    }

    clearFilters(): void {
        this.filterForm.reset({
            name: '',
            category: 'ALL',
            status: 'ALL'
        });
    }

    getCategoryColor(category: ProductCategory): string {
        switch (category) {
            case ProductCategory.ELECTRONICS: return 'accent';
            case ProductCategory.CLOTHING: return 'primary';
            case ProductCategory.BOOKS: return 'warn';
            default: return '';
        }
    }

    getStatusColor(status: ProductStatus): string {
        switch (status) {
            case ProductStatus.ACTIVE:
                return 'primary';
            case ProductStatus.INACTIVE:
                return 'warn';
            default:
                return '';
        }
    }

    getCategoryText(category: ProductCategory): string {
        return formatCategoryForDisplay(category);
    }
}

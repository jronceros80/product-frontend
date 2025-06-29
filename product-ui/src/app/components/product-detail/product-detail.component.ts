import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

import { ProductService } from '../../services/product.service';
import { Product, ProductCategory, ProductStatus, formatCategoryForDisplay } from '../../models/product.model';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
    selector: 'app-product-detail',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatToolbarModule,
        MatChipsModule,
        MatDividerModule,
        MatProgressSpinnerModule
    ],
    templateUrl: './product-detail.component.html',
    styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent implements OnInit, OnDestroy {
    product: Product | null = null;
    loading = false;
    productId: number;
    formatCategoryForDisplay = formatCategoryForDisplay;

    private destroy$ = new Subject<void>();

    constructor(
        private productService: ProductService,
        private router: Router,
        private route: ActivatedRoute,
        private snackBar: MatSnackBar,
        private dialog: MatDialog
    ) {
        this.productId = +this.route.snapshot.paramMap.get('id')!;
    }

    ngOnInit(): void {
        this.loadProduct();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private loadProduct(): void {
        this.loading = true;
        this.productService.getProductById(this.productId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (product) => {
                    this.product = product;
                    this.loading = false;
                },
                error: (error) => {
                    console.error('Error loading product:', error);
                    this.snackBar.open('Error loading product', 'Close', { duration: 3000 });
                    this.router.navigate(['/products']);
                    this.loading = false;
                }
            });
    }

    navigateToList(): void {
        this.router.navigate(['/products']);
    }

    navigateToEdit(): void {
        this.router.navigate(['/products', this.productId, 'edit']);
    }

    deleteProduct(): void {
        if (!this.product) return;

        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {
                title: 'Confirm Deletion',
                message: `Are you sure you want to delete the product "${this.product.name}"?`,
                subtitle: 'This action cannot be undone.',
                confirmText: 'Delete',
                cancelText: 'Cancel'
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.productService.deleteProduct(this.productId)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: () => {
                            this.snackBar.open('Product deleted successfully', 'Close', { duration: 3000 });
                            this.router.navigate(['/products']);
                        },
                        error: (error) => {
                            console.error('Error deleting product:', error);
                            this.snackBar.open('Error deleting product', 'Close', { duration: 3000 });
                        }
                    });
            }
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

    getCategoryIcon(category: ProductCategory): string {
        switch (category) {
            case ProductCategory.ELECTRONICS: return 'electrical_services';
            case ProductCategory.CLOTHING: return 'checkroom';
            case ProductCategory.BOOKS: return 'menu_book';
            default: return 'category';
        }
    }

    getStatusIcon(status: ProductStatus): string {
        return status === ProductStatus.ACTIVE ? 'check_circle' : 'cancel';
    }
}

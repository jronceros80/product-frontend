import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ProductService } from '../../services/product.service';
import { Product, ProductCategory, ProductStatus, CreateProductRequest, UpdateProductRequest, formatCategoryForDisplay } from '../../models/product.model';

@Component({
    selector: 'app-product-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatCardModule,
        MatToolbarModule,
        MatIconModule,
        MatCheckboxModule,
        MatProgressSpinnerModule
    ],
    templateUrl: './product-form.component.html',
    styleUrl: './product-form.component.css'
})
export class ProductFormComponent implements OnInit, OnDestroy {
    productForm: FormGroup;
    categories = Object.values(ProductCategory);
    statuses = Object.values(ProductStatus);
    isEditMode = false;
    productId: number | null = null;
    loading = false;
    submitting = false;

    private destroy$ = new Subject<void>();

    constructor(
        private fb: FormBuilder,
        private productService: ProductService,
        private router: Router,
        private route: ActivatedRoute,
        private snackBar: MatSnackBar
    ) {
        this.productForm = this.createForm();
    }

    ngOnInit(): void {
        this.checkEditMode();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private createForm(): FormGroup {
        return this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
            price: ['', [Validators.required, Validators.min(0.01), Validators.max(999999.99)]],
            category: ['', Validators.required],
            status: [ProductStatus.ACTIVE]
        });
    }

    private checkEditMode(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.isEditMode = true;
            this.productId = +id;
            this.loadProduct();
        }
    }

    private loadProduct(): void {
        if (this.productId) {
            this.loading = true;
            this.productService.getProductById(this.productId)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (product) => {
                        this.populateForm(product);
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
    }

    private populateForm(product: Product): void {
        this.productForm.patchValue({
            name: product.name,
            price: product.price,
            category: product.category,
            status: product.status
        });
    }

    onSubmit(): void {
        if (this.productForm.valid) {
            this.submitting = true;

            if (this.isEditMode) {
                this.updateProduct();
            } else {
                this.createProduct();
            }
        } else {
            this.markFormGroupTouched();
        }
    }

    private createProduct(): void {
        const productData: CreateProductRequest = {
            name: this.productForm.value.name,
            price: this.productForm.value.price,
            category: this.productForm.value.category
        };

        this.productService.createProduct(productData)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (product) => {
                    this.snackBar.open('Product created successfully', 'Close', { duration: 3000 });
                    this.router.navigate(['/products', product.id]);
                    this.submitting = false;
                },
                error: (error) => {
                    console.error('Error creating product:', error);
                    this.snackBar.open('Error creating product', 'Close', { duration: 3000 });
                    this.submitting = false;
                }
            });
    }

    private updateProduct(): void {
        if (this.productId) {
            const productData: UpdateProductRequest = {
                name: this.productForm.value.name,
                price: this.productForm.value.price,
                category: this.productForm.value.category,
                status: this.productForm.value.status
            };

            this.productService.updateProduct(this.productId, productData)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (product) => {
                        this.snackBar.open('Product updated successfully', 'Close', { duration: 3000 });
                        this.router.navigate(['/products', product.id]);
                        this.submitting = false;
                    },
                    error: (error) => {
                        console.error('Error updating product:', error);
                        this.snackBar.open('Error updating product', 'Close', { duration: 3000 });
                        this.submitting = false;
                    }
                });
        }
    }

    private markFormGroupTouched(): void {
        Object.keys(this.productForm.controls).forEach(key => {
            const control = this.productForm.get(key);
            control?.markAsTouched();
        });
    }

    onCancel(): void {
        if (this.isEditMode && this.productId) {
            this.router.navigate(['/products', this.productId]);
        } else {
            this.router.navigate(['/products']);
        }
    }

    getErrorMessage(fieldName: string): string {
        const control = this.productForm.get(fieldName);
        if (control?.hasError('required')) {
            return `${this.getFieldDisplayName(fieldName)} is required`;
        }
        if (control?.hasError('minlength')) {
            return `${this.getFieldDisplayName(fieldName)} must be at least ${control.errors?.['minlength'].requiredLength} characters`;
        }
        if (control?.hasError('maxlength')) {
            return `${this.getFieldDisplayName(fieldName)} cannot be more than ${control.errors?.['maxlength'].requiredLength} characters`;
        }
        if (control?.hasError('min')) {
            return `${this.getFieldDisplayName(fieldName)} must be greater than ${control.errors?.['min'].min}`;
        }
        if (control?.hasError('max')) {
            return `${this.getFieldDisplayName(fieldName)} cannot be greater than ${control.errors?.['max'].max}`;
        }
        return '';
    }

    private getFieldDisplayName(fieldName: string): string {
        const displayNames: { [key: string]: string } = {
            name: 'Name',
            price: 'Price',
            category: 'Category',
            status: 'Status'
        };
        return displayNames[fieldName] || fieldName;
    }

    hasError(fieldName: string): boolean {
        const control = this.productForm.get(fieldName);
        return !!(control && control.invalid && (control.dirty || control.touched));
    }

    formatCategory(category: ProductCategory): string {
        return formatCategoryForDisplay(category);
    }
}

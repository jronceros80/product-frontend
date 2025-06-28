import { Routes } from '@angular/router';
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductFormComponent } from './components/product-form/product-form.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';

export const routes: Routes = [
    // Redirect to products by default
    { path: '', redirectTo: '/products', pathMatch: 'full' },

    // Products routes
    { path: 'products', component: ProductListComponent },
    { path: 'products/create', component: ProductFormComponent },
    { path: 'products/:id', component: ProductDetailComponent },
    { path: 'products/:id/edit', component: ProductFormComponent },

    // Wildcard route - should be last
    { path: '**', redirectTo: '/products' }
];

# Product Management UI

Frontend application for managing products built with Angular 17.

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

## Setup

1. Clone the repository:
```bash
git clone <your-repository-url>
cd product-ui
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
   - Copy `src/environments/environment.example.ts` to `src/environments/environment.ts`
   - Update the environment variables as needed

## Development

Run the development server:
```bash
npm start
```

Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Build

Build the project for production:
```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Features

- Product listing with pagination and filters
- Product creation and editing
- Product status management
- Category management
- Responsive design

## Tech Stack

- Angular 17
- Angular Material
- RxJS
- TypeScript

## 🚀 Características

- **CRUD Completo**: Crear, leer, actualizar y eliminar productos
- **Filtros Avanzados**: Filtrar por nombre, categoría y estado
- **Paginación**: Navegación eficiente a través de grandes listas
- **Responsive Design**: Optimizado para dispositivos móviles y escritorio
- **Material Design**: Interfaz moderna con Angular Material
- **Validación de Formularios**: Validación en tiempo real con mensajes de error
- **Confirmación de Acciones**: Diálogos de confirmación para operaciones críticas

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── components/           # Componentes reutilizables
│   │   ├── product-list/     # Lista de productos con filtros
│   │   ├── product-form/     # Formulario para crear/editar
│   │   ├── product-detail/   # Vista de detalles del producto
│   │   └── confirm-dialog/   # Diálogo de confirmación
│   ├── services/             # Servicios para lógica de negocio
│   │   └── product.service.ts
│   ├── models/               # Interfaces y modelos TypeScript
│   │   └── product.model.ts
│   ├── guards/               # Guards para rutas (ready for future use)
│   ├── interceptors/         # Interceptores HTTP (ready for future use)
│   └── app.routes.ts         # Configuración de rutas
├── environments/             # Configuraciones por entorno
│   └── environment.ts
└── styles.css               # Estilos globales
```

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js (versión 18 o superior)
- Angular CLI (versión 20 o superior)

### Pasos de instalación

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Configurar la URL del Backend**:
   Editar `src/environments/environment.ts`:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'https://tu-backend-api.com/api'  // Cambiar por tu URL real
   };
   ```

3. **Ejecutar en desarrollo**:
   ```bash
   ng serve
   ```
   La aplicación estará disponible en `http://localhost:4200`

## 🔧 Configuración del Backend

El frontend está configurado para comunicarse con un API REST que debe implementar los siguientes endpoints:

### Endpoints Requeridos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/products` | Listar productos con filtros y paginación |
| GET | `/api/products/{id}` | Obtener producto por ID |
| POST | `/api/products` | Crear nuevo producto |
| PUT | `/api/products/{id}` | Actualizar producto |
| DELETE | `/api/products/{id}` | Eliminar producto |

### Parámetros de Query (GET /api/products)
- `page`: Número de página (base 0)
- `size`: Tamaño de página
- `name`: Filtro por nombre (opcional)
- `category`: Filtro por categoría (opcional)
- `status`: Filtro por estado (opcional)

### Modelo de Producto
```json
{
  "id": 1,
  "name": "Producto Ejemplo",
  "price": 29.99,
  "category": "ELECTRONICS",
  "status": "ACTIVE",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

## 📱 Funcionalidades

### Lista de Productos
- Visualización en tabla con paginación
- Filtros por nombre, categoría y estado
- Acciones: Ver, Editar, Eliminar
- Estados de carga y error
- Responsive design

### Crear/Editar Producto
- Formulario con validación en tiempo real
- Campos requeridos: nombre, precio, categoría
- Campo de estado solo en modo edición
- Mensajes de error descriptivos

### Ver Detalles
- Vista completa de información del producto
- Metadatos (fecha de creación/actualización)
- Acciones rápidas (editar, eliminar)

### Confirmación de Acciones
- Diálogo de confirmación para eliminaciones
- Prevención de acciones accidentales

## 🎨 Temas y Personalización

El proyecto utiliza el tema Azure/Blue de Angular Material. Para cambiar el tema:

1. Ejecutar `ng add @angular/material` y seleccionar un tema diferente
2. O personalizar los colores en `src/styles.css`

## 🔒 Seguridad (Para implementar)

La estructura está preparada para implementar:
- **Guards**: Protección de rutas
- **Interceptors**: Autenticación automática, manejo de errores
- **Validación de permisos**: Control de acceso por roles

## 🚀 Comandos de Desarrollo

```bash
# Desarrollo
ng serve

# Build de producción
ng build --configuration production

# Tests
ng test

# Linting
ng lint
```

## 📊 Dependencias Principales

- **Angular 20**: Framework base
- **Angular Material 20**: Componentes UI
- **RxJS**: Manejo de observables
- **TypeScript**: Lenguaje principal

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama de feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit los cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear un Pull Request

## 📝 Notas Importantes

- **URL del Backend**: Asegúrate de configurar correctamente la URL en `environment.ts`
- **CORS**: El backend debe permitir requests desde `http://localhost:4200`
- **Responsive**: La aplicación está optimizada para móviles y escritorio
- **Accesibilidad**: Utiliza Angular Material que cumple con estándares de accesibilidad

## 🔧 Solución de Problemas

### Error de CORS
Si encuentras errores de CORS, configura tu backend para permitir el origen de desarrollo:
```
Access-Control-Allow-Origin: http://localhost:4200
```

### Errores de Compilación
Asegúrate de tener las versiones correctas:
```bash
ng version
npm list @angular/core @angular/material
```

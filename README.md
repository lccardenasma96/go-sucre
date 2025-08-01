# GoSucre - Plataforma Turística del Departamento de Sucre

## 📋 Descripción

GoSucre es una aplicación web desarrollada en Angular que sirve como plataforma turística integral para el departamento de Sucre, Colombia. La aplicación permite a los usuarios explorar lugares turísticos, eventos culturales, y gestionar sus favoritos de manera interactiva.

## ✨ Características Principales

### 🏠 Página de Inicio
- **Regiones Turísticas**: Presentación de las 5 regiones principales de Sucre:
  - Sabanas (música, ferias y tradiciones)
  - Mojana (territorio de agua y vida)
  - Montes de María (cultura ancestral y música autóctona)
  - San Jorge (agroturismo y gastronomía)
  - Golfo de Morrosquillo (playas y experiencias náuticas)
- **Animaciones de Scroll**: Efectos visuales al hacer scroll
- **Diseño Responsivo**: Adaptable a diferentes dispositivos

### 🗺️ Página de Lugares
- **Mapa Interactivo**: Integración con Leaflet para visualización geográfica
- **Filtrado por Municipios**: Selección dinámica de municipios
- **Sistema de Favoritos**: Marcado y gestión de lugares favoritos
- **Carousel de Imágenes**: Galería deslizable con Embla Carousel
- **Pestañas Organizadas**: Separación entre lugares y eventos

### 👤 Perfil de Usuario
- **Autenticación**: Sistema de login/registro con JWT
- **Gestión de Favoritos**: Vista consolidada de lugares y eventos favoritos
- **Protección de Rutas**: Guard de autenticación para acceso seguro

### ℹ️ Página Acerca de
- **Información del Proyecto**: Descripción detallada de la plataforma
- **Tecnologías Utilizadas**: Stack tecnológico empleado

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Angular 20**: Framework principal
- **TypeScript**: Lenguaje de programación
- **Angular Material**: Componentes de UI
- **SCSS/Sass**: Preprocesador de CSS
- **RxJS**: Programación reactiva

### Librerías Externas
- **Leaflet**: Mapas interactivos
- **Embla Carousel**: Carrusel de imágenes
- **JWT Decode**: Manejo de tokens JWT

### Herramientas de Desarrollo
- **Angular CLI**: Herramientas de línea de comandos
- **Karma & Jasmine**: Testing framework
- **Sass**: Compilador de estilos

## 📦 Instalación y Configuración

### Prerrequisitos
- Node.js (versión 18 o superior)
- npm o yarn
- Angular CLI (`npm install -g @angular/cli`)

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/lccardenasma96/go-sucre.git
   cd go-sucre
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   - Crear archivo `.env` en la raíz del proyecto
   - Configurar la URL de la API backend

4. **Ejecutar en modo desarrollo**
   ```bash
   ng serve
   ```

5. **Abrir en el navegador**
   - Navegar a `http://localhost:4200`

## 🏗️ Arquitectura del Proyecto

### Estructura de Directorios
```
src/
├── app/
│   ├── components/          # Componentes reutilizables
│   │   ├── dialog-auth/     # Diálogo de autenticación
│   │   ├── footer/          # Pie de página
│   │   ├── header-custom/   # Encabezado personalizado
│   │   ├── maps/            # Componente de mapas
│   │   └── slider/          # Carrusel de imágenes
│   ├── directives/          # Directivas personalizadas
│   ├── pages/               # Páginas principales
│   │   ├── about/           # Página Acerca de
│   │   ├── home/            # Página de inicio
│   │   ├── places/          # Página de lugares
│   │   └── profile/         # Perfil de usuario
│   ├── services/            # Servicios de la aplicación
│   └── app.routes.ts        # Configuración de rutas
```

### Componentes Principales

#### 🏠 Home Component
- **Funcionalidad**: Página principal con información de regiones
- **Características**: Animaciones de scroll, diseño responsivo
- **Datos**: Información estática de las 5 regiones de Sucre

#### 🗺️ Places Component
- **Funcionalidad**: Exploración de lugares y eventos
- **Integración**: Mapa Leaflet, carousel Embla
- **Estado**: Gestión reactiva con Angular Signals
- **Favoritos**: Sistema de marcado de favoritos

#### 🎠 Slider Component
- **Funcionalidad**: Carrusel de imágenes interactivo
- **Librería**: Embla Carousel
- **Características**: Navegación táctil, controles personalizados
- **Integración**: Sistema de favoritos integrado

#### 🗺️ Maps Component
- **Funcionalidad**: Visualización geográfica
- **Librería**: Leaflet
- **Características**: Marcadores dinámicos, interacción con municipios

### Servicios

#### 🔌 ApiService
- **Responsabilidad**: Comunicación con el backend
- **Endpoints**:
  - Autenticación (login/register)
  - Lugares y eventos
  - Gestión de favoritos
- **Autenticación**: Headers JWT automáticos

#### ❤️ FavoriteServices
- **FavoriteEventsService**: Gestión de eventos favoritos
- **FavoritePlacesService**: Gestión de lugares favoritos
- **Características**: Estado reactivo con Signals

#### 🏘️ MunicipioService
- **Responsabilidad**: Gestión de municipios seleccionados
- **Estado**: Signal reactivo para municipio actual

## 🔐 Autenticación y Seguridad

### Sistema de Autenticación
- **JWT Tokens**: Autenticación basada en tokens
- **Guard de Rutas**: Protección de páginas privadas
- **Almacenamiento**: LocalStorage para persistencia
- **Headers**: Inyección automática en requests

### Rutas Protegidas
- `/profile`: Requiere autenticación
- Otras rutas: Acceso público

## 🎨 Diseño y UX

### Características de Diseño
- **Responsivo**: Adaptable a móviles, tablets y desktop
- **Material Design**: Componentes de Angular Material
- **Animaciones**: Transiciones suaves y efectos visuales
- **Accesibilidad**: Navegación por teclado y lectores de pantalla

### Paleta de Colores
- Colores representativos del departamento de Sucre
- Contraste adecuado para legibilidad
- Consistencia visual en toda la aplicación

## 🧪 Testing

### Framework de Testing
- **Karma**: Test runner
- **Jasmine**: Framework de testing
- **Coverage**: Reportes de cobertura de código

### Ejecutar Tests
```bash
# Tests unitarios
ng test

# Tests con coverage
ng test --code-coverage
```

## 🚀 Despliegue

### Build de Producción
```bash
ng build --configuration production
```

### Optimizaciones
- **Tree Shaking**: Eliminación de código no utilizado
- **Minificación**: Compresión de archivos
- **Lazy Loading**: Carga diferida de módulos
- **Service Workers**: Caché para mejor rendimiento

## 📱 Compatibilidad

### Navegadores Soportados
- Chrome (últimas 2 versiones)
- Firefox (últimas 2 versiones)
- Safari (últimas 2 versiones)
- Edge (últimas 2 versiones)

### Dispositivos
- **Desktop**: 1024px y superior
- **Tablet**: 768px - 1023px
- **Mobile**: 320px - 767px

## 🔧 Scripts Disponibles

```json
{
  "ng": "ng",
  "start": "ng serve",
  "build": "ng build",
  "watch": "ng build --watch --configuration development",
  "test": "ng test"
}
```

## 🤝 Contribución

### Guías de Contribución
1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -am 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

### Estándares de Código
- **TypeScript**: Configuración estricta
- **ESLint**: Linting de código
- **Prettier**: Formateo automático
- **Conventional Commits**: Estándar de commits



**GoSucre** - Descubre la magia del departamento de Sucre, Colombia 🇨🇴

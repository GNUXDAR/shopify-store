# Documentación Técnica - Personalizaciones Shopify

## 📦 Funcionalidades Implementadas

### 1. 🎯 Sección de Productos Relacionados Personalizados
**Archivo:** `custom-related-products.liquid`

#### Características Principales:
- **Algoritmo inteligente** de recomendación en 3 niveles:
  - ✅ Etiquetas coincidentes (prioridad alta)
  - ✅ Mismo tipo de producto (prioridad media) 
  - ✅ Mismo vendedor (prioridad baja)

#### Personalizaciones Visuales:
```liquid
{% style %}
  .related-products__heading { color: {{ section.settings.heading_color }}; }
  .card-wrapper { box-shadow: 0 5px 15px {{ section.settings.accent_color }}; }
  /* 12+ propiedades personalizables */
{% endstyle %}
```

#### Configuración desde Admin:
- Esquemas de color personalizables
- 8 formas de imagen diferentes
- Control responsive de columnas
- Navegación opcional con slider

---

### 2. 📋 Sección de Información Adicional de Producto
**Archivo:** `product-additional-info.liquid`

#### Funcionalidad:
- Acordeones desplegables para información de envíos y devoluciones
- Diseño responsive con colores personalizables
- Enlaces a página de políticas completas

#### Configuración:
```json
{
  "shipping_details": "Texto personalizable",
  "return_policy": "Texto personalizable", 
  "accent_color": "#ff6b6b"
}
```

---

### 3. 📧 Formulario de Suscripción con Mailchimp
**Archivo:** `newsletter-form.liquid`

#### Integración:
- Formulario con validación de email
- Integración con API de Mailchimp
- Fallback a localStorage para respaldo
- Diseño responsive con personalización completa

#### Archivos Asociados:
- `newsletter-form.css` - Estilos personalizados
- `newsletter-form.js` - Lógica de validación y envío

---

### 4. 🧭 Navegación con Categorías Estáticas
**Modificación en:** `header-dropdown-menu.liquid`

#### Mejora Implementada:
```liquid
<!-- Menú dinámico + Categorías estáticas -->
<li>
  <details id="Details-HeaderMenu-Cat">
    <summary>Categorías</summary>
    <ul>
      <li><a href="/collections/all">Todos los productos</a></li>
      <li><a href="/collections/snowboard">Snowboard</a></li>
      <li><a href="/collections/accesorios">Accesorios</a></li>
    </ul>
  </details>
</li>
```

---

## ⚙️ Consideraciones Técnicas Relevantes

### 🚨 Importante: Configuración de Mailchimp
```liquid
{
  "type": "text",
  "id": "mailchimp_url",
  "label": "URL de Mailchimp",
  "default": "https://mailchimp.us20.list-manage.com/subscribe/post?u=arturocabrera&amp;id=1234567890"
}
```
**Requerido:** Reemplazar con URL real de Mailchimp para que funcione la integración.

### 🎨 Variables de Color Personalizadas
Todas las secciones usan el sistema de esquemas de color de Shopify + colores personalizados:
```liquid
{{ section.settings.accent_color }}
{{ section.settings.heading_color }}
{{ section.settings.text_color }}
```

### 📱 Responsive Design
Todas las secciones incluyen:
- Breakpoints para móvil (750px)
- Grid adaptable
- Estilos específicos para cada dispositivo

### 🧩 Dependencias de JavaScript
**Productos Relacionados:**
```liquid
{{ 'custom-related-products.js' | asset_url | script_tag }}
```

**Formulario Newsletter:**
```liquid
{{ 'newsletter-form.js' | asset_url | script_tag }}
```

---

## 🚀 Instrucciones de Implementación

### 1. Subir Archivos
```
assets/
  ├── custom-related-products.css
  ├── custom-related-products.js
  ├── newsletter-form.css
  ├── newsletter-form.js
sections/
  ├── custom-related-products.liquid
  ├── product-additional-info.liquid
  ├── newsletter-form.liquid
```

### 2. Configurar en Shopify Admin
1. Ir a **Temas → Personalizar**
2. Añadir secciones desde el menú de bloques
3. Configurar colores y textos según necesidad

### 3. Configurar Mailchimp
1. Obtener URL de API de Mailchimp
2. Pegar en configuración del formulario
3. Probar funcionalidad de suscripción

---

## 🔧 Troubleshooting

### ❌ Los estilos no se aplican
Verificar que los archivos CSS estén en la carpeta `assets` y se referencien correctamente.

### ❌ Formulario no envía emails
Verificar: 
- URL de Mailchimp correcta
- Configuración CORS del endpoint
- Consola de navegador para errores

### ❌ Slider no funciona
Verificar que el archivo `custom-related-products.js` esté cargado correctamente.

---

## 📞 Soporte

Para problemas técnicos, verificar:
1. Consola del navegador (F12)
2. Errores en loading de recursos
3. Configuración del schema en Shopify
4. Escribirme en el correo: gnuxdar.dev@gmail.com

**Nota:** 
Todas las secciones incluyen valores por defecto para evitar errores de schema.
Todas las secciones customizables se localizan en la categoria "gnuxdar" para mejor organización.
---
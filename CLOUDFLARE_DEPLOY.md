# Despliegue a Produccion con Cloudflare

Este proyecto ya esta preparado para publicarse como:
- sitio estatico en Cloudflare Pages
- catalogo automatico en Cloudflare Workers + KV + Cron

## 1. Estructura que debes subir a GitHub
Sube este proyecto limpio tal como esta ahora:

- `index.html`
- `catalogo.html`
- `styles.css`
- `script.js`
- `catalog.json`
- `site-config.json`
- `assets/logoV1.jpg`
- `cloudflare/catalog-worker.js`
- `cloudflare/wrangler.catalog.toml`
- `README.md`
- `CLOUDFLARE_DEPLOY.md`

## 2. Crear el repositorio en GitHub
1. Crea un repositorio nuevo, por ejemplo `ELITECH_EC`.
2. Sube el contenido actual del proyecto.
3. Verifica que la raiz del repo tenga `index.html`.

## 3. Publicar la web en Cloudflare Pages
1. Ve a `Cloudflare Dashboard > Workers & Pages > Create application > Pages`.
2. Elige `Connect to Git`.
3. Autoriza GitHub y selecciona el repo de `ELITECH_EC`.
4. Usa estos valores:

```text
Production branch: main
Framework preset: None
Build command: (vacio)
Build output directory: .
Root directory: .
```

5. Crea el proyecto y espera el primer deploy.

## 4. Conectar tu dominio
1. En el proyecto de Pages entra a `Custom domains`.
2. Agrega tu dominio principal.
3. Si tu DNS ya esta en Cloudflare, deja que Pages cree los registros automaticamente.

## 5. Configurar el sitio
Edita `site-config.json` antes o despues del primer deploy:

```json
{
  "whatsappNumber": "593978772909",
  "whatsappDefaultMessage": "Hola ELITECH_EC, deseo informacion sobre servicios y equipos.",
  "whatsappSupportMessage": "Hola ELITECH_EC, necesito soporte tecnico y comercial.",
  "contactEmail": "info@elitechec.com",
  "logoPath": "/assets/logoV1.jpg"
}
```

## 5.1. Si el logo se ve en `workers.dev` pero no en tu dominio
Si la web carga bien en `*.workers.dev` pero el logo o las imagenes dejan de verse al usar `www.tudominio.com`, revisa primero esto en Cloudflare:

1. Ve a `Security > Scrape Shield`.
2. Desactiva `Hotlink Protection` o crea una excepcion para tus imagenes.

Ese ajuste puede bloquear archivos `.jpg`, `.jpeg`, `.png`, `.gif` e `.ico` en el dominio personalizado aunque el HTML, CSS y JS sigan cargando bien.

## 6. Crear el KV para el catalogo
Instala Wrangler si aun no lo tienes:

```powershell
npm install -g wrangler
```

Inicia sesion:

```powershell
wrangler login
```

Crea los namespaces:

```powershell
wrangler kv namespace create CATALOG_KV
wrangler kv namespace create CATALOG_KV --preview
```

Copia los IDs generados y pegales en `cloudflare/wrangler.catalog.toml`.

## 7. Configurar el formulario de contacto
El formulario del home no usa backend.
Funciona con `mailto:` y toma el correo desde `site-config.json`.

Verifica este valor:

```json
{
  "contactEmail": "info@elitechec.com"
}
```

Con eso:
- el enlace de correo visible en la web apunta a ese email
- el formulario abre el cliente de correo del usuario hacia ese mismo email

Consideracion:
- el usuario necesita tener un cliente de correo configurado en su navegador o sistema operativo

## 8. Desplegar el Worker del catalogo
Desde la raiz del proyecto ejecuta:

```powershell
wrangler deploy -c cloudflare/wrangler.catalog.toml
```

## 9. Crear la route del Worker
En Cloudflare:
1. Ve a `Workers & Pages`.
2. Abre el Worker `elitech-catalog-worker`.
3. En `Settings > Triggers` agrega esta route:

```text
tu-dominio.com/catalog.json
```

Con esto:
- Pages sirve la web
- Worker responde solo `catalog.json`

## 10. Cron diario del catalogo
El archivo `cloudflare/wrangler.catalog.toml` ya viene listo para medianoche de Bogota:

```toml
[triggers]
crons = ["0 5 * * *"]
```

Cloudflare ejecuta el cron en UTC, por eso `05:00 UTC` equivale a `00:00` en Bogota.

## 11. Verificacion final
Revisa estas URLs:

```text
https://tu-dominio.com/
https://tu-dominio.com/catalogo.html
https://tu-dominio.com/catalog.json
```

Debe ocurrir esto:
- `index.html` carga la pagina principal
- `catalogo.html` carga el catalogo
- `catalog.json` responde desde el Worker
- el formulario del home abre el cliente de correo del usuario

### Prueba del formulario
1. Abre `https://tu-dominio.com/#contacto`
2. Llena el formulario
3. Envialo
4. Debe aparecer el mensaje indicando que se abrira el cliente de correo
5. Debe abrirse una nueva redaccion de correo hacia `contactEmail`

## 12. Recomendacion operativa
Usa GitHub + Cloudflare Pages para la web.
Usa Wrangler solo para el Worker del catalogo.

Ese flujo te deja:
- deploy automatico del frontend al hacer push
- catalogo actualizado solo cada dia
- formulario de contacto sin backend adicional
- menos riesgo que hacer todo manual por dashboard

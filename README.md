# ELITECH_EC

Sitio estatico de ELITECH_EC con:
- `index.html` para la pagina principal
- `catalogo.html` para el catalogo separado
- `script.js` para configuracion, catalogo, WhatsApp y formulario `mailto:`
- `cloudflare/` para el catalogo automatico en Worker

## Configuracion basica
Edita `site-config.json`:

```json
{
  "whatsappNumber": "593978772909",
  "whatsappDefaultMessage": "Hola ELITECH_EC, deseo informacion sobre servicios y equipos.",
  "whatsappSupportMessage": "Hola ELITECH_EC, necesito soporte tecnico y comercial.",
  "contactEmail": "info@elitechec.com",
  "logoPath": "assets/logoV1.jpg"
}
```

## Estructura necesaria
Para produccion este proyecto solo necesita:
- `index.html`
- `catalogo.html`
- `styles.css`
- `script.js`
- `catalog.json`
- `site-config.json`
- `assets/logoV1.jpg`
- `cloudflare/catalog-worker.js`
- `cloudflare/wrangler.catalog.toml`

## Publicacion recomendada
1. Publica la web estatica en Cloudflare Pages desde GitHub.
2. Usa `.` como directorio de salida.
3. Despliega el Worker del catalogo con:

```powershell
wrangler deploy -c cloudflare/wrangler.catalog.toml
```

4. Crea una route para `tu-dominio.com/catalog.json`.
5. Configura los IDs reales del KV en `cloudflare/wrangler.catalog.toml`.

Guia completa de produccion:
- `CLOUDFLARE_DEPLOY.md`

## Formulario de contacto
El formulario del home funciona con `mailto:`:
- toma el `contactEmail` de `site-config.json`
- arma asunto y cuerpo con los datos del formulario
- abre el cliente de correo del usuario para que el envio salga desde su propia cuenta

Consideracion operativa:
- el usuario debe tener un cliente de correo configurado en su dispositivo para que `mailto:` funcione correctamente

## Cron del catalogo
El Worker ya esta preparado para ejecutarse cada dia a medianoche de Bogota:

```toml
[triggers]
crons = ["0 5 * * *"]
```

Cloudflare usa UTC, por eso `05:00 UTC` equivale a `00:00` en Bogota.

# Despliegue en un VPS (HTTP por IP, un solo usuario)

```
navegador ─► http://IP        nginx  → frontend (dist/)
          ─► http://IP:3000   NestJS → Neon (Postgres externo)
                                     → Cloudflare R2 (archivos .xlsx)
          ─► https://…r2.cloudflarestorage.com/…  descargas con URL prefirmada (directo a R2)
```

Archivos: `Dockerfile`, `docker-compose.prod.yaml`, `deploy/nginx.conf`, `.env.production.example`.
Recursos que necesita: ~1 GB de RAM (nginx + API); base de datos y archivos viven fuera del VPS.

## Qué VPS usar

**Google Cloud e2-micro** (Always Free): 1 instancia e2-micro en `us-central1`, `us-east1` o `us-west1`, 30 GB de disco *estándar* (no "balanced" ni SSD) y 1 GB de salida de red al mes. Ojo:

- **La IP pública no es gratis**: la IPv4 externa se cobra aparte (unos pocos USD al mes). Revisa la tarifa vigente en el calculador de precios al crear la VM.
- Fuera de esas tres regiones, o con otro tipo de disco, se cobra la instancia.
- Los límites cambian: confírmalos en la documentación de Google Cloud antes de crear la cuenta (pide tarjeta).

**Alternativa: Oracle Cloud Always Free (ARM)**: más potente y con IP pública incluida, pero en 2026 recortaron el plan y paran instancias con CPU casi ociosa, que es justo el perfil de esta app. Sirve si aceptas ese riesgo.

Cualquier VPS con Ubuntu y Docker sirve; el resto de la guía no depende del proveedor.

## 1. Una sola vez

**Neon**: crea el proyecto en la región más cercana al VPS y copia la connection string *directa* (host sin `-pooler`, con `?sslmode=require`).

**Cloudflare R2** (archivos):

1. R2 → *Create bucket* (por ejemplo `student-manager-files`).
2. R2 → *Manage API tokens* → crea un token con permiso **Object Read & Write** limitado a ese bucket. Guarda el *Access Key ID* y el *Secret Access Key* (solo se muestran una vez).
3. Anota tu endpoint: `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`.

R2 puede pedir un método de pago al activarlo aunque no cobre dentro del plan gratuito (10 GB, 1 M de escrituras y 10 M de lecturas al mes; salida sin costo). No hace falta configurar CORS: las descargas son navegaciones directas, no `fetch`.

**VPS en Google Cloud** (Compute Engine → *Create instance*):

- Tipo `e2-micro`, región `us-central1` (o `us-east1`/`us-west1`), imagen Ubuntu 24.04 LTS, disco de arranque *Standard persistent disk* de 30 GB.
- Reserva una **IP externa estática** (VPC network → IP addresses). Con IP efímera, cada vez que se detenga la VM cambia y tendrías que actualizar `PUBLIC_HOST` y recompilar el frontend.
- **Firewall** (VPC network → Firewall): una regla de entrada `tcp:22,80,3000` con origen `TU_IP/32`. El firewall de la VPC está fuera de la VM, así que Docker no se lo salta (a diferencia de `ufw`).
- Añade tu clave SSH pública en *Edit → SSH keys* de la VM (o usa `gcloud compute ssh`). El usuario es el que aparece al final de la clave.

**En la VM** (por SSH):

```bash
# Docker
curl -fsSL https://get.docker.com | sudo sh && sudo usermod -aG docker $USER   # cierra sesión y vuelve a entrar

# Swap: con 1 GB de RAM la compilación de la imagen se queda sin memoria
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

**Código y variables**:

```bash
git clone <repo-del-backend> ~/student-manager && cd ~/student-manager
cp .env.production.example .env && nano .env   # PUBLIC_HOST, DATABASE_URL, S3_*, login
```

**Login**: la app exige iniciar sesión. En `.env` define:

- `JWT_SECRET`: genéralo con `openssl rand -base64 48` (mínimo 32 caracteres; sin él la API no arranca).
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` (mín. 8 caracteres) y `ADMIN_NAME`: el usuario principal. Si en Neon ya tienes una profesora, pon **su email** en `ADMIN_EMAIL` (se le asigna la contraseña); con otro email se crearía una segunda profesora sin años académicos.

## 2. Cada despliegue

**Frontend**, desde tu máquina (`VITE_API_URL` se fija al compilar):

```bash
cd student-manager-frontend
VITE_API_URL=http://IP_VPS:3000 npm run build
rsync -az --delete dist/ USUARIO@IP_VPS:~/student-manager/frontend-dist/
```

**Backend**, en el VPS:

```bash
cd ~/student-manager && git pull
docker compose run --rm migrate      # crea/actualiza el esquema en Neon y el usuario principal (ADMIN_*)
docker compose up -d --build
docker compose logs -f api
```

La app queda en `http://IP_VPS`. La primera compilación en un e2-micro tarda varios minutos.

**Primera vez, comprueba el flujo de archivos**: inicia sesión, genera el archivo de un período y descárgalo. Es lo único que aún no se ha probado contra R2 real (la API sube con `If-None-Match` para no sobrescribir y firma URLs de descarga); si falla, `docker compose logs api` muestra el error de S3.

## Operación

- **Cambiar la contraseña**: edita `ADMIN_PASSWORD` en `.env` y vuelve a ejecutar `docker compose run --rm migrate`. El seed es idempotente y reescribe la contraseña en cada despliegue. Los tokens ya emitidos siguen valiendo hasta que expiren (`JWT_EXPIRES_IN`, 7 días); para invalidarlos todos, cambia `JWT_SECRET` y `docker compose up -d`.
- **HTTP sin cifrar**: el login viaja sin TLS por la IP. El firewall (solo tu IP) lo mitiga; el siguiente paso sería un dominio con HTTPS.
- **Respaldo de archivos**: viven en R2. Los históricos son snapshots; si quieres copia, `rclone sync` del bucket a otro lado de vez en cuando.
- **Si cambias `PUBLIC_HOST`** (IP nueva): actualiza `.env`, vuelve a compilar el frontend y ejecuta `docker compose up -d`.

## Si algo falla

- **CORS en el navegador**: `PUBLIC_HOST` debe coincidir exactamente con la IP con la que abres la app.
- **Error 500 al generar un archivo** (`Storage operation failed` en los logs): revisa `S3_ENDPOINT`, las claves y que el token de R2 tenga acceso de escritura a ese bucket.
- **Se queda sin memoria al compilar**: confirma el swap con `free -h`.

## Alternativa: MinIO en el mismo VPS

Si prefieres no usar R2: en `.env` pon `S3_ENDPOINT=http://IP_VPS:9000`, `S3_FORCE_PATH_STYLE=true`, `MINIO_ROOT_USER`/`MINIO_ROOT_PASSWORD` y las mismas claves en `S3_ACCESS_KEY_ID`/`S3_SECRET_ACCESS_KEY`; abre el puerto 9000 en el firewall y levanta con `docker compose --profile minio up -d --build`.
La imagen de `quay.io/minio/minio` es de octubre de 2025 y ya no recibe actualizaciones (MinIO retiró la edición comunitaria); Garage o SeaweedFS son los reemplazos habituales.
En un VPS de 1 GB, MinIO además te quita memoria.

## Despliegue sin VPS: Render (API) + Cloudflare Pages (frontend)

Todo gratis y con HTTPS. Base de datos y archivos siguen en Neon y R2 (sección 1).

```
navegador ─► https://<proyecto>.pages.dev        Cloudflare Pages → frontend (dist/)
          ─► https://<servicio>.onrender.com     Render (Docker)  → Neon + R2
pinger cada 10 min ─► https://<servicio>.onrender.com/health   (evita que se duerma)
```

**Por qué el ping**: el plan Free de Render apaga el servicio tras ~15 min sin tráfico y el siguiente
request tarda 30–60 s en arrancarlo. Las horas gratis al mes alcanzan para tener un servicio encendido
todo el mes, así que un ping periódico lo mantiene despierto. `/health` no toca la base, así que Neon
puede seguir suspendiéndose cuando nadie usa la app (despierta en menos de un segundo).
Límites y condiciones del plan gratis cambian: revísalos en render.com/pricing.

### 1. Esquema y usuario en Neon (desde tu máquina, una vez y tras cada cambio del esquema)

```bash
cd api-student-manager && yarn build
DATABASE_URL='postgresql://…neon.tech/neondb?sslmode=require' \
ADMIN_NAME='Profesora' ADMIN_EMAIL='profesora@ejemplo.com' ADMIN_PASSWORD='clave-larga' \
sh -c 'npx prisma db update --no-interactive && node dist/prisma/seed-admin.js'
```

(Es lo mismo que hace el servicio `migrate` del compose. Render Free no tiene pre-deploy command.)

### 2. API en Render

1. Sube el repo del backend a GitHub.
2. Render → *New* → *Blueprint* → elige el repo. Lee `render.yaml` y pide los valores marcados como secretos:
   `CORS_ORIGIN` (la URL de Pages del paso 3; puedes poner una provisional y cambiarla después),
   `DATABASE_URL`, `S3_BUCKET`, `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`.
   `JWT_SECRET` se genera solo.
3. Al terminar, abre `https://<servicio>.onrender.com/health` → `{"status":"ok"}`.

Cada `git push` a la rama principal redespliega.

### 3. Frontend en Cloudflare Pages

Pages → *Create* → *Connect to Git* → repo del frontend:

- Build command: `npm run build` · Output: `dist`
- Variable de entorno: `VITE_API_URL=https://<servicio>.onrender.com`

Pages sirve `index.html` en rutas desconocidas, así que las rutas de React Router funcionan al recargar.
Pon la URL final (`https://<proyecto>.pages.dev`) en `CORS_ORIGIN` de Render.

### 4. Ping para que no se duerma

En **cron-job.org** (o UptimeRobot), crea un monitor `GET https://<servicio>.onrender.com/health` cada 10 minutos.
Además te avisa por email si la API deja de responder.

### Qué sigue sin estar garantizado

- Render puede reiniciar el servicio (redeploys, mantenimiento): unos segundos o un minuto sin servicio.
- Si el ping falla un rato, el siguiente acceso tendrá el arranque en frío de 30–60 s.
- Para "nunca se cae" de verdad hace falta un plan de pago (Render Starter, un VPS pequeño, etc.).

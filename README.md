# 🍃 MongoDB + mongo-express en Docker (Windows)

Este proyecto despliega **MongoDB 7** con **persistencia** y un script de **inicialización** que crea una base de datos y un usuario de aplicación. Incluye **mongo-express** como interfaz gráfica web opcional protegida con **Basic Auth**.

---

## 📦 Estructura del proyecto

```
mongo-docker/
├─ docker-compose.yml
├─ .env              # (crear desde .env.example)
├─ init/
│  └─ 01-init.js
└─ scripts/
   └─ connect.ps1
```

---

## ✅ Requisitos

- **Windows 10/11** con **Docker Desktop** (WSL2 backend recomendado).
- Conectividad a Docker Hub (si estás detrás de proxy con inspección TLS, revisa *Troubleshooting*).
- ~512 MB de RAM libres para MongoDB.

---

## ⚙️ Variables (.env)

Crea `.env` en la raíz (o copia desde `.env.example`) con este contenido:

```ini
MONGO_INITDB_ROOT_USERNAME=root
MONGO_INITDB_ROOT_PASSWORD=Str0ngP@ssw0rd!2025
MONGO_INITDB_DATABASE=admin

APP_DB=mi_base_datos
APP_USER=usuario_app
APP_PASSWORD=Usu@rioP4ss2025!

MONGO_PORT=27017
MONGO_EXPRESS_PORT=8082

ME_CONFIG_BASICAUTH_USERNAME=admin
ME_CONFIG_BASICAUTH_PASSWORD=AdminP@ss2025!
```

> **Notas:**  
> - `MONGO_INITDB_ROOT_*` crea el usuario administrador inicial.  
> - El script `init/01-init.js` crea `APP_DB` + `APP_USER` con rol `readWrite`.  
> - Cambia las contraseñas antes de producción.

---

## 🧩 docker-compose.yml

Levanta MongoDB con volumen persistente y **mongo-express** como GUI:

```yaml
services:
  mongo:
    image: docker.io/library/mongo:7
    container_name: mongo_server
    restart: unless-stopped
    env_file: .env
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_INITDB_ROOT_USERNAME}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_INITDB_ROOT_PASSWORD}
      - MONGO_INITDB_DATABASE=${MONGO_INITDB_DATABASE}
      - TZ=Europe/Madrid
    ports:
      - "${MONGO_PORT}:27017"
    volumes:
      - mongo_data:/data/db
      - ./init:/docker-entrypoint-initdb.d:ro
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 10

  mongo-express:
    image: docker.io/library/mongo-express:latest
    container_name: mongo_express
    restart: unless-stopped
    env_file: .env
    environment:
      - ME_CONFIG_MONGODB_ADMINUSERNAME=${MONGO_INITDB_ROOT_USERNAME}
      - ME_CONFIG_MONGODB_ADMINPASSWORD=${MONGO_INITDB_ROOT_PASSWORD}
      - ME_CONFIG_MONGODB_SERVER=mongo
      - ME_CONFIG_BASICAUTH_USERNAME=${ME_CONFIG_BASICAUTH_USERNAME}
      - ME_CONFIG_BASICAUTH_PASSWORD=${ME_CONFIG_BASICAUTH_PASSWORD}
    ports:
      - "${MONGO_EXPRESS_PORT}:8081"
    depends_on:
      - mongo

volumes:
  mongo_data:
```

---

## ▶️ Puesta en marcha

1. **Crea `.env`** a partir de `.env.example` y ajusta variables.  
2. **Inicia servicios** (PowerShell/CMD dentro de la carpeta):
   ```powershell
   docker compose up -d
   ```
3. **Verifica**:
   ```powershell
   docker ps
   docker logs -f mongo_server
   ```

---

## 🔌 Conexión a la base de datos

### CLI (mongosh dentro del contenedor)
```powershell
docker exec -it mongo_server mongosh -u root -p "TU_ROOT_PASS" --authenticationDatabase admin
```
o con el script:
```powershell
.\scripts\connect.ps1
```

### GUI (mongo-express)
- Abre `http://localhost:8082`  
- Login **Basic Auth**: `ME_CONFIG_BASICAUTH_USERNAME` / `ME_CONFIG_BASICAUTH_PASSWORD`  
- El servidor ya está apuntado al servicio `mongo` con credenciales de admin.

---

## 🗄️ Persistencia y backups

- Los datos están en el volumen **`mongo_data`** (carpeta `/data/db`).  
- **Backup** sencillo (dump de la BBDD de app):
  ```powershell
  docker exec -i mongo_server mongodump -u root -p "TU_ROOT_PASS" --authenticationDatabase admin --db %APP_DB% --archive > backup_%APP_DB%.archive
  ```
- **Restore**:
  ```powershell
  type backup_%APP_DB%.archive | docker exec -i mongo_server mongorestore -u root -p "TU_ROOT_PASS" --authenticationDatabase admin --archive --nsInclude "%APP_DB%.*" --drop
  ```

---

## 🧹 Gestión rápida

- **Parar**: `docker compose down`  
- **Parar y borrar datos**: `docker compose down -v`  ⚠️ *(elimina la BBDD)*  
- **Actualizar imágenes**: `docker compose pull && docker compose up -d`

---

## 🛠️ Troubleshooting

- **Scripts de init**: se ejecutan **solo la primera vez** (cuando `mongo_data` está vacío). Para re-ejecutar, borra el volumen: `docker compose down -v`.  
- **TLS/x509 al hacer pull**: si estás tras proxy con inspección TLS, añade exclusiones **NO_PROXY** o instala la **CA corporativa** en Docker Desktop (igual que en los ejemplos de MySQL/SQL Server).  
- **Windows ARM**: si hay problemas con la imagen, usa emulación (`platform: linux/amd64`).  
- **mongo-express sin auth**: mantén la **Basic Auth** activada; no expongas el puerto sin protección en redes no confiables.

---

## 📥 Descarga rápida

- [Descargar `docker-compose.yml`](sandbox:/mnt/data/mongo-docker/docker-compose.yml)  
- [Descargar `.env.example`](sandbox:/mnt/data/mongo-docker/.env.example)  
- [Descargar `init/01-init.js`](sandbox:/mnt/data/mongo-docker/init/01-init.js)  
- [Descargar `scripts/connect.ps1`](sandbox:/mnt/data/mongo-docker/scripts/connect.ps1)  
- [Descargar `README.md`](sandbox:/mnt/data/mongo-docker/README.md)

---

¡Con esto tienes **MongoDB 7** con **persistencia**, **usuario de aplicación** y **mongo-express** listo para gestionar la base de datos por web!

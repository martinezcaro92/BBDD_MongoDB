# 🍃 MongoDB + mongo-express en Docker (Windows)

---

## 🌐 Índice de idiomas / Language Index / Sprachindex

| | Idioma | Sección |
|---|---|---|
| 🇪🇸 | Español | [Ver en español](#-versión-en-español) |
| 🇬🇧 | English | [View in English](#-english-version) |
| 🇩🇪 | Deutsch | [Auf Deutsch lesen](#-deutsche-version) |

---

---

# 🇪🇸 Versión en Español

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
- **Parar y borrar datos**: `docker compose down -v` ⚠️ *(elimina la BBDD)*
- **Actualizar imágenes**: `docker compose pull && docker compose up -d`

---

## 🛠️ Troubleshooting

- **Scripts de init**: se ejecutan **solo la primera vez** (cuando `mongo_data` está vacío). Para re-ejecutar, borra el volumen: `docker compose down -v`.
- **TLS/x509 al hacer pull**: si estás tras proxy con inspección TLS, añade exclusiones **NO_PROXY** o instala la **CA corporativa** en Docker Desktop.
- **Windows ARM**: si hay problemas con la imagen, usa emulación (`platform: linux/amd64`).
- **mongo-express sin auth**: mantén la **Basic Auth** activada; no expongas el puerto sin protección en redes no confiables.

---

[⬆️ Volver al índice](#-índice-de-idiomas--language-index--sprachindex)

---

---

# 🇬🇧 English Version

This project deploys **MongoDB 7** with **persistence** and an **initialization script** that creates a database and an application user. It includes **mongo-express** as an optional web GUI protected with **Basic Auth**.

---

## 📦 Project Structure

```
mongo-docker/
├─ docker-compose.yml
├─ .env              # (create from .env.example)
├─ init/
│  └─ 01-init.js
└─ scripts/
   └─ connect.ps1
```

---

## ✅ Requirements

- **Windows 10/11** with **Docker Desktop** (WSL2 backend recommended).
- Connectivity to Docker Hub (if you are behind a proxy with TLS inspection, check *Troubleshooting*).
- ~512 MB of free RAM for MongoDB.

---

## ⚙️ Variables (.env)

Create `.env` at the root (or copy from `.env.example`) with the following content:

```ini
MONGO_INITDB_ROOT_USERNAME=root
MONGO_INITDB_ROOT_PASSWORD=Str0ngP@ssw0rd!2025
MONGO_INITDB_DATABASE=admin

APP_DB=my_database
APP_USER=app_user
APP_PASSWORD=Usu@rioP4ss2025!

MONGO_PORT=27017
MONGO_EXPRESS_PORT=8082

ME_CONFIG_BASICAUTH_USERNAME=admin
ME_CONFIG_BASICAUTH_PASSWORD=AdminP@ss2025!
```

> **Notes:**
> - `MONGO_INITDB_ROOT_*` creates the initial admin user.
> - The `init/01-init.js` script creates `APP_DB` + `APP_USER` with `readWrite` role.
> - Change passwords before going to production.

---

## 🧩 docker-compose.yml

Starts MongoDB with a persistent volume and **mongo-express** as the GUI:

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

## ▶️ Getting Started

1. **Create `.env`** from `.env.example` and adjust the variables.
2. **Start services** (PowerShell/CMD inside the project folder):
   ```powershell
   docker compose up -d
   ```
3. **Verify**:
   ```powershell
   docker ps
   docker logs -f mongo_server
   ```

---

## 🔌 Connecting to the Database

### CLI (mongosh inside the container)
```powershell
docker exec -it mongo_server mongosh -u root -p "YOUR_ROOT_PASS" --authenticationDatabase admin
```
or using the script:
```powershell
.\scripts\connect.ps1
```

### GUI (mongo-express)
- Open `http://localhost:8082`
- **Basic Auth** login: `ME_CONFIG_BASICAUTH_USERNAME` / `ME_CONFIG_BASICAUTH_PASSWORD`
- The server is already pointing to the `mongo` service with admin credentials.

---

## 🗄️ Persistence and Backups

- Data is stored in the **`mongo_data`** volume (folder `/data/db`).
- Simple **backup** (dump of the app database):
  ```powershell
  docker exec -i mongo_server mongodump -u root -p "YOUR_ROOT_PASS" --authenticationDatabase admin --db %APP_DB% --archive > backup_%APP_DB%.archive
  ```
- **Restore**:
  ```powershell
  type backup_%APP_DB%.archive | docker exec -i mongo_server mongorestore -u root -p "YOUR_ROOT_PASS" --authenticationDatabase admin --archive --nsInclude "%APP_DB%.*" --drop
  ```

---

## 🧹 Quick Management

- **Stop**: `docker compose down`
- **Stop and delete data**: `docker compose down -v` ⚠️ *(removes the database)*
- **Update images**: `docker compose pull && docker compose up -d`

---

## 🛠️ Troubleshooting

- **Init scripts**: run **only the first time** (when `mongo_data` is empty). To re-run, delete the volume: `docker compose down -v`.
- **TLS/x509 when pulling**: if you are behind a proxy with TLS inspection, add **NO_PROXY** exclusions or install the **corporate CA** in Docker Desktop.
- **Windows ARM**: if there are issues with the image, use emulation (`platform: linux/amd64`).
- **mongo-express without auth**: keep **Basic Auth** enabled; do not expose the port without protection on untrusted networks.

---

[⬆️ Back to index](#-índice-de-idiomas--language-index--sprachindex)

---

---

# 🇩🇪 Deutsche Version

Dieses Projekt stellt **MongoDB 7** mit **Persistenz** und einem **Initialisierungsskript** bereit, das eine Datenbank und einen Anwendungsbenutzer erstellt. Es enthält **mongo-express** als optionale Web-GUI, die mit **Basic Auth** geschützt ist.

---

## 📦 Projektstruktur

```
mongo-docker/
├─ docker-compose.yml
├─ .env              # (aus .env.example erstellen)
├─ init/
│  └─ 01-init.js
└─ scripts/
   └─ connect.ps1
```

---

## ✅ Voraussetzungen

- **Windows 10/11** mit **Docker Desktop** (WSL2-Backend empfohlen).
- Verbindung zu Docker Hub (bei Proxy mit TLS-Inspektion *Troubleshooting* beachten).
- ~512 MB freier RAM für MongoDB.

---

## ⚙️ Variablen (.env)

Erstelle `.env` im Stammverzeichnis (oder kopiere aus `.env.example`) mit folgendem Inhalt:

```ini
MONGO_INITDB_ROOT_USERNAME=root
MONGO_INITDB_ROOT_PASSWORD=Str0ngP@ssw0rd!2025
MONGO_INITDB_DATABASE=admin

APP_DB=meine_datenbank
APP_USER=app_benutzer
APP_PASSWORD=Usu@rioP4ss2025!

MONGO_PORT=27017
MONGO_EXPRESS_PORT=8082

ME_CONFIG_BASICAUTH_USERNAME=admin
ME_CONFIG_BASICAUTH_PASSWORD=AdminP@ss2025!
```

> **Hinweise:**
> - `MONGO_INITDB_ROOT_*` erstellt den initialen Admin-Benutzer.
> - Das Skript `init/01-init.js` erstellt `APP_DB` + `APP_USER` mit der Rolle `readWrite`.
> - Passwörter vor dem Produktionseinsatz ändern.

---

## 🧩 docker-compose.yml

Startet MongoDB mit persistentem Volume und **mongo-express** als GUI:

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

## ▶️ Inbetriebnahme

1. **`.env` erstellen** aus `.env.example` und Variablen anpassen.
2. **Dienste starten** (PowerShell/CMD im Projektordner):
   ```powershell
   docker compose up -d
   ```
3. **Überprüfen**:
   ```powershell
   docker ps
   docker logs -f mongo_server
   ```

---

## 🔌 Verbindung zur Datenbank

### CLI (mongosh im Container)
```powershell
docker exec -it mongo_server mongosh -u root -p "DEIN_ROOT_PASSWORT" --authenticationDatabase admin
```
oder mit dem Skript:
```powershell
.\scripts\connect.ps1
```

### GUI (mongo-express)
- Öffne `http://localhost:8082`
- **Basic Auth**-Login: `ME_CONFIG_BASICAUTH_USERNAME` / `ME_CONFIG_BASICAUTH_PASSWORD`
- Der Server zeigt bereits auf den `mongo`-Dienst mit Admin-Zugangsdaten.

---

## 🗄️ Persistenz und Backups

- Daten befinden sich im Volume **`mongo_data`** (Ordner `/data/db`).
- Einfaches **Backup** (Dump der App-Datenbank):
  ```powershell
  docker exec -i mongo_server mongodump -u root -p "DEIN_ROOT_PASSWORT" --authenticationDatabase admin --db %APP_DB% --archive > backup_%APP_DB%.archive
  ```
- **Wiederherstellen**:
  ```powershell
  type backup_%APP_DB%.archive | docker exec -i mongo_server mongorestore -u root -p "DEIN_ROOT_PASSWORT" --authenticationDatabase admin --archive --nsInclude "%APP_DB%.*" --drop
  ```

---

## 🧹 Schnellverwaltung

- **Stoppen**: `docker compose down`
- **Stoppen und Daten löschen**: `docker compose down -v` ⚠️ *(löscht die Datenbank)*
- **Images aktualisieren**: `docker compose pull && docker compose up -d`

---

## 🛠️ Fehlerbehebung

- **Init-Skripte**: werden **nur beim ersten Start** ausgeführt (wenn `mongo_data` leer ist). Zum erneuten Ausführen Volume löschen: `docker compose down -v`.
- **TLS/x509 beim Pull**: bei Proxy mit TLS-Inspektion **NO_PROXY**-Ausnahmen hinzufügen oder das **Unternehmens-CA** in Docker Desktop installieren.
- **Windows ARM**: bei Problemen mit dem Image Emulation verwenden (`platform: linux/amd64`).
- **mongo-express ohne Auth**: **Basic Auth** aktiviert lassen; Port in nicht vertrauenswürdigen Netzwerken niemals ungeschützt exponieren.

---

[⬆️ Zurück zum Index](#-índice-de-idiomas--language-index--sprachindex)
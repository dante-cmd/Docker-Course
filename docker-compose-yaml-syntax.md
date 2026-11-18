# Docker Compose YAML Syntax — Complete Guide

## 1. Top-Level Structure

A `docker-compose.yml` file has these top-level keys:

```yaml
name: myproject        # (optional) project name, used as prefix for resources
services:              # the containers your app runs (required)
  ...
networks:              # custom networks (optional)
  ...
volumes:               # named volumes for persistent data (optional)
  ...
configs:               # config files mounted into containers (optional)
  ...
secrets:               # sensitive data mounted into containers (optional)
  ...
```

> **Note:** The old `version: "3.8"` key is **obsolete** — modern Docker Compose ignores it.

---

## 2. `services` — The Core

Each service is a container definition. Full syntax, organized by category:

```yaml
services:
  app:                              # service name (used for DNS between containers)
```

### 2.1 Image & Build

```yaml
    image: nginx:1.25-alpine        # pull an existing image from a registry

    # OR build from a Dockerfile:
    build: .                        # shorthand: build context = current dir

    # OR the long form:
    build:
      context: ./app                # directory sent to the Docker daemon
      dockerfile: Dockerfile.dev    # Dockerfile name (default: Dockerfile)
      args:                         # build-time variables (ARG in Dockerfile)
        NODE_ENV: production
      target: builder               # stop at a stage in a multi-stage build
      cache_from:                   # images to use as cache sources
        - myregistry/app:cache

    container_name: my-app          # fixed container name (limits scaling to 1)
    pull_policy: always             # always | never | missing | build
```

### 2.2 Command & Startup

```yaml
    command: ["python", "manage.py", "runserver"]   # overrides CMD (list or string)
    entrypoint: ["/entrypoint.sh"]                  # overrides ENTRYPOINT
    working_dir: /app               # working directory inside container
    user: "1000:1000"               # user:group to run as
    restart: unless-stopped         # no | always | on-failure[:max] | unless-stopped
    init: true                      # run a tiny init as PID 1 (reaps zombie processes)
    stop_grace_period: 30s          # time to wait before SIGKILL after SIGTERM
    tty: true                       # allocate a pseudo-TTY (like docker run -t)
    stdin_open: true                # keep stdin open (like docker run -i)
```

### 2.3 Ports

```yaml
    ports:
      - "8080:80"                   # HOST_PORT:CONTAINER_PORT
      - "127.0.0.1:8080:80"         # bind only to localhost (more secure)
      - "8080:80/tcp"               # explicit protocol
      - "53:53/udp"                 # UDP example
      - "3000"                      # container port only → random host port
      - target: 80                  # long syntax
        published: 8080
        protocol: tcp
        mode: host

    expose:
      - "3000"                      # reachable by OTHER containers only, not the host
```

> **Key difference:** `ports` publishes to the host; `expose` is internal-only documentation/access.

### 2.4 Environment Variables

```yaml
    environment:                    # map syntax
      NODE_ENV: production
      DB_HOST: db
      DB_PORT: 5432

    environment:                    # OR list syntax
      - NODE_ENV=production
      - DB_HOST=db

    env_file:                       # load variables from file(s)
      - .env
      - path: ./secrets.env
        required: false             # don't fail if file is missing
```

**Variable interpolation** — Compose substitutes `${...}` from your shell or the `.env` file next to the compose file:

```yaml
      DB_USER: ${POSTGRES_USER:-postgres}     # default if unset or empty
      DB_PASS: ${POSTGRES_PASSWORD:?must set} # error if unset
      TAG: ${APP_VERSION-latest}              # default only if unset
      LITERAL: $${escaped}                    # $$ escapes a literal $
```

### 2.5 Volumes (Mounts)

```yaml
    volumes:
      - db-data:/var/lib/postgresql/data   # named volume (persistent)
      - ./src:/app/src                     # bind mount: host dir → container
      - ./config.yml:/etc/app/config.yml:ro  # read-only bind mount
      - /app/node_modules                  # anonymous volume (protects from overwrite)
      - type: bind                         # long syntax
        source: ./src
        target: /app/src
      - type: volume
        source: db-data
        target: /var/lib/data
        volume:
          nocopy: true
```

| Type | Syntax | Use case |
|---|---|---|
| Named volume | `name:/path` | Data that must persist (databases) |
| Bind mount | `./host:/container` | Live code during development |
| Anonymous | `/path` | Shield a dir from bind-mount overwrite |

### 2.6 Networking

```yaml
    networks:                       # which networks this service joins
      - frontend
      - backend
    # long form:
    networks:
      frontend:
        aliases:
          - api.internal            # extra DNS names for this container
      backend:
        ipv4_address: 172.20.0.5

    hostname: webserver             # container's hostname
    extra_hosts:                    # add entries to /etc/hosts
      - "myhost:192.168.1.10"
    dns:                            # custom DNS servers
      - 8.8.8.8
    network_mode: host              # host | none | service:name | container:name
```

> By default, all services join one shared network and can reach each other **by service name** (`db`, `api`, etc.) — that's built-in DNS.

### 2.7 Dependencies

```yaml
    depends_on:                     # simple: just startup ORDER (not readiness)
      - db
      - redis

    depends_on:                     # long form with conditions:
      db:
        condition: service_healthy  # wait for healthcheck to pass
        restart: true               # restart me if db restarts
      redis:
        condition: service_started  # just wait for container start
      migrations:
        condition: service_completed_successfully  # wait for exit code 0
```

### 2.8 Healthcheck

```yaml
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]   # or "NONE" to disable
      interval: 5s                  # time between checks
      timeout: 5s                   # max time one check may take
      retries: 5                    # consecutive failures → unhealthy
      start_period: 10s             # grace period; failures here don't count
      start_interval: 1s            # check frequency during start_period
      # during that start_period, checks run more frequently (every 1s instead of every 5s), so Docker can detect "ready" as soon as possible rather than waiting a full 5s interval. Once start_period ends, it switches to the normal interval.
```

### 2.9 Resource Limits & Platform

```yaml
    deploy:
      resources:
        limits:
          cpus: "0.50"
          memory: 512M
        reservations:
          memory: 256M
      replicas: 3                   # swarm mode (ignored by docker compose up)
      restart_policy:
        condition: on-failure

    # Compose-native alternative (works without swarm):
    mem_limit: 512m
    cpus: 0.5
    platform: linux/amd64           # force architecture (e.g. on Apple Silicon)
```

### 2.10 Logging

```yaml
    logging:
      driver: json-file             # json-file | syslog | journald | none
      options:
        max-size: "10m"             # rotate at 10 MB
        max-file: "3"               # keep 3 old files
```

### 2.11 Security & Isolation

```yaml
    privileged: true                # full host access (avoid if possible)
    read_only: true                 # read-only root filesystem
    cap_add:                        # add Linux capabilities
      - NET_ADMIN
    cap_drop:
      - ALL
    security_opt:
      - no-new-privileges:true
    tmpfs:                          # in-memory temp filesystem
      - /tmp
```

### 2.12 Labels & Metadata

```yaml
    labels:
      com.example.description: "Web server"
      traefik.enable: "true"        # commonly used by reverse proxies
```

---

## 3. Top-Level `volumes`

```yaml
volumes:
  db-data:                          # simplest form — Docker manages it
  app-data:
    driver: local
    driver_opts:
      type: none                    # mount a specific host path as a volume
      o: bind
      device: /srv/app-data
  external-vol:
    external: true                  # use a volume created outside Compose
    name: my-existing-volume
```

## 4. Top-Level `networks`

```yaml
networks:
  frontend:                         # simplest form
  backend:
    driver: bridge
    internal: true                  # no external internet access
    ipam:
      config:
        - subnet: 172.20.0.0/24
  proxy-net:
    external: true                  # already exists outside this project
```

## 5. `configs` and `secrets`

```yaml
configs:
  nginx_conf:
    file: ./nginx.conf

secrets:
  db_password:
    file: ./db_password.txt         # mounted at /run/secrets/db_password
```

Used in a service:

```yaml
    secrets:
      - db_password
    configs:
      - source: nginx_conf
        target: /etc/nginx/nginx.conf
```

---

## 6. Advanced Features

### Profiles — start services conditionally

```yaml
    profiles: ["debug"]             # only starts with:
                                    # docker compose --profile debug up
```

### Multiple files & overrides

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up
```

### `extends` — reuse config

```yaml
services:
  worker:
    extends:
      file: common.yml
      service: base
```

### Anchors — YAML-native reuse

```yaml
x-common-env: &common-env
  LOG_LEVEL: info
  TZ: America/Lima

services:
  api:
    environment: *common-env
  worker:
    environment: *common-env
```

---

## 7. Complete Realistic Example

```yaml
name: ecommerce

services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?set it}
      POSTGRES_DB: ecommerce
    volumes:
      - db-data:/var/lib/postgresql/data
    networks:
      - backend
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-postgres}"]
      interval: 5s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  api:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://db:5432/ecommerce
    depends_on:
      db:
        condition: service_healthy
    networks:
      - frontend
      - backend
    restart: unless-stopped

volumes:
  db-data:

networks:
  frontend:
  backend:
    internal: true
```

**Common commands:**

```bash
docker compose up -d          # create & start in background
docker compose down           # stop & remove containers/networks
docker compose down -v        # also delete named volumes
docker compose logs -f api    # follow logs of one service
docker compose ps             # status
docker compose exec db psql -U postgres   # shell into a running container
docker compose config         # validate & show the resolved YAML
```

Want me to go deeper on any section — for example, how networking/DNS resolution works between services, or volume backup strategies?
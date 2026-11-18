# YAML in Docker

## 1. What YAML is

YAML ("YAML Ain't Markup Language") is a human-readable data format built on indentation. In Docker's world, its main use is the **Compose file** (`compose.yaml`), which describes a multi-container application. It also appears in Docker Swarm stack files, and in tools around Docker such as GitHub Actions and Kubernetes manifests.

### Core syntax

```yaml
# Comment
key: value                 # mapping (key-value pair)
name: "quoted string"
count: 3                   # integer
enabled: true              # boolean
nothing: null              # null

list_block:                # sequence (list)
  - one
  - two

list_inline: [one, two]
map_inline: {a: 1, b: 2}

nested:
  child:
    grandchild: value

multiline_keep: |          # keeps line breaks
  line 1
  line 2

multiline_fold: >          # folds lines into one
  this becomes
  a single line
```

**Rules that matter:**
- Indentation uses **spaces only, never tabs**. Two spaces is the convention.
- Items at the same level must have the same indentation.
- A space is required after `:` and after `-`.

## 2. The Compose file

Docker Compose reads `compose.yaml` (or `docker-compose.yml`, which is still supported). Top-level sections:

```yaml
name: myapp            # optional project name

services:              # the containers (required)
networks:              # custom networks
volumes:               # named volumes
configs:               # config files
secrets:               # sensitive data
```

The old `version: "3.8"` key is **obsolete**. Modern Compose ignores it and warns if present.

## 3. A realistic example

```yaml
name: myapp

services:
  web:
    build:
      context: ./web
      dockerfile: Dockerfile
      args:
        NODE_ENV: production
    image: myapp-web:1.0
    container_name: myapp-web
    ports:
      - "8080:3000"            # host:container
    environment:
      DATABASE_URL: postgres://user:pass@db:5432/app
      LOG_LEVEL: info
    env_file:
      - .env
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - ./web/src:/app/src     # bind mount
      - uploads:/app/uploads   # named volume
    networks:
      - backend
    restart: unless-stopped

  db:
    image: postgres:16
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
      POSTGRES_DB: app
    volumes:
      - pgdata:/var/lib/postgresql/data
    secrets:
      - db_password
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d app"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - backend

networks:
  backend:

volumes:
  pgdata:
  uploads:

secrets:
  db_password:
    file: ./secrets/db_password.txt
```

## 4. Service options

| Option | Purpose |
|---|---|
| `image` | Image to run or pull |
| `build` | Build from a Dockerfile (string path or object with `context`, `dockerfile`, `args`, `target`) |
| `command` | Overrides the image's `CMD` |
| `entrypoint` | Overrides the image's `ENTRYPOINT` |
| `ports` | Publish ports (`"host:container"`) |
| `expose` | Expose ports to other containers only |
| `environment` | Env vars (map or list form) |
| `env_file` | Load env vars from file(s) |
| `volumes` | Bind mounts and named volumes |
| `networks` | Networks to join |
| `depends_on` | Startup ordering, optionally with health conditions |
| `restart` | `no`, `always`, `on-failure`, `unless-stopped` |
| `healthcheck` | How Docker tests container health |
| `deploy` | Resources and replicas (`resources.limits`, `replicas`) |
| `profiles` | Only start the service when a profile is enabled |
| `user`, `working_dir` | Runtime user and working directory |
| `extra_hosts`, `dns` | Networking tweaks |

Two equivalent forms for `environment`:

```yaml
environment:
  KEY: value          # map form

environment:
  - KEY=value         # list form
```

## 5. Volumes: short vs long syntax

```yaml
volumes:
  - ./data:/data:ro                 # short syntax, read-only

  - type: bind                      # long syntax, more explicit
    source: ./data
    target: /data
    read_only: true
```

The long form is clearer and supports more options. Short ports work the same way: `"8080:80"` or a long form with `target`, `published`, and `protocol`.

## 6. Variable interpolation

Compose substitutes `${VAR}` from your shell or a `.env` file:

```yaml
services:
  app:
    image: myapp:${TAG:-latest}        # default if unset/empty
    environment:
      API_KEY: ${API_KEY:?API_KEY is required}   # error if unset
```

Syntax options: `${VAR}`, `${VAR:-default}`, `${VAR-default}`, `${VAR:?error}`. Use `$$` for a literal `$`.

## 7. Reuse with anchors, aliases, and extensions

YAML has built-in reuse features that Compose supports.

```yaml
x-common: &common            # "x-" prefix = ignored by Compose
  restart: unless-stopped
  networks:
    - backend
  environment: &common-env
    TZ: America/Lima

services:
  api:
    <<: *common              # merge the anchor
    image: myapi
    environment:
      <<: *common-env  # if this is missing, the enviroment block that come from the *common would be replaced by the one defined in the api service, so the TZ var would be lost. To avoid this, we can merge the common-env block into the api service's environment block.
      PORT: 3000   

  worker:
    <<: *common
    image: myworker
```

- `&name` defines an anchor.
- `*name` references it.
- `<<:` merges a mapping into the current one.
- Top-level keys starting with `x-` are extension fields, which are a good place to put shared blocks.

Newer Compose versions also support `extends` and `include` for sharing across files.

## 8. Multiple files and overrides

Compose automatically merges `compose.yaml` with `compose.override.yaml`. You can also specify files explicitly:

```bash
docker compose -f compose.yaml -f compose.prod.yaml up -d
```

Later files override earlier ones: single values are replaced, maps are merged, and lists such as `ports` are generally appended.

## 9. Profiles

```yaml
services:
  app:
    image: myapp
  debug-tools:
    image: busybox
    profiles: ["debug"]
```

```bash
docker compose up                      # starts only app
docker compose --profile debug up      # starts both
```

## 10. Common commands

```bash
docker compose up -d            # create and start in background
docker compose down             # stop and remove containers/networks
docker compose down -v          # also remove named volumes
docker compose ps               # list services
docker compose logs -f web      # follow logs
docker compose build            # build images
docker compose config           # validate and print the resolved file
docker compose exec web sh      # shell into a running service
```

`docker compose config` is the best way to debug YAML issues, because it shows exactly how Compose interpreted your file after interpolation and merging.

## 11. Common pitfalls

1. **Tabs instead of spaces** cause a parse error.
2. **Quote port mappings.** `22:22` can be misparsed as a base-60 number in YAML 1.1. Write `"22:22"`.
3. **Boolean surprises.** Unquoted `yes`, `no`, `on`, `off` can become booleans. Quote them if you mean strings: `"yes"`.
4. **Env var values must be strings or numbers.** Quote values like `"true"` if the container expects the literal string.
5. **Special characters.** Values with `:`, `#`, `@`, or leading `*`, `&`, `!` need quotes.
6. **Wrong indentation level** silently changes meaning, for example a key ending up under the wrong service.
7. **`depends_on` only controls start order**, not readiness. Use `condition: service_healthy` with a `healthcheck`.
8. **Relative paths** resolve relative to the Compose file's directory, not where you run the command.
9. **Don't hardcode secrets** in the YAML. Use `secrets`, `env_file`, or environment variables.
10. **Duplicate keys** (such as two `ports:` in one service) are errors or silently overridden.

## 12. Other places YAML shows up around Docker

- **Docker Swarm stacks:** the same Compose format, deployed with `docker stack deploy -c compose.yaml mystack`, using the `deploy:` section for replicas, rolling updates, and placement.
- **CI/CD** (GitHub Actions, GitLab CI): YAML pipelines that build and push images.
- **Kubernetes:** separate YAML manifests (`Deployment`, `Service`, and so on) that run Docker-built images. It is a different schema from Compose.

Note that the **Dockerfile is not YAML**. It has its own instruction syntax (`FROM`, `RUN`, `COPY`, and so on).

If you'd like, I can walk through converting a `docker run` command into a Compose file, or review a Compose file you're working on.
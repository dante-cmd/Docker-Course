# Docker Networking — Full Explanation

## 1. Why Docker Networking Exists

Containers are isolated processes. By default, a container:

- Gets its **own network stack** (its own IP address, interfaces, routing table)
- Cannot see other containers' traffic
- Cannot be reached from the outside world unless you explicitly allow it

Docker networking is the layer that answers three questions:

1. **Container ↔ Container** — can my API reach my database?
2. **Container ↔ Host/Internet** — can users reach my app? Can my app call external APIs?
3. **How do containers find each other** — by what address?

---

## 2. Network Drivers (the types of networks)

Docker implements networking through **drivers**:

| Driver | What it does | Use case |
|---|---|---|
| `bridge` | Virtual private network on one host (the default) | Normal containers on a single machine |
| `host` | Container shares the host's network stack directly | Maximum performance; Linux only |
| `none` | No networking at all | Fully isolated/sandboxed containers |
| `overlay` | Network spanning **multiple Docker hosts** | Docker Swarm clusters |
| `macvlan` | Container gets its own MAC address, appears as a physical device on your LAN | Legacy apps expecting to be "on the network" |
| `ipvlan` | Similar to macvlan, shares the host's MAC | Specialized infrastructure cases |

For 95% of development work, **`bridge` is all you need.**

---

## 3. The Default Networks

A fresh Docker installation has three networks:

```bash
$ docker network ls
NETWORK ID     NAME      DRIVER    SCOPE
a1b2c3d4e5     bridge    bridge    local
f6g7h8i9j0     host      host      local
k1l2m3n4o5     none      null      local
```

### `bridge` (docker0)

- A virtual switch created on your machine (`docker0` interface, usually `172.17.0.0/16`).
- Every container started **without specifying a network** lands here and gets an IP like `172.17.0.2`.
- Containers can reach each other **by IP only** — no name resolution on the default bridge.

### `host`

```bash
docker run --network host nginx
```

- The container uses your machine's network directly. Nginx on port 80 binds to **your** port 80 — no `-p` flag needed (it's ignored).
- No isolation. Mostly for performance-sensitive workloads.

### `none`

```bash
docker run --network none myapp
```

- Container has only `localhost`. Total isolation — useful for untrusted code or batch jobs that need no network.

---

## 4. User-Defined Bridge Networks (the important one)

```bash
docker network create mynet
docker run -d --name db --network mynet postgres:16-alpine
docker run -d --name api --network mynet myapi
```

This is where the magic happens. A user-defined bridge gives you:

### ✅ Built-in DNS resolution

Containers on a user-defined network can reach each other **by container name**:

```
┌─────────────────── mynet ───────────────────┐
│                                             │
│   api (172.18.0.2)      db (172.18.0.3)     │
│        │                   ▲                │
│        └─── api resolves "db" → 172.18.0.3 ──┘
│            via Docker's embedded DNS server │
└─────────────────────────────────────────────┘
```

So inside `api`, this just works:

```
postgresql://db:5432/ecommerce
        #     ^^ the container name IS the hostname
```

This is critical: **IPs change** when containers restart or recreate; **names don't**. Never hardcode container IPs.

### ✅ Better isolation

Containers on `mynet` **cannot** talk to containers on `othernet` — the networks are separate LANs.

### ✅ Automatic when using Compose

You rarely run `docker network create` by hand because **Docker Compose creates a user-defined network for you automatically** — more on that in section 6.

---

## 5. Container ↔ Outside World: Publishing Ports

A container on a bridge network is **invisible from outside** until you publish a port:

```bash
docker run -d -p 8080:80 nginx
```

```
┌─────────────── Your machine ───────────────┐
│                                            │
│   Browser ──▶ localhost:8080 ──┐           │
│                                │ DNAT      │
│                        ┌───────▼───────┐   │
│                        │ nginx         │   │
│                        │ port 80       │   │
│                        └───────────────┘   │
│                  bridge network            │
└────────────────────────────────────────────┘
```

Docker programs the host's firewall (iptables/nftables) so traffic to `host:8080` is forwarded to `container:80`.

### Key distinctions (recap from earlier)

```yaml
ports:
  - "8080:80"        # HOST publishes 8080 → forwards into container's 80
                     # anyone who can reach your machine can hit it

  - "127.0.0.1:8080:80"   # only reachable from the host itself (safer for dev DBs)

expose:
  - "5432"           # NOT published to host; only containers on the same
                     # network can reach it. Largely documentation.
```

**Common pattern:** your API publishes a port (users need it), your database publishes **none** (only the API should reach it, and they're on the same network anyway).

### Outbound traffic

Containers can reach the **internet by default** (outbound NAT through the host). No configuration needed — your app can call external APIs freely.

---

## 6. Networking in Docker Compose

### The default: one network per project

```yaml
services:
  api:
    build: .
    ports:
      - "8000:8000"
  db:
    image: postgres:16-alpine
```

With **zero** network configuration, Compose:

1. Creates a network named `<project>_default` (e.g., `ecommerce_default`)
2. Puts **every service** on it
3. Registers each service name in the embedded DNS

So `api` can immediately use `postgresql://db:5432/...` — the service name `db` resolves automatically. This is the single most useful networking fact in Compose.

### Multiple networks: tiered isolation

The classic production pattern — the database must **never** be reachable from the public-facing side:

```yaml
services:
  api:
    build: .
    ports:
      - "8000:8000"
    networks:
      - frontend        # reachable path from outside
      - backend         # can also talk to db

  db:
    image: postgres:16-alpine
    networks:
      - backend         # ONLY here — no frontend access

networks:
  frontend:
  backend:
    internal: true      # bonus: no internet access at all
```

```
        Internet
            │
            ▼  :8000
   ┌───── frontend ─────┐
   │        api         │
   └─────────┬──────────┘
             │
   ┌───── backend ───────┐      (internal: no internet)
   │    api        db    │
   └─────────────────────┘
```

- A browser can reach `api`, but there is **no network path** from outside to `db`.
- `db` isn't even published on any host port — it only listens on the `backend` network.

### Aliases

Give a service extra DNS names:

```yaml
services:
  api:
    networks:
      frontend:
        aliases:
          - backend.internal
          - api.local
```

Other containers on `frontend` can now reach it as `api`, `backend.internal`, or `api.local`. Useful when migrating service names or simulating production hostnames.

### The full `networks` reference in Compose

```yaml
services:
  app:
    networks:
      mynet:                    # short syntax: just a list item
      othernet:                 # long syntax with options
        aliases: ["app.local"]
        ipv4_address: 172.20.0.5   # static IP (rarely needed)

networks:
  mynet:
    driver: bridge
    internal: true              # no outbound internet
    driver_opts:                # driver-specific options
      com.docker.network.bridge.name: br-mynet
    ipam:                       # IP Address Management
      config:
        - subnet: 172.20.0.0/16
  existing-net:
    external: true              # use a network created outside this project
    name: shared-infra
```

`external: true` is how **two separate Compose projects** share a network — project A defines `shared-infra`, project B references it as external, and their containers can now resolve each other.

### Extra DNS / hosts customization

```yaml
services:
  app:
    extra_hosts:                 # entries into the container's /etc/hosts
      - "host.docker.internal:host-gateway"   # reach the HOST machine from inside
    dns:
      - 8.8.8.8                  # custom DNS servers
```

`host.docker.internal:host-gateway` deserves special mention: it's the standard way for a container to call a service running **on your host machine** (e.g., a local dev server outside Docker). On Mac/Windows `host.docker.internal` works out of the box; on Linux you need the `host-gateway` mapping above.

---

## 7. Inspecting and Debugging

```bash
# List networks
docker network ls

# Inspect one: shows subnet, gateway, and attached containers with their IPs
docker network inspect ecommerce_default

# Which networks is a container on?
docker inspect -f '{{json .NetworkSettings.Networks}}' mycontainer

# From inside a container: test DNS + connectivity
docker compose exec api ping db
docker compose exec api nslookup db        # should return an IP like 172.x.x.x
docker compose exec api curl -v http://db:5432

# See published port mappings
docker compose ps
docker port mycontainer
```

### The classic debugging flow

> "My API can't reach the database, `connection refused`"

1. **Same network?** → `docker network inspect <net>` and check both containers are listed.
2. **Using the right name?** → the hostname must be the *service name* (`db`), not `localhost`. **Inside a container, `localhost` is the container itself** — the #1 beginner mistake.
3. **Right port?** → use the **container port** (`5432`), not any published host port. Published ports are for the outside; container-to-container traffic bypasses them entirely.
4. **Is it ready?** → the container is up but Postgres is still initializing → healthcheck + `depends_on: condition: service_healthy` (as in your earlier config).
5. **DNS working?** → `ping db` from inside the API container.

---

## 8. Summary Mental Model

```
                 ┌─── ports: "8080:80" ───┐
                 │                        │
 Internet ───────┼──▶ HOST ──▶ [bridge network]          internal DNS:
                 │            api ◀──────▶ db        "db" → 172.18.0.3
                 │            (only same-network           "api" → 172.18.0.2
                 │             containers can talk)
                 │
   host network: container = host (no isolation)
   none network: container alone with localhost
```

**The five rules that cover 95% of real work:**

1. Compose puts all services on one shared network with **DNS by service name** — use `db:5432`, never IPs.
2. Inside a container, `localhost` means **itself**, not your machine or other containers.
3. `ports` exposes to the outside; containers on the same network don't need it to talk to each other.
4. Multiple networks + `internal: true` isolate tiers (public API vs. private DB).
5. IPs are ephemeral; names are stable — always connect by name.

Want to go deeper on any branch — overlay networks / Swarm, how the embedded DNS server actually works, or a hands-on exercise isolating a three-tier app?
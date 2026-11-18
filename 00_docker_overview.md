<div style="text-align: right;">
<img src="https://upload.wikimedia.org/wikipedia/commons/1/1e/Docker_Logo.png" alt="Docker Logo" width="150"/>
</div>

# Docker Container

**Docker** It is a platform for developing, shipping (put into production), and running application

Docker allow us package and run application in a isolation enviroment called *container*.  The *isolation* and *security* lets you to run many containers simultaneously on a given host. It uses OS-level virtualization (not at hardware level like VM), therefore containers share the host OS kernel.

Containers are lightweight and contain everything needed to run the application,

**Docker for Desktop** is a one-click-install application for your Mac, Linux, or Windows environment that lets you build, share, and run containerized applications and microservices.

What's included in Docker Desktop?

* *Docker Engine*: is the core component that runs and manages Docker containers. It consists of three main parts (Server, REST API, CLI).
* *Docker Build*: is the command or process used to create a Docker image from a set of instructions defined in a **Dockerfile**.
* *Docker Compose*: is a tool for defining and running multi-container Docker applications. Instead of running multiple separate docker run commands, you define all your application's services, networks, and volumes in a single YAML file (typically docker-compose.yaml). This makes it easy to:
  - Start and stop an entire application with a single command (docker compose up).
  - Ensure all parts of a complex application (like a web app, database, and a caching service) are configured and run correctly together.
* ...

### Container

* It is a lightweight, standalone, and executable software package that includes everything needed to run an application:
  source code, runtime, libraries, environment variables, and configuration files. Containers are isolated from each other and the host system, ensuring consistency across different environments (e.g., development, testing, production). They are a key technology in modern software development and deployment, enabling portability, scalability, and efficiency.

  * *Isolation*: Containers run in isolated environments, meaning they do not interfere with each other or the host system.
  Each container has its own filesystem, network interfaces, and processes.
  * *Portability*: Containers encapsulate all dependencies, making them portable across different systems (e.g., laptops, servers, cloud environments).
  This ensures that applications behave consistently regardless of where they are deployed.
  * *Lightweight*: Unlike virtual machines (VMs), containers share the host operating system's kernel, which makes them faster to start and more resource-efficient.
  * *Consistency*: Containers ensure that applications behave the same way in development, testing, and production environments, reducing "it works on my machine" issues.
  * *Scalability*: Containers can be easily scaled up or down to meet demand, making them ideal for modern cloud-native applications.

* A major difference is that containers do not require their own full OS. In fact, all containers on a single host share the host's OS. This frees up huge amounts of system resources such as CPU, RAM, and storage.

> The **Windows Subsystem for Linux** (WSL) is a powerful feature in Windows that allows developers to run a Linux environment directly on their Windows machine, without the overhead of a traditional virtual machine or the need for dual-booting.
>
> It is primarily designed to enable developers—especially those in web and open-source fields—to use Linux command-line tools, utilities, and applications seamlessly alongside their standard Windows desktop and applications.

Thanks to WSL it is possible to run Linux containers on Windows machines.

### How does a container work?

1. The Container Image (The Blueprint): Before a container can run, it must be packaged into a **Container Image**.

    * **Definition:** An image is a static, immutable file that contains everything needed to run an application: the application code, a runtime (like Python or Java), essential system libraries, binaries, and configuration files.
    * **Layering:** Images are built using a stack of **read-only layers**. When you make a change (e.g., install a package), a new layer is created. This layering system is highly efficient, as identical base layers can be shared among many different images, reducing disk usage.
    * **Read-Only Filesystem:** When a container starts, the image layers form the foundation, creating a read-only filesystem.

2. Container Instantiation (The Running Process): When you run an image (creating a container), the container runtime (like Docker Engine) leverages kernel features to isolate the process.

    * **The Container is a Process:** Fundamentally, a container is just an **isolated process** running on the host OS.
    * **The Writable Layer:** The container runtime adds a thin, **writable layer** on top of the image's read-only layers. All changes the running application makes (new files, logs, etc.) are written to this layer, preserving the immutability of the underlying image.

3. Core Isolation Technologies: The isolation that makes a container feel like a separate machine is achieved through two main Linux kernel features:

    A. Namespaces (Isolation/Visibility)
    Namespaces provide the illusion of a completely separate operating system by isolating specific system resources. They control **what a container can see**.

    | Namespace | What it Isolates (What the Container Sees) | Example |
    | --------- | ------------------------------------------ | ------- |
    | **PID** (Process ID) | The process tree. | The container's main process appears as **PID 1** inside the container, and it cannot see processes running outside of it on the host. |
    | **NET** (Network) | The network stack. | The container gets its own IP address, routing table, and network interfaces, separate from the host's and other containers'. |
    | **MNT** (Mount) | The filesystem mount points. | The container sees its own root filesystem (defined by the image) and cannot access the host's files unless explicitly mounted. |
    | **UTS** (Hostname) | Hostname and domain name. | The container can have its own unique hostname. |
    | **User** | User and group IDs. | Allows a user to be `root` inside the container, but be mapped to an unprivileged user on the host for security. |

    B. Control Groups (cgroups) (Resource Management)
    Cgroups are responsible for **managing and limiting the resources** a container can consume. They control **what a container can use**.

    * **Resource Limits:** Cgroups prevent a single rogue container from consuming all of a host's resources.
    * **Examples:** You can use cgroups to limit a container to a specific amount of **CPU time**, **RAM**, **network bandwidth**, and **disk I/O**.

>  The Ops Perspective:
>
> When you install Docker, you get two major components: the Docker `client` and the Docker `daemon` (sometimes called the "Docker engine", server)

## Docker CLI

Docker CLI (Command Line Interface) is the primary way users interact with Docker. It provides a set of commands that allow you to manage Docker containers, images, networks, and volumes. The CLI communicates with the Docker daemon to execute these commands.

```bash
docker desktop start
```

## Images

It's useful to think of a Docker image as an object that contains an OS filesystem, an application, and all application dependencies.

We can get images from Docker Hub: https://hub.docker.com/

The syntax is:

```bash
docker pull <image_name>:<tag>-<flavor>
```
The `<tag>:<flavor>` is optional. If we don't pass this option, then Docker will pull the `latest` version.

Every image get its own and unique `ID`

```bash
  docker images
```

* We can call the images by its names or its `ID`
* When we work with its IDs we only need type words as long as it's unique.

### Example for **Python**

It is mantained by Docker community and Python maintainers

```bash
docker pull python:3.12-slim
```
It contains

1. A minimal Linux operating system environment (the base layer).
2. The Python interpreter (e.g., Python 3.12, 3.11, etc.).
3. Essential libraries and utilities needed to run Python and manage packages (like pip).

**Tags**

These *tags* specify the Python version installed in the image

**Flavor**

The base Linux distribution used dictates the size and complexity of the image. Choosing the correct variant is the most crucial step for production containerization.

1. Full (e.g., python:3.12)
   * Base OS: A full-featured Debian distribution.
   * Pros: Includes many standard tools, compilers (gcc), and libraries that your application might implicitly need for building wheels or  compiling C extensions.
   * Cons: Largest size, leading to slower build times and more attack surface (more installed packages = more potential security  vulnerabilities).

2. Slim (e.g., python:3.12-slim)
   * Base OS: A minimal Debian distribution.
   * Pros: Significantly smaller than the full tag. It usually strips out documentation and non-essential packages. This is a common and  recommended choice.
   * Cons: Does not include compilers or common build tools. If your Python dependencies require compiling C extensions (e.g., NumPy,  Pandas), the build will likely fail.

3. Alpine (e.g., python:3.12-alpine)
   * Base OS: Alpine Linux, which uses musl libc instead of the standard GNU libc (glibc).
   * Pros: The smallest official Python images. Excellent for minimizing image size.
   * Cons: Can be challenging. Due to using musl libc, some pre-compiled Python packages (wheels) built for glibc will not work, forcing  them to be compiled from source or requiring specific musl-compatible wheels.

rc:release candidate

## Containers

Once we have the images we can run them
```bash
docker container run -it python:3.12-slim bash
```
It point outs that Docker will run the container in interactive mode (-it) and attach the current shell to container's terminal

```bash
root@913d58d37125:/#
```
where `913d58d37125` is the ID of the container

In this terminal we can run commands.
```bash
python3 -c "print('Hello World!')"
```

> To go out of the container's terminal  `ctrl+d`
>
> If we want to navigate inside container's terminal we can use the commands of `bash`.

`-it` is for interactive mode, that is, the container will be run in interactive mode and attach the current shell to the container's terminal

### Running containers

We can see the container is running. Here `ps` means *process*.
```bash
docker container ps
```

We can see the container have been ran and stopped (if we delete a container, this will not yet apperar here)
```bash
docker container ps -a
```

### Deleting containers

We can delete a container with

```bash
docker container rm 913d58d37125
```
Here `913d58d37125` is the ID of the container

If the container is running, we can force the stop and then delete it with `-f`

```bash
docker container rm 913d58d37125 -f
```

We can directly remove all containers without saving their IDs to a file first

```bash
docker rm $(docker container ps -a -q)
```

### Attaching to running containers

If the container is runnig we can attach on it using a `bash terminal`. Or We can use an IDE like Visual Studio Code, which offers a "Attach to Running Container" command

```bash
docker container exec -it <container-id-or-name>
```
or

```bash
docker attach <container-id-or-name>
```

Example

```bash
docker container exec -it 913d58d37125 bash
```

### Running database containers

MYSQL

The following command

```bash
docker run --name mysql_db -e "MYSQL_ROOT_PASSWORD=yourStrong@Password" -p 3306:3306 mysql:latest
```

This initialize the container that is runnig server of MySQL.

The name of the container is `mysql_db`, and the `-e` (`--env`) point out the `environment variables`,  e.g. `MYSQL_ROOT_PASSWORD`. Finally, `mysql` is the name of the image that contains the `mysql`. The first `3306` is the host port and second `3306` is the container port. We can add `-d` before to
`--name` to detach mode (run in background).

**A bit of host port and container port**

In Docker, understanding the distinction between a Host Port and a Container Port comes down to where the network traffic is coming from and where it is going.

```txt
                HOST NETWORK                                CONTAINER NETWORK
┌───────────────────────────────────────────────┐        ┌───────────────────────────┐
│                                               │        │                           │
│   User / Web Browser ──► [ Host Port: 8080 ]  │───────►│ ──► [ Container Port: 80 ]│
│                                               │        │                           │
└───────────────────────────────────────────────┘        └───────────────────────────┘
```

Key Definitions

- *Container Port* (Target Port): The internal port that your application inside the container is listening on. This is configured in your application code or Dockerfile (e.g., Nginx listens on port 80 inside its container by default).

- *Host Port* (Published Port): The port on your host machine (your physical computer, VM, or server) that accepts incoming traffic from the outside world and forwards it into the container.

Why Are They Separated?

- *Avoid Port Conflicts*: Multiple containers can run applications listening on the same internal container port (e.g., three separate containers listening on port 80), while mapping to different host ports (8001:80, 8002:80, 8003:80).

- *Security & Isolation*: You can run containerized microservices that talk to each other inside an isolated Docker network without exposing their internal ports to the public internet.

Once it running the container, we can access to container. The `docker exec` command allows us to run commands inside a Docker container. The following command line will give you a bash shell inside your `mysql_db` container
to it passing the following command.

```bash
docker container exec -it mysql_db bash
```

Connecting to MySQL

Using this command line we can connect to MySQL

```bash
mysql -u <username> -p
```

We only need to replace `<username>` with your MySQL username (e.g., root).

Then, press Enter, and you will be prompted to enter your password.
After typing the correct password, the mysql> prompt will appear, indicating you are connected

POSTGRES SQL

PostgreSQL, often simply "Postgres", is an object-relational database management system (ORDBMS) with an emphasis on extensibility and standards-compliance. As a database server, its primary function is to store data, securely and supporting best practices, and retrieve it later, as requested by other software applications, be it those on the same computer or those running on another computer across a network (including the Internet)

```bash
$ docker run --name postgres_db -e "POSTGRES_PASSWORD=yourStrong@Password" -d postgres:13
```

MONGODB

```bash
docker run --name mongo_db -p 27017:27017 -d mongo
```

This initialize the container that is running server of the mongo *mongod* (mongo deamon).

MSSQL

If not exists *mcr.microsoft.com/mssql/server:2022-latest* it will be donwloaded.

```bash
docker run --name mssql_db -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=yourStrong@Password" -p 1433:1433 -d mcr.microsoft.com/mssql/server:2022-latest
```

`-d` detach mode.

Used for running container in the background (as daemon). In database containers, this is often used to run the database server in the background.

### Storage in Docker
By default, data stored inside a Docker container is ephemeral, meaning it will be lost when the container is removed or stopped. To persist data beyond the lifecycle of a container, Docker provides several options for storage:
1. **Volumes**:
   - Volumes are the preferred way to persist data in Docker. They are managed by Docker and can be easily shared between containers.
   - You can create a volume using the command:
     ```bash
     docker volume create my_volume
     ```
   - To use a volume in a container, you can mount it using the `-v` or `--mount` flag:
     ```bash
     docker run -d -v my_volume:/data my_image
     ```
   - Data stored in volumes is stored outside the container's filesystem, making it persistent even if the container is deleted.
2. **Bind Mounts**:
   - Bind mounts allow you to mount a file or directory from the host machine into a container. This is useful for development purposes, as it allows you to share code and configuration files between the host and the container.
   - To use a bind mount, you can use the `-v` or `--mount` flag with the full path of the host directory:
     ```bash
     docker run -d -v /path/on/host:/data my_image
     ```
   - Changes made to the files in the mounted directory on the host will be reflected in the container and vice versa.
3. **tmpfs Mounts**:
   - tmpfs mounts are used to store data in the host system's memory. This is useful for temporary data that does not need to be persisted.
   - To use a tmpfs mount, you can use the `--tmpfs` flag:
     ```bash
     docker run -d --tmpfs /data my_image
     ```
    - Data stored in tmpfs mounts is lost when the container is stopped or removed, as it resides in memory.

### Volumen

<center>
<img src="https://miro.medium.com/v2/format:webp/0*hN3NgV1e3ZchXg_G" height=200>
</center>

A *volume* in Docker is a persistent storage mechanism used to store data outside the container's filesystem.

Volumes are managed by **Docker (engine)** and allow data to persist even after a container is stopped, removed, or recreated. They are the preferred way to manage data that needs to be shared between containers or preserved across container lifecycles.

Docker volumes allow you to to create references to files outside of a Docker container. This means any changes you make to your source files can be immediately reflected in the container, without the need for a rebuild.

Volumes are mechanism for persisting data generated by and used by Docker containers

You can create and manage volumes outside the scope of any container.

- Volumes are easier to back up or migrate.
- You can manage volumes using Docker CLI commands or the Docker API.
- Volumes work on both Linux and Windows containers.
- Volumes can be more safely shared among multiple containers.
- Volume drivers let you store volumes on remote hosts or cloud providers, encrypt the contents of volumes, or add other functionality
- New volumes can have their content pre-populated by a container.

**Create a volume:**

```bash
docker volume create my-vol
```

**List all volumes:**

```bash
docker volume ls
```

**Inspect a volume:**

```bash
docker volume inspect my-vol
```

**Remove a volume:**

```bash
docker rm my-vol
```

EXAMPLE 01

If you start a container with a volume that doesn't yet exist, Docker creates the volume for you.

The following example Docker will start a new container named `mssql_db`, mount a volume named `mssql_data` to `/var/opt/mssql` inside the container, set the `ACCEPT_EULA` and `MSSQL_SA_PASSWORD` environment variables, map port 1433 of the host to port 1433 of the container, and use the latest version of the Microsoft SQL Server image with the tag 2022-latest.

```bash
docker run --name mssql_db -mount source=mssql_data,target=/var/opt/mssql -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=yourStrong@Password" -p 1433:1433 -d mcr.microsoft.com/mssql/server:2022-latest
```

for MySQL the volumen point to /var/lib/mysql

EXAMPLE 02

This command pulls the jupyter/datascience-notebook image tagged latest from Quay.io if it is not already present on the local host. It then starts an ephemeral container running a Jupyter Server with the JupyterLab frontend and exposes the server on host port `8888`.

```bash
docker run -it --rm -p 8888:8888 -v ${PWD}:/home/jovyan/work quay.io/jupyter/datascience-notebook
```

The use of the -v flag in the command mounts the current working directory on the host (`${PWD}` in the example command) as `/home/jovyan/work` in the container. The server logs appear in the terminal.

Visiting `http://<hostname>:8888/?token=<token> in a browser loads JupyterLab`.

Due to the usage of the `--rm` flag Docker automatically cleans up the container and removes the file system when the container exits, but any changes made to the `~/work` directory and its files in the container will remain intact on the host.

BACK UP A MYSQL DATABASE

This Docker command creates a one-time container to back up a MySQL database from another container

```bash
docker run --rm --volumes-from mysql-container -v $(pwd):/backup ubuntu/mysql:latest tar cvf /backup/backup.tar /var/lib/mysql
```

- `docker run`: This is the command to create and run a new Docker container.

- `--rm`: This flag tells Docker to automatically remove the container after it exits. This is useful for one-off tasks like backups, where you don't need the container to persist.

- `--volumes-from mysql-container`: This is a crucial part. It mounts all the volumes from the container named mysql-container into the new container being created (randomly name). This is how the backup process gains access to the MySQL data directory. **It's essential that a container named mysql-container exists and has the data volume you want to back up**.

- `-v $(pwd):/backup`: This is a bind mount. It mounts the current working directory on your host machine ($(pwd)) to the /backup directory inside the new container. This is where the backup file (backup.tar) will be created.

- `ubuntu/mysql:latest`: This specifies the image to use for the new container. It's using the official MySQL image based on Ubuntu. Although it says mysql, the command inside the container doesn't actually start the MySQL server; it just uses the image because it contains the tar utility.

- `tar cvf /backup/backup.tar /var/lib/mysql`: This is the command that will be executed inside the new container.
  - `tar`: This is the archiving utility.
  - `c`: Create an archive.
  - `v`: Verbose output (list the files being archived).
  - `f /backup/backup.tar`: Specify the archive file name (backup.tar) and its location (/backup, which is mounted to your current working directory).
  - `/var/lib/mysql`: This is the directory inside the mysql-container (mounted thanks to --volumes-from) containing the MySQL database files (data volume). This is what's being archived.

More about volumen https://docs.docker.com/storage/volumes/#start-a-container-with-a-volume

## Docker Build (Building an Image)

`dockerfile` is a file which each line represents an instruction that `Docker` uses to build an image.

The `docker build` command executes the instructions contained within a `Dockerfile` sequentially to construct a *layered image filesystem*.

The following command build the image called `app`

```bash
docker build -t app .
```
`-t` is for tag and the period `.` at the end of the standard docker build command `docker build -t app .` tells the daemon to use the current working directory as the build context. That is, the directory from which the `Dockerfile` will be read.

- Each instruction in the Dockerfile (like FROM, RUN, COPY, ENV) creates a read-only layer in the final image. These layers are stacked on top of each other.
- Because images are composed of layers, if you change an instruction, Docker only has to rebuild the layers from that point forward, which is faster.

Docker uses a powerful caching mechanism to speed up subsequent builds.

- How it works: When the Docker daemon executes an instruction, it checks if it has already built a layer for the exact same instruction in the past.
- Cache Hit: If a layer with the identical instruction exists, Docker uses the cached layer ("cache hit") instead of re-executing the instruction. This is why you often see ---> Using cache during a build.
- Cache Invalidation: The cache is broken ("cache miss") when:
  - An instruction is changed.
  - The contents of a file referenced by ADD or COPY are changed. Docker checks the checksums of the files.
  - You use the --no-cache flag.
  - An instruction that relies on the current time (like a build-time variable) is used.

| Instruction | Purpose | Creates a Layer? |
| ----------- | ------- | ---------------- |
| **FROM** | Sets the base image for subsequent instructions. Must be the first instruction. | Yes |
| **RUN** | Executes commands in a new layer on top of the current image. | Yes |
| **COPY** | Copies files/directories from the build context into the image filesystem. | Yes |
| **ADD** | Similar to `COPY`, but can also extract tarballs (compressed) and fetch files from URLs. | Yes |
| **CMD** | Provides defaults for an executing container. Only one `CMD` can exist. | No (Metadata) |
| **ENTRYPOINT** | Configures a container that will run as an executable. Often used with `CMD`. | No (Metadata) |
| **WORKDIR** | Sets the working directory for subsequent `RUN`, `CMD`, `ENTRYPOINT`, `COPY`, and `ADD` instructions. | Yes |
| **ENV** | Sets environment variables. | Yes |

EXAMPLE

Simple *Hello World* application using FastAPI

Tree of the project

```bash
fastapi_docker_app
├── main.py
├── requirements.txt
├── Dockerfile
```

**main.py**

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}
```

**requirements.txt**

```bash
fastapi==0.115.0
uvicorn[standard]==0.23.2
```

**dockerfile**

```bash
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Usage

```bash
docker build -t fastapi-app .
docker run -p 8000:8000 fastapi-app
curl http://localhost:8000
```

## Docker Compose

**Docker Compose** is a tool for defining and running multi-container Docker applications. It allows you to use a YAML file (**docker-compose.yml**) to configure the services, networks, and volumes required for your application. With a single command, you can create and start all the services defined in the configuration file, making it easier to manage complex applications that consist of multiple containers.

- *Multi-Container Orchestration* :
Docker Compose enables you to define and manage multiple containers as a single application. For example, a web application might include a database container, a backend API container, and a frontend container.
- *Declarative Configuration* :
The docker-compose.yml file provides a declarative way to define the application's services, networks, and volumes. This makes it easy to version control and share configurations.
- *Single Command Management* :
You can start, stop, or rebuild all the services with simple commands like `docker-compose up` and `docker-compose down`.
- *Environment Variables* :
Docker Compose supports environment variables, allowing you to customize configurations for different environments (e.g., development, testing, production).
- *Networking* :
Docker Compose automatically creates a default network for your services, enabling them to communicate with each other using service names as hostnames.
- *Volume Management* :
Volumes can be defined and shared between containers, ensuring data persistence and consistency.

Commands

1. First run / after code changes

    ```bash
    docker compose up -d --build
    ```

2. Check status

    ```bash
    docker compose ps
    ```

3. View logs if something fails

    ```bash
    docker compose logs sqlserver
    docker compose logs app
    ```

4. Stop (without deleting)

    ```bash
    docker compose stop
    ```

5. Resume later

    ```bash
    docker compose start
    ```

6. Full reset (deletes containers, keeps volumes)

    ```bash
    docker compose down
    docker compose up -d
    ```

### YAML Syntax for Docker Compose

#### 1. Top-Level Structure

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

#### 2. Services (Core)

Each service is a container definition. Full syntax, organized by category:

```yaml
services:
  app:                              # service name (used for DNS between containers)
```

##### 2.1. Image & Build

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

The *pull_policy* directive in Docker Compose controls when the system pulls images from a registry versus using local cached images. By default, Compose pulls an image only if it is missing locally, but this property allows you to override that behavior per service to suit specific development or production needs.

Available policies include:

- `missing`: The default; pulls only if the image is not present locally. Note that the latest tag is always pulled even with this policy.
- `always`: Pulls the image from the registry on every docker compose up, ensuring you always get the newest version.
- `never`: Does not pull from the registry; fails if the image is missing locally. Useful in CI to catch accidental registry dependencies.
- `build`: Forces Compose to build the image from source, even if a local image exists. This is critical when using both build: and image: keys to prevent Compose from pulling an older cached version instead of building the latest changes. This has the same behaviour of `--build`. The main difference is with `--build` rebuild local images (services with build).

daily, weekly, or every_`<duration>`: Checks the registry periodically (e.g., every 12 hours, every 2 days) to refresh images without the overhead of always on every command.

Both has the same effect

Option (1) with --build

```yaml
services:
  app:
    # The name you want to give the resulting local image
    image: myapp:dev

    # The path to your Dockerfile and context
    build: ./src

    # CRITICAL: Forces Compose to ignore the registry and build from source
    pull_policy: build

    ports:
        - "3000:3000"
```

Option (2) without build

```yaml
services:
  app:
    # The name you want to give the resulting local image
    image: myapp:dev

    # The path to your Dockerfile and context
    build: ./src

    ports:
        - "3000:3000"
```

##### 2.2 Command & Star Up
```yaml
    entrypoint: ["/entrypoint.sh"]                  # overrides ENTRYPOINT
    command: ["node", "server.js"] # Sent as "$@" to the script - overrides CMD (list or string)
    working_dir: /app               # working directory inside container
    # user: "1000:1000"               # user:group to run as
    restart: unless-stopped         # no | always | on-failure[:max] | unless-stopped
    # init: true                      # run a tiny init as PID 1 (reaps zombie processes)
    # stop_grace_period: 30s          # time to wait before SIGKILL after SIGTERM
    # tty: true                       # allocate a pseudo-TTY (like docker run -t)
    # stdin_open: true                # keep stdin open (like docker run -i)
```

In Docker Compose, the `entrypoint` specifies the primary command or executable that runs when a container starts up.

Using a Custom Initialization Script

A very common pattern in production is using an `entrypoint` script to perform setup tasks (like running database migrations, setting permissions, or waiting for other services) before launching the main application.

`entrypoint.sh`

```bash
#!/bin/bash
echo "Running database migrations..."
# npm run migrate (or similar command)

echo "Starting the application..."
# Executes whatever command was passed downstream (e.g., node server.js)
exec "$@"
```

(Note: exec "$@" is critical because it passes control to the main process, ensuring signals like SIGTERM or SIGINT reach your app correctly).

##### 2.3 Ports

```bash
    ports:
      - "8080:80"                   # HOST_PORT:CONTAINER_PORT
      - "127.0.0.1:8080:80"         # bind only to localhost (more secure)
      - "8080:80/tcp"               # explicit protocol
      # - "53:53/udp"                 # UDP example
      - "3000"                      # container port only → random host port
      - target: 80                  # long syntax
        published: 8080
        protocol: tcp
        mode: host

    expose:
      - "3000"                      # reachable by OTHER containers only, not the host
```

##### 2.4 Environment Variables

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

**Variable interpolation** — Compose substitutes ${...} from your shell or the .env file next to the compose file:

```yaml
    DB_USER: ${POSTGRES_USER:-postgres}     # default if unset or empty
    DB_PASS: ${POSTGRES_PASSWORD:?must set} # error if unset
    TAG: ${APP_VERSION-latest}              # default only if unset
    LITERAL: $${escaped}                    # $$ escapes a literal $
```

In shell scripting and programming, unset refers to the act of removing a variable or setting from the environment entirely, whereas an empty string means the variable exists but holds no value.

- Unset: The variable is deleted or undefined; commands like declare -p will report it as non-existent.
- Empty: The variable is defined but contains "" (zero length); it still occupies space in the shell's namespace.

##### 2.5 Volumes (Mounts)

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

| Type         | Syntax              | Use case                               |
| ------------ | ------------------- | -------------------------------------- |
| Named volume | `name:/path`        | Data that must persist (databases)     |
| Bind mount   | `./host:/container` | Live code during development           |
| Anonymous    | `/path`             | Shield a dir from bind-mount overwrite |

##### 2.6 Networking

Docker Networking — Full Explanation

1. Why Docker Networking Exists

Containers are isolated processes. By default, a container:

- Gets its own network stack (its own IP address, interfaces, routing table)
- Cannot see other containers' traffic
- Cannot be reached from the outside world unless you explicitly allow it

Docker networking is the layer that answers three questions:

- Container ↔ Container — can my API reach my database?
- Container ↔ Host/Internet — can users reach my app? Can my app call external APIs?
- How do containers find each other — by what address?

2. Network Drivers (the types of networks)
Docker implements networking through drivers:

| Driver    | What it does                                                                 | Use case                                     |
| --------- | ---------------------------------------------------------------------------- | -------------------------------------------- |
| `bridge`  | Virtual private network on one host (the default)                            | Normal containers on a single machine        |
| `host`    | Container shares the host's network stack directly                           | Maximum performance; Linux only              |
| `none`    | No networking at all                                                         | Fully isolated/sandboxed containers          |
| `overlay` | Network spanning **multiple Docker hosts**                                   | Docker Swarm clusters                        |
| `macvlan` | Container gets its own MAC address, appears as a physical device on your LAN | Legacy apps expecting to be "on the network" |
| `ipvlan`  | Similar to macvlan, shares the host's MAC                                    | Specialized infrastructure cases             |

For 95% of development work, bridge is all you need.

```bash
$ docker network ls
NETWORK ID     NAME      DRIVER    SCOPE
a1b2c3d4e5     bridge    bridge    local
f6g7h8i9j0     host      host      local
k1l2m3n4o5     none      null      local
```

*bridge* (docker0)

- A virtual switch created on your machine (docker0 interface, usually 172.17.0.0/16).
- Every container started without specifying a network lands here and gets an IP like 172.17.0.2.
- Containers can reach each other by IP only — no name resolution on the default bridge.

**User-Defined Bridge Networks**

```bash
docker network create mynet
docker run -d --name db --network mynet postgres:16-alpine
docker run -d --name api --network mynet myapi
```

Containers on a user-defined network can reach each other by container name:

```text
┌─────────────────── mynet ───────────────────┐
│                                             │
│   api (172.18.0.2)      db (172.18.0.3)     │
│        │                   ▲                │
│        └─── api resolves "db" → 172.18.0.3 ──┘
│            via Docker's embedded DNS server │
└─────────────────────────────────────────────┘
```

So inside api, this just works:

```bash
postgresql://db:5432/ecommerce
        #     ^^ the container name IS the hostname
```

This is critical: IPs change when containers restart or recreate; names don't. Never hardcode container IPs.

Containers on mynet cannot talk to containers on othernet — the networks are separate LANs

5. Container ↔ Outside World: Publishing Ports

A container on a bridge network is invisible from outside until you publish a port:

```bash
docker run -d -p 8080:80 nginx
```

```text
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

```bash
ports:
  - "8080:80"        # HOST publishes 8080 → forwards into container's 80
                     # anyone who can reach your machine can hit it

  - "127.0.0.1:8080:80"   # only reachable from the host itself (safer for dev DBs)

expose:
  - "5432"           # NOT published to host; only containers on the same
                     # network can reach it. Largely documentation.
```

**Outbound traffic**

Containers can reach the internet by default (outbound NAT through the host). No configuration needed — your app can call external APIs freely.

6. Networking in Docker Compose

The default: one network per project

```yaml
services:
  api:
    build: .
    ports:
      - "8000:8000"
  db:
    image: postgres:16-alpine
```

With zero network configuration, Compose:
1. Creates a network named `<project>_default` (e.g., ecommerce_default)
2. Puts every service on it
3. Registers each service name in the embedded DNS

So api can immediately use postgresql://db:5432/... — the service name db resolves automatically. This is the single most useful networking fact in Compose.

**Multiple networks: tiered isolation**

The classic production pattern — the database must never be reachable from the public-facing side:

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

```text
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

- A browser can reach api, but there is no network path from outside to db.
- db isn't even published on any host port — it only listens on the backend network.

7. Inspecting and Debugging

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

The classic debugging flow

"My API can't reach the database, connection refused"
- Same network? → docker network inspect `<net>` and check both containers are listed.
- Using the right name? → the hostname must be the service name (db), not localhost. Inside a container, localhost is the container itself — the #1 beginner mistake.
- Right port? → use the container port (5432), not any published host port. Published ports are for the outside; container-to-container traffic bypasses them entirely.
- Is it ready? → the container is up but Postgres is still initializing → healthcheck + depends_on: condition: service_healthy (as in your earlier config).
- DNS working? → ping db from inside the API container.

**Summary Mental Model**

```text
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

The five rules that cover 95% of real work:
- Compose puts all services on one shared network with DNS by service name — use db:5432, never IPs.
- Inside a container, localhost means itself, not your machine or other containers.
- ports exposes to the outside; containers on the same network don't need it to talk to each other.
- Multiple networks + internal: true isolate tiers (public API vs. private DB).
- IPs are ephemeral; names are stable — always connect by name.

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

```yaml
version: '3.8'  # Specify the version of the Docker Compose file format

services:
  web:  # Name of the first service
    image: nginx:latest  # Docker image to use
    ports:
      - "80:80"  # Map port 80 on the host to port 80 in the container
    depends_on:
      - db  # This service depends on the "db" service

  db:  # Name of the second service
    image: mysql:latest  # Docker image to use
    environment:  # Environment variables for the MySQL container
      MYSQL_ROOT_PASSWORD: example
    volumes:
      - db_data:/var/lib/mysql  # Persistent volume for MySQL data

volumes:  # Define named volumes
  db_data:
```

`version` :
- Specifies the version of the Docker Compose file format. Use 3.8 or later for compatibility with most Docker setups.

`services` :
- Defines the services (containers) required for the application:
    - `web`: A web server using the nginx:latest image.
    - `db`: A MySQL database using the mysql:latest image.

`ports` :
- Maps port 80 on the host to port 80 in the web container.

`depends_on` :
- Ensures that the db service starts before the web service.

`environment` :
- Sets environment variables for the db service (e.g., the MySQL root password).

`volumes` :
- Defines a named volume (db_data) to persist MySQL data.

1. Save the YAML content to a file named *docker-compose.yml*.
2. Run the following command in the same directory as the *docker-compose.yml* file:

```bash
docker-compose up -d
```
If we want to use other name we can pass flag `-f`.
```bash
docker-compose -f my-docker-compse.yml up -d
```

### Ecommerce-Rest-API project

[A complete e-commerce backend API built with FastAPI and SQLAlchemy, containerized with Docker](https://github.com/dante-cmd/Ecommerce-Rest-API)

### docker run

The `docker run` command runs a command in a new container, pulling the image if needed and starting the container.

Usage `docker container run [OPTIONS] IMAGE [COMMAND] [ARG...]`

options:

- `--rm`: Automatically remove the container and its associated anonymous volumes when it exits

- `-i`: Docker keeps the container's STDIN stream open, allowing you to send input even when the container is running in detached mode.

- `-p`: Publish a container's port(s) to the host. `-p 8080:5000`

We can run an image with the following commands
* `docker run postgres` or by its *image id* `docker run 41cd24e8c51b`

We can run several version of the images. That mean we can run several version of a program.

To see the images that we have

* `docker images`

To see the images that we have runned (thta is the containers)

* `docker ps`

## Docker Context

Docker Context is a feature in the Docker CLI (Command Line Interface) that allows you to easily switch between different Docker environments (daemons) without changing environment variables.

With Docker Contexts, you create named configurations and switch between them instantly:

#### Example of creating a context for a remote Docker host using SSH

First we must create `config` file in ssh config file in `C:\Users\user\.ssh` and add the following content to it

```bash
Host linux-docker
    HostName 192.168.xxx.x      # Your Linux laptop IP
    User username               # Your Linux username
    ServerAliveInterval 60      # Send keepalive every 60 seconds
    ServerAliveCountMax 3       # Disconnect after 3 failed keepalives
    TCPKeepAlive yes
```

Then we can create a context with the following command
```bash
docker context create linux-server --docker "host=ssh://linux-docker"
docker context use linux-server
docker ps                       # This will now show containers on the remote host (but it will prompt for a password first)
docker context use default      # Switch back
docker ps
docker context ls
```

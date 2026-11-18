# Nginx

*Nginx* (pronounced "engine-x") is a powerful and popular open-source web server software. But it's more than just a web server; it's also used as:

- Reverse proxy: It sits in front of one or more backend servers and forwards client requests to them.
- Load balancer: It distributes network traffic across multiple servers to improve performance and availability.
- HTTP cache: It stores frequently accessed content to speed up delivery.
- Mail proxy: It can proxy email protocols like IMAP, POP3, and SMTP.
1. *Web Server*: Like Apache, Nginx can serve static content (HTML files, images, CSS, JavaScript) directly to clients.
It's known for its high performance and efficiency in handling concurrent connections, making it suitable for high-traffic websites.

2. *Reverse Proxy*: In this role, Nginx acts as an intermediary between clients and backend servers.
When a client makes a request, it first reaches Nginx. Nginx then forwards the request to the appropriate backend server.
This provides several benefits:
Security: Hides the internal structure of the backend servers from the outside world.
Load balancing: Distributes traffic across multiple backend servers.
Caching: Caches static content to reduce the load on backend servers.
SSL/TLS termination: Handles encryption and decryption of SSL/TLS traffic.

3. *Load Balancer*: Nginx can distribute incoming network traffic across multiple backend servers.
This improves performance by preventing any single server from becoming overloaded.
It also increases availability because if one server fails, Nginx can redirect traffic to the other servers.

4. *HTTP Cache*: Nginx can cache static content (like images, CSS, and JavaScript files) to reduce the load on backend servers and speed up delivery to clients.
When a client requests content that is already cached, Nginx serves it directly from the cache without having to contact the backend server.
Serving Static Content

This is the simplest use case: serving static HTML, CSS, and JavaScript files.

- Create an index.html file:

    <span style="font-size:12px">HTML</span>

    ```html
    <!DOCTYPE html>
    <html>
    <head>
        <title>Hello from Nginx in Docker!</title>
    </head>
    <body>
        <h1>Hello, Docker!</h1>
        <p>This is a simple HTML page served by Nginx.</p>
    </body>
    </html>
    ```

- Create a Dockerfile:

    <span style="font-size:12px">Dockerfile</span>

    ```dockerfile
    FROM nginx:latest
    COPY index.html /usr/share/nginx/html
    ```


<!-- This Dockerfile does the following:

FROM nginx:latest: Starts with the official Nginx image.

COPY index.html /usr/share/nginx/html: Copies your index.html file into the Nginx web server's default document root directory. -->

- Build the Docker image:
    
    <span style="font-size:12px">Bash</span>
    ```bash
    docker build -t my-nginx-static .
    ```
    
- Run the Docker container:

    <span style="font-size:12px">Bash</span>
    ```bash
    docker run -d -p 8080:80 my-nginx-static
    ```
   

-p 8080:80 maps port 8080 on your host machine to port 80 inside the container (Nginx's default port).
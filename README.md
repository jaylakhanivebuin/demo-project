# EC2 Node.js Task Tracker

A small task tracker with a static frontend and a Node.js/Express API. The frontend and backend build as separate Docker images. PM2 runs the backend process in its container, and the host's Nginx routes `/` to the frontend and `/api/` to the backend.

## Project structure

- `frontend/` - static HTML, CSS, JavaScript, and its Nginx Dockerfile
- `backend/` - Express API, PM2 configuration, and its Node.js Dockerfile
- `nginx/ec2-node-demo.conf` - host Nginx reverse-proxy site configuration

## Build the frontend

From the frontend directory, run:

```bash
cd frontend
npm run build
```

The static production files are written to `frontend/dist/`. The frontend Dockerfile runs this build automatically before copying the output into Nginx.

## Build and run on EC2

Allow inbound TCP **80** in the instance's Security Group. Restrict SSH (22) to your IP, and do not expose ports 3000 or 8080 publicly. Ensure Docker is installed on the Ubuntu instance and Nginx is already installed.

From the project root, build both images:

```bash
docker build -t ec2-task-tracker-backend ./backend
docker build -t ec2-task-tracker-frontend ./frontend
```

Start the backend and frontend containers:

```bash
docker run -d --name ec2-task-tracker-backend --restart unless-stopped -p 127.0.0.1:3000:3000 ec2-task-tracker-backend
docker run -d --name ec2-task-tracker-frontend --restart unless-stopped -p 127.0.0.1:8080:80 ec2-task-tracker-frontend
```

Replace the default Nginx site configuration and reload Nginx:

```bash
sudo cp nginx/ec2-node-demo.conf /etc/nginx/sites-available/default
sudo nginx -t && sudo systemctl reload nginx
```

Open `http://EC2-PUBLIC-IP`. Nginx serves the frontend through its frontend container and forwards `/api/` requests to the backend container. Check the API at `http://EC2-PUBLIC-IP/api/health`.

## Manage the containers

PM2 runs inside the backend container. Use Docker to inspect logs or manage either container:

```bash
docker logs -f ec2-task-tracker-backend
docker restart ec2-task-tracker-backend
docker restart ec2-task-tracker-frontend
docker stop ec2-task-tracker-backend ec2-task-tracker-frontend
```

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Backend health check |
| GET | `/api/tasks` | List tasks |
| POST | `/api/tasks` | Add task; JSON body: `{"title":"My task"}` |
| PATCH | `/api/tasks/:id` | Update completion; JSON body: `{"done":true}` |
| DELETE | `/api/tasks/:id` | Delete task |

## Notes

- The backend container listens on port 3000, but Docker publishes it only on localhost. The frontend container listens on port 80, published on localhost port 8080.
- In-memory task data resets when the backend restarts.
- Configure TLS in Nginx for production HTTPS.

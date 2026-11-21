# TaskFlow – Project Management Application

A lightweight project management application inspired by tools like Jira and Trello. TaskFlow allows users to create and manage projects, collaborate with team members, assign tasks, track progress, and manage work through a centralized dashboard.

The application is built using Django REST Framework, React, and PostgreSQL, with JWT-based authentication and a centralized Policy-Based Access Control (PBAC) authorization approach.

---

## 1. Project Overview

### What is TaskFlow?

TaskFlow is a full-stack project management application designed to help teams organize projects and track their work efficiently.

Users can create projects, manage project members, create and assign tasks, update task statuses, and monitor overall progress through a dashboard.

### Key Features

**Authentication and Account Management**
- User registration and login.
- JWT-based authentication.
- Protected API endpoints.
- Access token validation and refresh support.

**Project Management**
- Create, view, update, and delete projects.
- Automatically assign the project creator as the project owner and member.
- View projects in which the authenticated user is a member.
- Manage project membership by adding or removing members.

**Task Management**
- Create tasks within projects.
- Assign tasks to project members.
- Update task details.
- Delete tasks according to authorization rules.
- Track task priority: Low, Medium, and High.
- Track task status: Todo, In Progress, and Completed.
- Set task due dates.
- Search and filter tasks.
- Paginate task results.

**Dashboard**
- View total projects.
- View active projects.
- View total tasks.
- Track completed and pending tasks.

**Authorization**
- Centralized Policy-Based Access Control (PBAC).
- Resource-level authorization.
- Different permissions based on the requested action and resource.

---

## 2. Architecture Overview

TaskFlow follows a client-server architecture.

The React frontend communicates with the Django REST Framework backend through REST APIs. The backend handles authentication, business logic, authorization, validation, and database operations.

PostgreSQL is used as the persistent relational database.

### High-Level Architecture

```text
                  USER / BROWSER
                        |
                        v
                React Application
                   (Nginx)
                        |
                        | HTTP / REST API
                        v
                Django REST Framework
                        |
          +-------------+-------------+
          |             |             |
          v             v             v
      Accounts       Projects       Tasks
          |             |             |
          +-------------+-------------+
                        |
                        v
              Authorization Layer
                       PBAC
                        |
                        v
                  PostgreSQL
```

### Backend Structure

The backend is organized into Django applications and reusable core modules.

```text
backend/
│
├── accounts/
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   └── tests/
│
├── projects/
│   ├── models.py
│   ├── serializers.py
│   ├── services.py
│   ├── views.py
│   ├── urls.py
│   └── tests/
│
├── tasks/
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   └── tests/
│
├── core/
│   ├── permissions.py
│   └── pagination.py
│
├── backend/
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
│
├── Dockerfile
├── entrypoint.sh
├── requirements.txt
└── manage.py
```

### Frontend Structure

```text
frontend/
│
├── src/
│   ├── components/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── layout/
│   │   └── projects/
│   │
│   ├── context/
│   │   └── AuthContext.jsx
│   │
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── MyTasks.jsx
│   │   └── ProjectDetails.jsx
│   │
│   ├── services/
│   │   └── api.js
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── Dockerfile
├── nginx.conf
└── package.json
```

### Database Relationships

The application uses a relational database with the following main entities:

- **User:** Stores account information.
- **Project:** Stores project information and references its owner.
- **ProjectMember:** Connects users and projects through a many-to-many relationship.
- **Task:** Belongs to a project and references its creator and optional assignee.

Important relationships:

- One user can own multiple projects.
- A project can have multiple members.
- A user can participate in multiple projects.
- A project can contain multiple tasks.
- Each task has one creator and can have one assigned user.
- An assignee must be a member of the task's project.

UUIDs are used as primary keys for the main application entities.

### Authorization Architecture – PBAC

TaskFlow uses Policy-Based Access Control rather than traditional Role-Based Access Control.

Authorization decisions are based on the authenticated user, requested action, and target resource.

The authorization layer centralizes policy decisions separately from business logic.

Example conceptual interface:

```python
authorize(user, action, resource)
```

The policies enforce rules such as:

| Action | Authorization Policy |
|---|---|
| View project | User must be a project member |
| Update project | User must be the project owner |
| Delete project | User must be the project owner |
| Create task | User must be a project member |
| Update task | User must be the task creator or assignee |
| Delete task | User must be the project owner and task status must be Todo |
| Complete task | User must be the assigned user and required task information must be complete |

Authorization is enforced on the backend. Frontend visibility is not treated as a security boundary.

---

## 3. Technology Choices

### Backend

| Technology | Purpose |
|---|---|
| Python | Backend programming language |
| Django | Backend framework |
| Django REST Framework | REST API development |
| Simple JWT | JWT authentication |
| PostgreSQL | Relational database |
| Gunicorn | Production WSGI application server |

### Frontend

| Technology | Purpose |
|---|---|
| React | Component-based user interface |
| Vite | Frontend development and build tooling |
| React Router | Client-side routing |
| Axios | HTTP communication with backend APIs |
| Tailwind CSS | UI styling |
| Lucide React | Icons |

### Infrastructure and Tools

| Technology | Purpose |
|---|---|
| Docker | Application containerization |
| Docker Compose | Multi-container orchestration |
| Nginx | Serving the production React build |
| Git | Version control |
| Postman | API testing |

### Why These Technologies?

- **Django REST Framework:** Provides a structured approach to building REST APIs, serializers, authentication, permissions, and request validation.
- **React:** Supports reusable components and a responsive, interactive user interface.
- **PostgreSQL:** Provides relational data integrity, constraints, and reliable persistence.
- **JWT:** Allows stateless authentication between the frontend and backend.
- **Docker Compose:** Makes it easier to run the frontend, backend, and database together in a consistent environment.
- **Nginx:** Efficiently serves the optimized React production build.

---

## 4. Setup Instructions

### Prerequisites

Install the following tools:

- Python 3.12 or later (Python 3.13 is used in the backend Docker image).
- Node.js 22 or later.
- PostgreSQL 17 or compatible version.
- Git.
- Docker Desktop with Docker Compose (for containerized setup).

### Clone the Repository

```bash
git clone https://github.com/justingeorge12/Project-Management
cd Finbase
```

### Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv djvenv
```

Activate it on Windows:

```powershell
.\djvenv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file in the backend directory:

```env
SECRET_KEY=your-django-secret-key
DEBUG=True

ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=taskflow_db
DB_USER=postgres
DB_PASSWORD=your-database-password
DB_HOST=localhost
DB_PORT=5432
```

Create the PostgreSQL database and configure the database credentials.

Run migrations:

```bash
python manage.py migrate
```

Create an administrator account if needed:

```bash
python manage.py createsuperuser
```

Start the backend development server:

```bash
python manage.py runserver
```

Backend API base URL:

```text
http://127.0.0.1:8000/api/
```

### Frontend Setup

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

Start the development server:

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

---

## 5. Docker Instructions

TaskFlow supports a containerized setup using Docker Compose.

The application consists of three services:

| Service | Description | Port |
|---|---|---|
| frontend | React production build served through Nginx | 80 |
| backend | Django application served by Gunicorn | 8000 |
| db | PostgreSQL database | 5433 on host, 5432 inside Docker |

### Docker Architecture

```text
                 Browser
                    |
                    v
             localhost:80
                    |
                    v
             Frontend (Nginx)
                    |
                    v
             Backend (Django)
             localhost:8000
                    |
                    v
             PostgreSQL
             db:5432
```

### Configure Environment Variables

Create a root `.env` file in the same directory as `docker-compose.yml`.

Use the `.env.example` file as a reference:

```env
SECRET_KEY=your-django-secret-key
DEBUG=False

ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost,http://127.0.0.1

DB_NAME=taskflow_db
DB_USER=taskflow_user
DB_PASSWORD=your-strong-database-password

VITE_API_BASE_URL=http://localhost:8000/api
```

Use your own secure values. Never commit the actual `.env` file.

### Build Docker Images

From the project root:

```bash
docker compose build
```

### Start the Application

```bash
docker compose up -d
```

Docker Compose starts PostgreSQL, waits for its healthcheck, and then starts the backend and frontend.

The backend entrypoint script:

1. Waits for PostgreSQL to become available.
2. Executes pending Django migrations.
3. Starts Gunicorn.

### Verify Running Containers

```bash
docker compose ps
```

### View Logs

Backend:

```bash
docker compose logs -f backend
```

Frontend:

```bash
docker compose logs -f frontend
```

Database:

```bash
docker compose logs -f db
```

### Access the Application

Frontend:

```text
http://localhost
```

Backend:

```text
http://localhost:8000
```

API:

```text
http://localhost:8000/api/
```

### Updating the Application

After changing backend code:

```bash
docker compose build backend
docker compose up -d backend
```

After changing frontend code:

```bash
docker compose build frontend
docker compose up -d frontend
```

After changing both:

```bash
docker compose build
docker compose up -d
```

### Stop the Application

```bash
docker compose stop
```

Stop and remove containers and the Compose network:

```bash
docker compose down
```

The PostgreSQL data volume is retained when using `docker compose down`.

**Warning:** Avoid `docker compose down -v` unless you intentionally want to delete the persisted database volume.

---

## 6. Environment Variables

Environment variables are used to separate application configuration from source code and Docker images.

### Backend Environment Variables

| Variable | Description | Example |
|---|---|---|
| SECRET_KEY | Django secret key | Keep private |
| DEBUG | Enables or disables Django debug mode | False |
| ALLOWED_HOSTS | Allowed Django hostnames | localhost,127.0.0.1 |
| DB_NAME | PostgreSQL database name | taskflow_db |
| DB_USER | PostgreSQL username | taskflow_user |
| DB_PASSWORD | PostgreSQL password | Keep private |
| DB_HOST | Database hostname | localhost locally; db in Docker |
| DB_PORT | Database port | 5432 |

### Frontend Environment Variables

| Variable | Description | Example |
|---|---|---|
| VITE_API_BASE_URL | Backend API base URL | http://localhost:8000/api |

### Docker Compose Environment Variables

| Variable | Description |
|---|---|
| CORS_ALLOWED_ORIGINS | Frontend origins permitted by the backend |
| VITE_API_BASE_URL | API URL embedded during the frontend production build |

**Security note:** Variables prefixed with `VITE_` are exposed to the browser as part of the frontend build. Never store passwords, secret keys, or private credentials in frontend environment variables.

---

## 7. API Documentation

### API Base URL

```text
http://localhost:8000/api/
```

Protected endpoints require a valid JWT access token.

Include the token in the request header:

```http
Authorization: Bearer <access_token>
```

### Authentication APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/accounts/register/` | Register a new user |
| POST | `/api/accounts/login/` | Authenticate a user |
| POST | `/api/accounts/token/refresh/` | Refresh an access token |
| GET | `/api/accounts/me/` | Retrieve the authenticated user's profile |

### Project APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/projects/` | List projects accessible to the user |
| POST | `/api/projects/` | Create a project |
| GET | `/api/projects/{project_id}/` | Retrieve project details |
| PUT | `/api/projects/{project_id}/` | Replace project details |
| PATCH | `/api/projects/{project_id}/` | Partially update a project |
| DELETE | `/api/projects/{project_id}/` | Delete a project |
| GET | `/api/projects/dashboard/` | Retrieve dashboard statistics |

### Project Member APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/projects/{project_id}/members/` | List project members |
| POST | `/api/projects/{project_id}/members/` | Add a project member |
| DELETE | `/api/projects/{project_id}/members/{user_id}/` | Remove a project member |
| GET | `/api/projects/{project_id}/available-users/` | Search users available to add |

### Task APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/projects/{project_id}/tasks/` | List project tasks |
| POST | `/api/projects/{project_id}/tasks/` | Create a task |
| GET | `/api/projects/{project_id}/tasks/{task_id}/` | Retrieve task details |
| PUT | `/api/projects/{project_id}/tasks/{task_id}/` | Replace task details |
| PATCH | `/api/projects/{project_id}/tasks/{task_id}/` | Partially update a task |
| DELETE | `/api/projects/{project_id}/tasks/{task_id}/` | Delete a task |
| GET | `/api/projects/my-tasks/` | Retrieve tasks assigned to the authenticated user |

### Task Filtering and Search

The task listing endpoint supports filtering, searching, and pagination.

Example:

```http
GET /api/projects/{project_id}/tasks/?status=TODO
```

Filter by priority:

```http
GET /api/projects/{project_id}/tasks/?priority=HIGH
```

Search tasks:

```http
GET /api/projects/{project_id}/tasks/?search=design
```

Filter by assignee:

```http
GET /api/projects/{project_id}/tasks/?assignee=<user_id>
```

Pagination:

```http
GET /api/projects/{project_id}/tasks/?page=2
```

The default page size is 10, with a maximum page size of 100.

### Task Status Values

| Value | Description |
|---|---|
| TODO | Task has not started |
| IN_PROGRESS | Task is being worked on |
| COMPLETED | Task has been completed |

### Task Priority Values

| Value | Description |
|---|---|
| LOW | Low priority |
| MEDIUM | Medium priority |
| HIGH | High priority |

### Common HTTP Status Codes

| Status Code | Meaning |
|---|---|
| 200 | Request successful |
| 201 | Resource created successfully |
| 204 | Request successful with no response body |
| 400 | Invalid request or validation error |
| 401 | Authentication required or invalid |
| 403 | Authenticated user is not permitted to perform the action |
| 404 | Requested resource not found |
| 500 | Internal server error |

### API Testing

APIs can be tested using:

- Postman.
- Django REST Framework's browsable API.
- Direct HTTP requests using tools such as curl.

For protected endpoints, authenticate first and provide the JWT access token in the Authorization header.

---

## 8. Assumptions Made

The following assumptions were used during implementation:

1. **Single account per user:** Each user has one application account identified by a unique email address.
2. **Project ownership:** The user who creates a project automatically becomes its owner and a project member.
3. **Project visibility:** Users can only access projects in which they are members.
4. **Task membership:** Tasks can only be assigned to users who belong to the corresponding project.
5. **Task ownership:** The creator and assignee are permitted to update task information, subject to the completion policy.
6. **Task deletion:** Only the project owner can delete a task, and only while its status is Todo.
7. **Task completion:** Only the assigned user can complete a task, and required task information must be present.
8. **Task status:** Tasks use three predefined statuses: Todo, In Progress, and Completed.
9. **Task priority:** Tasks use three predefined priority levels: Low, Medium, and High.
10. **Single-user deployment environment:** The initial application is intended for a straightforward deployment without complex multi-tenant organization management.
11. **Database persistence:** PostgreSQL data is persisted through a Docker named volume.

---

## 9. Trade-offs Considered

### Django REST Framework Instead of a Custom API Framework

**Decision:** Django REST Framework.

**Reason:** DRF provides serializers, request validation, authentication, permission integration, and reusable API views. This reduces boilerplate and makes the backend easier to maintain.

### PostgreSQL Instead of SQLite

**Decision:** PostgreSQL.

**Reason:** PostgreSQL provides stronger support for relational data, constraints, concurrent access, and production-style deployment.

### JWT Instead of Session Authentication

**Decision:** JWT authentication.

**Reason:** JWT allows the React frontend and Django backend to communicate through stateless API requests without depending on server-side browser sessions.

**Trade-off:** Token storage and refresh handling must be managed carefully.

### PBAC Instead of RBAC

**Decision:** Policy-Based Access Control.

**Reason:** The assignment explicitly requires resource-based authorization rather than role-based access control. PBAC allows permissions to depend on the user, action, and resource context.

### Docker Compose Instead of Separate Manual Services

**Decision:** Docker Compose.

**Reason:** It provides a repeatable environment for the frontend, backend, and database, reducing differences between development and evaluation environments.

### Nginx and Gunicorn for Production-Style Serving

**Decision:** Nginx for the React frontend and Gunicorn for Django.

**Reason:** This separates frontend static-file delivery from backend API processing and provides a production-style container setup.

### Separate Frontend and Backend Applications

**Decision:** Independent React and Django applications.

**Reason:** This separation improves modularity, maintainability, and the ability to develop and deploy each application independently.

### UUID Primary Keys

**Decision:** UUIDs instead of sequential integer IDs for the main application entities.

**Reason:** UUIDs provide non-sequential identifiers and reduce exposure of easily guessable record IDs.

---


## 10. Conclusion

TaskFlow demonstrates a full-stack project management application built with Django REST Framework, React, and PostgreSQL.

The project focuses on clean application structure, RESTful API design, JWT authentication, resource-level PBAC authorization, relational data modeling, automated testing, and Docker-based deployment.

The goal is to provide a maintainable foundation that can be extended with additional project collaboration and task management features.
# Intelligent Todo List System

A modern, AI-powered todo list application with multi-language support and intelligent task suggestions. Built with React, TypeScript, FastAPI, and GraphQL.

## ✨ Features

### Core Features
- 📝 Create, edit, and delete tasks
- ✅ Mark tasks as complete/incomplete
- 🔥 Set urgency levels (0-3)
- 🔄 Sort tasks by timestamp or urgency
- 🗑️ Bulk delete functionality

### AI-Powered Features
- 🤖 Intelligent task suggestions based on:
  - Existing tasks
  - Time of day
  - Task patterns and categories
  - Urgency levels
- 🌏 Multi-language support (English, Chinese, Japanese)
- 🎯 Context-aware suggestions
- 🔄 Pattern-based follow-up tasks

### User Interface
- 🎨 Clean and modern design with shadcn/ui
- ⚡ Real-time updates with GraphQL
- 🔄 Loading states and spinners
- 🚨 Confirmation dialogs for destructive actions
- 📊 Smart sorting with visual indicators

## 🏗️ Architecture

### Component Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    TodoListContainer                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ State Management:                                     │  │
│  │ - Apollo Client Queries/Mutations                     │  │
│  │ - Sorting Logic                                       │  │
│  │ - Suggestion Generation                               │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐  │
│  │ TodoSection │    │  TodoList   │    │ SuggestionPanel │  │
│  └─────────────┘    └─────────────┘    └─────────────────┘  │
│         │                  │                    │           │
│         ▼                  ▼                    ▼           │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐  │
│  │   Form &    │    │    Todo     │    │  AI-Powered     │  │
│  │  Controls   │    │   Items     │    │  Suggestions    │  │
│  └─────────────┘    └─────────────┘    └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow Architecture
```
┌─────────────┐     GraphQL     ┌─────────────┐
│  React UI   │◄───────────────►│  FastAPI    │
└─────────────┘                 └─────────────┘
       │                               │
       ▼                               ▼
┌─────────────┐                 ┌─────────────┐
│   Apollo    │                 │  Strawberry │
│   Client    │                 │   GraphQL   │
└─────────────┘                 └─────────────┘
                                       │
                                       ▼
                                ┌─────────────┐
                                │ AI Service  │
                                │    Layer    │
                                └─────────────┘
                                       │
                                       ▼
                                ┌─────────────┐
                                │  SQLite     │
                                │  Database   │
                                └─────────────┘
```

### AI Service Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                      AI Service                             │
│                                                             │
│  ┌────────────────┐  ┌─────────────────┐  ┌─────────────┐   │
│  │ Multi-Language │  │   Time-based    │  │  Pattern    │   │
│  │   Detection    │  │   Suggestions   │  │  Matching   │   │
│  │  EN, ZH, JA    │  │                 │  │             │   │
│  └────────────────┘  └─────────────────┘  └─────────────┘   │
│                                                             │
│  ┌────────────────┐  ┌─────────────────┐  ┌─────────────┐   │
│  │   Urgency      │  │    Category     │  │  Follow-up  │   │
│  │  Processing    │  │   Detection     │  │  Generation │   │
│  └────────────────┘  └─────────────────┘  └─────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+
- Git
- DeepSeek API Key (see below)
- Docker and Docker Compose (for containerized setup)

### Docker Setup (Recommended)

The easiest way to run the application is using Docker. This method ensures consistent environments and eliminates the need for manual setup of Python and Node.js.

```bash
# Clone the repository
git clone https://github.com/baconlgtm/ToDoListSystem.git
cd ToDoListSystem

# Create and configure environment files
cp .env.example frontend/.env
cp .env.example backend/.env

# Build and start the containers
docker compose build
docker compose up -d

# View logs (optional)
docker compose logs -f
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- GraphQL Playground: http://localhost:8000/graphql

To stop the containers:
```bash
docker compose down
```

To rebuild after making changes:
```bash
docker compose build
docker compose up -d
```

### Manual Setup (Alternative)

If you prefer to run the application without Docker, follow these steps:

### Getting a DeepSeek API Key

The DeepSeek API key is required for the AI-powered suggestion feature. This feature uses DeepSeek's language model to generate intelligent todo suggestions based on your existing tasks.

To get an API key:
1. Visit the [DeepSeek Official Website](https://platform.deepseek.com/)
2. Sign up for a free account or log in if you already have one
3. Navigate to the API Keys section in your account dashboard
4. Click "Create New API Key"
5. Copy the generated API key
6. Add it to your `.env` file as shown in the Configuration section

Note: The free tier of DeepSeek API provides sufficient credits for testing and development purposes. Without this key, the suggestion feature will not work.

### Step 1: Clone and Setup
```bash
# Clone the repository
git clone https://github.com/baconlgtm/ToDoListSystem.git
cd ToDoListSystem

# Create and configure environment files
cp .env.example frontend/.env
cp .env.example backend/.env
```

### Step 2: Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up the SQLite database
alembic upgrade head

# Start the backend server
uvicorn main:app --reload
```

### Step 3: Frontend Setup
```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Step 4: Configuration

#### Backend Environment Variables (.env)
```env
DEEPSEEK_API_KEY=your_deepseek_api_key
```

### Step 5: Using the Application

1. Open your browser and navigate to http://localhost:5173
2. Create a new todo:
   - Enter a title in the input field
   - Select urgency level (0-3) using the dropdown
   - Click "Add Todo" or press Enter

3. Manage your todos:
   - Click the checkbox to mark a todo as complete/incomplete
   - Use the edit icon to modify a todo's title or urgency
   - Click the delete icon to remove a todo
   - Use "Delete All" to clear all todos (requires confirmation)
   - Use "Delete Completed" to remove completed todos

4. Generate AI Suggestions:
   - Click the lightbulb icon next to any todo
   - Wait for the AI to generate relevant suggestions
   - Select one or more suggestions from the dialog
   - Click "Apply Selected" to add them as new todos

5. Sort and Organize:
   - Use the sort dropdown to order by:
     - Timestamp (newest/oldest)
     - Urgency (high/low priority)
   - Todos are automatically saved and persisted

6. Multi-language Support:
   - Enter todos in English, Chinese, or Japanese
   - AI suggestions will be generated in the detected language
   - Language detection is automatic

## 🐳 Docker Setup

### Prerequisites
- Docker Desktop installed and running
- Docker Compose installed
- Git (for cloning the repository)

### Environment Setup

1. Create backend/.env file with the following content:
```env
# API Keys
DEEPSEEK_API_KEY=your_deepseek_api_key

# Database Configuration
DATABASE_URL=sqlite:///./todos.db

# CORS Settings
CORS_ORIGINS=["http://localhost:5173"]
```

### Running with Docker

1. **Test Docker Setup (Recommended)**
```bash
# Make the test script executable
chmod +x test_docker_setup.sh

# Run the test script
./test_docker_setup.sh
```
This script will:
- Check if Docker is running
- Verify docker-compose is installed
- Validate environment files
- Build and start containers
- Test if services are responding

2. **Manual Docker Setup**
```bash
# Build and start the containers
docker-compose up --build -d

# View logs (optional)
docker-compose logs -f

# Stop the containers
docker-compose down
```

### Accessing the Application
Once the containers are running, you can access:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- GraphQL Playground: http://localhost:8000/graphql

### Docker Container Structure
```
┌─────────────────┐      ┌─────────────────┐
│    Frontend     │      │     Backend     │
│   (Port 5173)   │◄────►│   (Port 8000)   │
│    Node.js      │      │    FastAPI      │
└─────────────────┘      └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │    SQLite DB    │
                        │   (Internal)    │
                        └─────────────────┘
```

### Troubleshooting Docker Setup

1. **Port Conflicts**
   If ports 5173 or 8000 are already in use:
   ```bash
   # Find processes using the ports
   lsof -i :5173
   lsof -i :8000
   
   # Stop the containers
   docker-compose down
   ```

2. **Container Logs**
   ```bash
   # View frontend logs
   docker-compose logs frontend
   
   # View backend logs
   docker-compose logs backend
   
   # Follow logs in real-time
   docker-compose logs -f
   ```

3. **Common Issues**
   - If the frontend fails to build but runs: This is expected as it runs in development mode
   - If the backend fails to start: Check the DEEPSEEK_API_KEY in backend/.env
   - If containers keep restarting: Check the logs for error messages

4. **Reset Everything**
   ```bash
   # Stop and remove all containers
   docker-compose down
   
   # Remove all built images
   docker-compose down --rmi all
   
   # Clean volumes (warning: this will delete the database)
   docker-compose down -v
   ```

## 🐳 Project Structure

```
ToDoListSystem/
├── frontend/                      # React frontend application
│   ├── src/
│   │   ├── components/           # React components
│   │   │   ├── ui/              # Reusable UI components
│   │   │   ├── TodoListContainer.tsx    # Main container component
│   │   │   ├── TodoSection.tsx          # Todo section with form and list
│   │   │   ├── SuggestionPanel.tsx      # AI suggestions dialog
│   │   │   └── SortDropdown.tsx         # Sorting component
│   │   ├── graphql/             # GraphQL queries and mutations
│   │   ├── types/               # TypeScript type definitions
│   │   ├── hooks/               # Custom React hooks
│   │   └── pages/               # Page components
│   ├── public/                  # Static assets
│   ├── tests/                   # Frontend tests
│   └── vite.config.ts          # Vite configuration
│
├── backend/                     # FastAPI backend application
│   ├── app/
│   │   ├── api/                # API endpoints
│   │   ├── graphql/            # GraphQL schema and resolvers
│   │   ├── models.py           # SQLAlchemy models
│   │   ├── crud.py            # Database operations
│   │   ├── schema.py          # Pydantic schemas
│   │   └── ai_service.py      # AI suggestion service
│   ├── tests/                  # Backend tests
│   ├── alembic/                # Database migrations
│   └── requirements.txt        # Python dependencies
│
├── docker-compose.yml          # Docker compose configuration
├── .gitignore                  # Git ignore rules
└── README.md                   # Project documentation
```

### Key Components

#### Frontend Components
- `TodoListContainer`: Main component managing application state and data flow
- `TodoSection`: Handles todo form and list rendering
- `SuggestionPanel`: Manages AI-generated suggestions display
- `ui/*`: Reusable UI components built with shadcn/ui

#### Backend Services
- `ai_service.py`: Handles AI-powered suggestion generation
- `crud.py`: Database operations for todos
- `schema.py`: GraphQL schema definitions
- `models.py`: SQLAlchemy database models

### Database Schema

```sql
Table: todos
├── id: Integer (Primary Key)
├── title: String
├── completed: Boolean
├── urgency: Integer
├── created_at: DateTime
└── updated_at: DateTime
```

### API Endpoints

#### GraphQL Endpoint
- `/graphql`: Main GraphQL endpoint

#### GraphQL Operations
- Queries:
  - `todos`: Get all todos
- Mutations:
  - `createTodo`: Create a new todo
  - `updateTodo`: Update an existing todo
  - `deleteTodo`: Delete a todo
  - `deleteAllTodos`: Delete all todos
  - `deleteCompletedTodos`: Delete completed todos
  - `generateTodoSuggestion`: Generate AI suggestions

For more detailed API documentation, run the backend server and visit `/docs` or `/graphql` for the GraphQL playground.
# Counselor Student Action Center

A lightweight, responsive, and visually stunning full-stack dashboard designed for academic counselors. The Counselor Student Action Center provides real-time triage summaries, enabling counselors to quickly evaluate a student's priorities, check upcoming or overdue tasks, monitor unread message counts, and dynamically update academic action plans.

---

## Project Architecture & Structure

The project is structured as a decoupled monorepo, cleanly dividing the backend API service and the frontend single-page application:

```
zyra/
├── server/                 # Node.js + Express + TypeScript Backend
│   ├── src/
│   │   ├── server.ts       # Express server initialization, endpoints, & triage rules
│   │   ├── mockData.ts     # Central database mock (students & academic tasks)
│   │   └── types.ts        # Common type interfaces (Student, Task, UrgencyLevel)
│   ├── tsconfig.json       # TypeScript configuration
│   ├── nodemon.json        # Nodemon watcher configuration
│   └── package.json        # Server scripts and dependencies
│
└── client/                 # React + TypeScript + Vite + CSS Variables Frontend
    ├── src/
    │   ├── components/
    │   │   ├── StudentProfileCard.tsx # Detailed student card, progress meters, & messaging
    │   │   └── TaskList.tsx           # Tasks manager, priority badges, & status buttons
    │   ├── App.tsx         # Dashboard layout, API state, & optimistic updates
    │   ├── main.tsx        # React DOM mounting
    │   ├── index.css       # Premium CSS design system (glassmorphism, variables)
    │   └── types.ts        # Client-side type declarations
    ├── tsconfig.json       # TypeScript configuration
    └── package.json        # Client scripts and dependencies
```

### Architectural Design Highlights
1. **Dynamic Counselor Triage Engine**: Instead of storing static urgency labels, the backend dynamically calculates the student's triage badge (`Critical`, `Medium`, or `Low`) in real-time. A student is labeled **Critical** if they have any overdue high-priority task, more than 3 unread messages, or their attendance rate falls below 88%.
2. **Premium CSS Layout**: Built with custom HSL tokens, backdrop blurs (`backdrop-filter`), transparent borders, Outfit headings, and responsive Grid layouts, creating a premium Glassmorphic aesthetic.
3. **Optimistic Updates & Network Robustness**: When a counselor clicks a status button (e.g. changing a task from "Pending" to "Completed"), the UI responds instantly and dynamically re-calculates the student's status badge. In the background, the client sends a `PATCH` request to the server. If a network interruption occurs, the frontend automatically rolls back to the original server state and alerts the user.

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16.0.0 or higher recommended)
- `npm` (packaged with Node.js)

---

### Step 1: Run the Backend API Server
1. Open a terminal and navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install server dependencies:
   ```bash
   npm install
   ```
3. Start the hot-reloading development server:
   ```bash
   npm run dev
   ```
The backend server will launch and listen on **`http://localhost:5000`**.

---

### Step 2: Run the Frontend Application
1. Open a second terminal window and navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install client dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
The frontend application will start up. Follow the terminal link to open it in your browser: **`http://localhost:5173/`**.

---

## API Contract

All endpoints support standard CORS and process standard JSON payloads.

### 1. Retrieve Action Center Data
- **Route**: `GET /students/:id/action-center` (supports `/api/students/:id/action-center` fallback)
- **Path Parameter**: `id` (e.g. `student-1`, `student-2`, `student-3`)
- **Method**: `GET`
- **Response Code**: `200 OK` on success, `404 Not Found` if student ID doesn't exist.
- **Sample Response Payload**:
```json
{
  "student": {
    "id": "student-1",
    "name": "Liam Carter",
    "email": "liam.carter@highschool.edu",
    "grade": "12th Grade",
    "counselorId": "counselor-1",
    "counselorName": "Sarah Jenkins",
    "unreadMessages": 5,
    "avatarUrl": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80",
    "gpa": 2.4,
    "attendanceRate": 85,
    "academicFocus": "Academic Recovery & College Preparation",
    "urgencyLevel": "Critical"
  },
  "tasks": [
    {
      "id": "task-1",
      "studentId": "student-1",
      "title": "Submit FAFSA Financial Aid Application",
      "description": "Complete and submit the FAFSA form online. Requires parent tax documents.",
      "status": "Pending",
      "priority": "High",
      "dueDate": "2026-05-20"
    }
  ]
}
```

---

### 2. Update Task Status
- **Route**: `PATCH /tasks/:taskId/status` (supports `/api/tasks/:taskId/status` fallback)
- **Path Parameter**: `taskId` (e.g. `task-1`, `task-2`, `task-3`)
- **Method**: `PATCH`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "status": "Completed" 
}
```
*Supported values: `"Pending" | "In Progress" | "Completed"`*

- **Response Code**: `200 OK` on success, `400 Bad Request` if status parameter is missing or invalid, `404 Not Found` if task ID doesn't exist.
- **Sample Response Payload**:
```json
{
  "id": "task-1",
  "studentId": "student-1",
  "title": "Submit FAFSA Financial Aid Application",
  "description": "Complete and submit the FAFSA form online. Requires parent tax documents.",
  "status": "Completed",
  "priority": "High",
  "dueDate": "2026-05-20"
}
```

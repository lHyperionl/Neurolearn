# NeuroLearn 🧠

NeuroLearn is a medical education platform prototype designed to help medical students learn to classify brain diagnoses from MRI scans. It features a high-fidelity, dark-themed radiology workstation aesthetic.

## 🚀 Quick Start

### Directory Structure

```text
MaPS/
├── app/               # Next.js App Router frontend
├── components/        # Shared React components (Shadcn/Niivue)
├── backend/           # FastAPI backend
│   ├── data/          # NIfTI MRI Cases (mounted in dev)
│   ├── docs/          # TSV Data (mounted in dev)
│   ├── main.py        # API Entrypoint
│   ├── database.py    # SQLite Config
│   ├── models.py      # SQLAlchemy Models
│   └── import_participants.py # Seeder script
├── public/            # Static Next.js assets
├── .env.example       # Example env variables
└── docker-compose.yml # Development orchestration
```

### Local Setup Instructions (Step-by-Step)

1. **Clone the repository.**
2. **Setup Environment:** Copy the example config:
    ```bash
    cp .env.example .env
    ```
3. **Start the Development Environment:**
    ```bash
    docker compose up -d --build
    ```
    _(This starts frontend on `:3000` and backend on `:8000` with hot-reloading enabled)._

### Migrations & Seed Data

The database schema initializes automatically on backend startup. To seed the database with participant data from the `.tsv` file:

```bash
docker compose exec backend python -m import_participants
```

### Verification & Health Checks

- **Backend Health:** Open `http://localhost:8000/APIhealth` (Should return `{"message": "API is running"}`).
- **Frontend App:** Open `http://localhost:3000` and ensure the MRI Viewer loads successfully.
- Check logs if issues arise: `docker compose logs -f`

### Recommended IDEs & Workflow

- **VS Code:** Recommended with extensions for Python, Pylance, Prettier, ESLint, and Tailwind CSS.
- **Cross-Platform:** Works natively on macOS/Linux. On Windows, ensure Docker Desktop is configured to use the **WSL2 backend**, and clone the repository directly inside the WSL filesystem (e.g., `~/projects/maps`) to avoid SQLite file-locking issues and drastically improve volume mount performance.

### Troubleshooting

- **"ModuleNotFoundError: No module named 'nibabel'":** Ensure the backend container rebuilt correctly after a `requirements.txt` update (`docker compose build backend`).
- **SQLite "database is locked":** Occurs frequently on Windows NTFS mounts. Always use WSL2 for Docker volumes on Windows.
- **CORS Errors:** Verify `NEXT_PUBLIC_API_URL` in `.env` perfectly matches the URL you are using to access the frontend (e.g., `http://127.0.0.1:8000` vs `http://localhost:8000`).

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Runtime**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Components**: [shadcn](https://ui.shadcn.com/) & [@base-ui/react](https://base-ui.com/)
- **MRI Viewer**: [@niivue/niivue](https://niivue.github.io/niivue/) (NIfTI format support)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Backend**: [FastAPI](https://fastapi.dev/) with [SQLAlchemy](https://sqlalchemy.org/)

## 📁 Project Structure

- `app/`: Next.js App Router pages and layouts.
    - `learn/`: Interactive MRI study module.
    - `test/`: Self-assessment module with progress tracking.
- `components/`: Reusable UI and feature-specific components.
    - `learn/`: MRI Viewer, Diagnosis Cards, and Chat Panel.
    - `test/`: Question cards and results summaries.
    - `ui/`: Shared shadcn/ui components.
- `lib/`: Utility functions and mock data.
- `public/`: Static assets and icons.

## 🎨 Aesthetic Direction

The project follows a "Radiology Reading Room" aesthetic:

- **Dark Theme**: Deep near-black backgrounds (`#0a0c0f`, `#0f1117`).
- **Accent**: Cool electric cyan (`#00d4ff`) for primary actions and glowing effects.
- **Typography**:
    - `Syne` for headings.
    - `JetBrains Mono` for metadata and technical labels.
    - `DM Sans` for body copy.

## 🧪 Mock Data

All data is statically mocked in [lib/mock-data.ts](lib/mock-data.ts). MRI images use [placehold.co](https://placehold.co) with specific parameters to mimic radiological scans.

## 📜 Available Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Creates an optimized production build.
- `npm run start`: Starts the production server.
- `npm run lint`: Runs ESLint for code quality checks.

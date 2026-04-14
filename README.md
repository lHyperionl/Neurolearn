# NeuroLearn 🧠

NeuroLearn is a medical education platform prototype designed to help medical students learn to classify brain diagnoses from MRI scans. It features a high-fidelity, dark-themed radiology workstation aesthetic.

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.0.0 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. Clone the repository
2. Install dependencies:
    ```bash
    npm install
    ```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

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

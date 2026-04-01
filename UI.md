# NeuroLearn UI Specification

NeuroLearn is a medical education platform prototype designed to help medical students learn to classify brain diagnoses from MRI scans.

---

## TECH STACK

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Components**: shadcn/ui (Radix-based) + @base-ui/react
- **Animations**: Framer Motion + tw-animate-css
- **Icons**: lucide-react
- **Data**: Static mock data (no backend/APIs)

---

## AESTHETIC DIRECTION

The UI follows a "Radiology Reading Room" aesthetic with Medical Precision meets Dark Sci-Fi.

- **Theme**: Dark Mode Only
- **Primary Colors**:
    - Background: Deep charcoal (`#0c0e11`)
    - Accent/Primary: Electric Cyan/Blue (`#a8e8ff` / `#3cd7ff`)
    - Secondary: Muted Amber/Orange (`#ffb95f` / `#ee9800`) for highlights/warnings
- **Typography**:
    - `Syne`: Headings and Branding
    - `JetBrains Mono`: Technical labels, metadata, and classification tags
    - `DM Sans` / Sans-serif: General UI and body text
- **Polish**:
    - Subtle grid/panel layouts (PACS style)
    - Glowing borders and cyan/amber tints
    - Framer Motion page transitions and staggered reveals

---

## APP STRUCTURE

### Layout ([app/layout.tsx](app/layout.tsx))

- **Navbar**: Persistent top bar with Branding (Syne font + brain icon), Navigation (Learn, Test Yourself), and User profile.
- **Sidebar**: Contextual navigation elements.
- **Background**: Dark base with radial gradients and subtle scanline/noise effects.

---

### PAGE 1: Learn Page ([app/learn/page.tsx](app/learn/page.tsx))

Interactive study module with a 60/40 panel split.

**Left Panel: MRI Viewer**

- Large dark panel for high-fidelity MRI image display.
- Toolbar: Zoom, Reset, Toggle Annotations (mock functionality).
- Image Slices: Carousel/Grid of thumbnails to switch between AXIAL, SAGITTAL, and CORONAL views.
- Status Badge: Indicates scan sequence (e.g., "AXIAL / T1_CONTRAST").

**Right Panel: Study Info & Support**

- **Diagnosis Card**: Title (GBM, Meningioma, etc.), metadata tags (Grade, Malignancy), description, and collapsible "Key Features" list.
- **Differential Diagnoses**: Clickable chips for related pathologies.
- **AI Study Assistant**: Interactive scrollable chat interface with predefined exchanges and functional text input (simulated responsiveness).

---

### PAGE 2: Test Yourself Page ([app/test/page.tsx](app/test/page.tsx))

Self-assessment module for diagnostic training.

- **Progress Tracking**: Segmented progress bar showing current/total questions.
- **Question Card**:
    - MRI scan display.
    - Diagnostic options with descriptive hints.
    - Interactive validation: Correct (Green/Check), Incorrect (Red/X).
    - Feedback Panel: Explanatory text appearing after submission.
- **Results Summary**: Final score overview with score breakdown and "Try Again" functionality.

---

## CORE COMPONENTS

### Feature-Specific

- `components/learn/`: `MRIViewer.tsx`, `DiagnosisCard.tsx`, `ChatPanel.tsx`
- `components/test/`: `QuestionCard.tsx`, `ProgressBar.tsx`, `ResultsSummary.tsx`, `Footer.tsx`
- `components/nav/`: `Navbar.tsx`, `Sidebar.tsx`

### UI primitives ([components/ui/](components/ui/))

- Standardized components: `button`, `card`, `badge`, `scroll-area`, `tooltip`, `accordion`, `input`, `separator`.

---

## DATA MANAGEMENT

All content is centralized in [lib/mock-data.ts](lib/mock-data.ts), defining:

- `diagnoses`: Detailed medical information and MRI image links.
- `questions`: Test pool with options, correct answers, and explanations.
- `chatMessages`: Initial conversation state for the AI tutor.

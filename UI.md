Build a Next.js 14 (App Router) frontend-only UI prototype for a medical education platform
called "NeuroLearn" — a tool that helps medical students learn to classify brain diagnoses
from MRI scans.

---

## TECH STACK & CONSTRAINTS

- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- Framer Motion for animations
- shadcn/ui for base components (install only what's needed)
- lucide-react for icons
- All data is mocked/static — NO backend, NO API calls
- Use placeholder images from https://placehold.co for any MRI thumbnails (use dark grayscale
  tones like bg #1a1a1a, text #666 to mimic real MRI aesthetics: e.g.
  https://placehold.co/400x400/111111/444444)

---

## AESTHETIC DIRECTION

Medical precision meets dark sci-fi. Think radiology reading room — dark environment,
high-contrast clinical data, glowing accents.

- Dark theme ONLY: deep near-black backgrounds (#0a0c0f, #0f1117)
- Accent color: cool electric cyan (#00d4ff) with a secondary of muted amber (#f59e0b)
  for warnings/highlights
- Typography: Use "Syne" (Google Font) for headings and "JetBrains Mono" for labels,
  metadata, and classification tags. Body text in a clean sans-serif like "DM Sans".
- Subtle animated scanline or noise texture overlay on the background (CSS only, very subtle)
- Grid/panel layout evoking PACS radiology workstations
- Glowing borders and subtle inner shadows on key panels
- Smooth page transitions using Framer Motion

---

## APP STRUCTURE

### Layout (app/layout.tsx)

- Persistent top navigation bar with:
    - Logo: "NeuroLearn" in Syne font with a small brain icon
    - Nav links: "Learn" and "Test Yourself"
    - A user avatar placeholder (initials circle) top right
    - Subtle bottom border on navbar with cyan glow
- Background: dark base with a very faint radial gradient emanating from center

---

### PAGE 1: Learn Page (app/learn/page.tsx)

This is the main study view. Layout is a two-column grid (roughly 60/40 split):

**Left Panel — MRI Viewer:**

- A large dark panel labeled "MRI Viewer" in monospace font
- Display a placeholder MRI brain image (square, grayscale placeholder) in the center
- Below the image: a row of 3–4 smaller MRI "slice" thumbnails the student can click
  to "switch views" (mock — just swaps the main image placeholder for a slightly
  different placehold.co URL)
- A toolbar row above the image with icon buttons for: Zoom In, Zoom Out, Reset View,
  Toggle Annotations — all non-functional but visually present, styled as icon-only
  buttons with tooltip labels on hover
- A small badge in the top-left corner of the main image reading "AXIAL / T1" in
  JetBrains Mono
- A subtle animated pulsing ring or glow effect around the main image panel to give
  it a "live/active scan" feel

**Right Panel — Diagnosis Info + Chat:**
Split vertically into two sub-sections:

Top section — Diagnosis Card:

- Title: "Glioblastoma Multiforme (GBM)" in large Syne font
- A row of metadata tags: "Grade IV", "High Malignancy", "WHO Class" — styled as
  small capsule badges
- A short mock description paragraph (2–3 sentences) about the diagnosis
- A collapsible "Key Features on MRI" section that expands to show a bullet list
  of 4–5 radiological findings (e.g., "Ring-enhancing lesion", "Central necrosis", etc.)
- A "Differential Diagnoses" section showing 2–3 alternative diagnoses as clickable
  chips — clicking one just highlights it (no routing needed)

Bottom section — AI Study Assistant (Chat):

- Header: "Study Assistant" with a small AI sparkle icon
- A scrollable mock chat window with 2–3 pre-populated message exchanges between
  "Student" and "NeuroLearn AI" — example questions like
  "What makes GBM different from a brain abscess on T1?" with a detailed mock answer
- A text input bar at the bottom with a send button — input should be functional
  (captures text, appends a mock "Thinking…" bubble then a canned response like
  "Great question! This feature will be powered by AI in the full version."
  after a 1.5s delay)
- Messages styled differently for student vs AI (alignment, color, avatar)

---

### PAGE 2: Test Yourself Page (app/test/page.tsx)

This is the self-assessment view. The student is shown MRI images and must classify them.

**Layout — full width, centered content, max-w-5xl:**

**Top progress bar:**

- Shows "Question 3 of 10" with a segmented progress bar (each segment = one question,
  filled cyan for completed, amber for current, dark for remaining)

**Main Question Card:**

- Large card with a dark panel background and subtle border
- Headline: "Classify this MRI scan" in Syne
- Below: a large MRI placeholder image (mock grayscale placehold.co)
- Below the image: a row of 4 answer option buttons — each is a large pill/card button
  containing the diagnosis name and a 1-line hint (e.g., "Glioblastoma — ring-enhancing
  with necrosis")
- Interaction states:
    - Default: dark card, subtle border
    - Hover: border glows cyan
    - Selected (before submit): highlighted with cyan border + background tint
    - After "Check Answer" is clicked:
        - Correct answer turns green with a checkmark icon
        - Wrong selected answer turns red with an X icon
        - A feedback panel slides in below showing: "Correct!" or "Not quite." +
          a 2-sentence explanation of what to look for
    - A "Next Question →" button appears after answering

**Mock answer set for the prototype (hardcode 3–4 questions minimum):**
Include these diagnoses as answer pools (mix them across questions):

- Glioblastoma Multiforme
- Meningioma
- Multiple Sclerosis
- Brain Abscess
- Acoustic Neuroma
- Ischemic Stroke

**Bottom of page:**

- After the last question: show a Results Summary card with:
    - Score: "7 / 10 Correct"
    - A simple segmented visual breakdown (correct vs incorrect)
    - Two buttons: "Review Mistakes" (non-functional, just a disabled styled button)
      and "Try Again" (resets to question 1)

---

## INTERACTIONS & ANIMATIONS

- Page load: staggered fade-up reveal of panels using Framer Motion
- Answer selection: smooth scale + border transition (no layout shift)
- Feedback reveal: slide-down animation
- Chat messages: fade-in as they appear
- Slice thumbnail switching: crossfade the main image
- All hover states: smooth 150–200ms transitions
- Scanline background: subtle CSS animation, opacity ~0.03, should not distract

---

## FILE STRUCTURE SUGGESTION

app/
layout.tsx # root layout with nav
page.tsx # redirect to /learn
learn/
page.tsx
test/
page.tsx
components/
nav/Navbar.tsx
learn/MRIViewer.tsx
learn/DiagnosisCard.tsx
learn/ChatPanel.tsx
test/QuestionCard.tsx
test/ProgressBar.tsx
test/ResultsSummary.tsx
ui/ # shadcn components
lib/
mock-data.ts # all mock questions, diagnoses, chat messages

---

## ADDITIONAL NOTES

- Ensure the layout is fully responsive down to tablet (768px). Mobile is not a priority
  but should not completely break.
- Use semantic HTML where appropriate (main, section, article, aside)
- Every component should have clear TypeScript interfaces for its props
- Add a /lib/mock-data.ts file with all hardcoded content so it's easy to swap later
- The prototype should feel like a real, polished product — not a wireframe

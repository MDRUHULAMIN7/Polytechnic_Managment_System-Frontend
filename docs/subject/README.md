# Frontend Documentation: Subject Module

## Feature Overview
The Subject module frontend provides a robust interface for administrators to manage the academic curriculum. It includes a searchable list of subjects, detailed creation/edit forms with dynamic marking schemes, and an instructor assignment interface.

## Existing Problems (Pre-Refactor)
- **Monolithic Components**: The `SubjectFormModal` was a 800+ line file, making it extremely difficult to maintain and debug.
- **Prop Drilling & Bloated State**: The main page was managing state for assignments, deletions, and edits, leading to unnecessary re-renders.
- **Complex Validation Logic**: Marking scheme validation was mixed with UI rendering logic.
- **Performance**: Large forms with many dynamic inputs (assessment components, prerequisites) were sluggish.

## Refactor Solutions
### 1. Component Decomposition
We broke down the monolithic form into modular, single-responsibility components:
- `BasicInfoSection`: Handles title, code, and credits.
- `MarkingSchemeSection`: Manages official bucket totals.
- `AssessmentComponentsSection`: Handles the dynamic list of marks entry items.
- `PrerequisitesSection`: Manages subject relationships.

### 2. Self-Contained Modals
The `SubjectAssignModal` was refactored to be self-sufficient. It now handles its own:
- Data fetching (loading instructors).
- Action triggering (assigning/removing).
- Loading states.
This removed over 100 lines of code and multiple state variables from the parent `SubjectPage`.

## Frontend Architecture

### Component Flow
1. **SubjectPage**: Server-side fetching for initial list data.
2. **SubjectTable**: Renders data and provides action triggers (Edit, Assign, Delete).
3. **Modals**: Lazily mounted or conditionally rendered forms for specific operations.

### Folder Structure
```text
frontend/components/dashboard/admin/subject/
├── form/                         # Refactored sub-sections
│   ├── basic-info-section.tsx
│   ├── marking-scheme-section.tsx
│   ├── assessment-components-section.tsx
│   ├── prerequisites-section.tsx
│   └── ...
├── subject-page.tsx              # Main entry point (Simplified)
├── subject-form-modal.tsx        # Shell for creation/editing
└── subject-assign-modal.tsx      # Self-contained assignment logic
```

## Performance & Rendering Optimization
- **`useCallback` & `useMemo`**: Implemented stable function references for form updates to prevent unnecessary child component re-renders.
- **Strict Typing**: Replaced `any` with generic type constraints in update handlers, enabling better IDE support and catching bugs during development.
- **Optimized Imports**: Consolidated API actions and type imports to reduce bundle size and improve readability.

## API Integration Improvements
- **Action Consolidation**: Moved related API calls into the modal lifecycle (`useEffect`) to ensure data is fresh and only loaded when needed.
- **Error Handling**: Implemented a unified `getSafeClientErrorMessage` utility to provide consistent, user-friendly feedback on API failures.

## Future Scalability
- The modular form structure allows adding new sections (e.g., Syllabus, Course Outcomes) without touching existing logic.
- The self-contained modal pattern can be replicated for other complex dashboard entities (Students, Instructors).

# Offered Subject Frontend Module

## Overview
The **Offered Subject** frontend module provides a comprehensive interface for administrators, instructors, and students to interact with subjects offered in a specific semester. It includes tools for manual offering, AI-assisted schedule planning, and detailed viewing of offered subject configurations.

## Existing UI/UX Problems (Resolved)
- **Vague Button Labels**: The "View Mark" button was misleading as it primarily showed offered subject details, not just marks.
- **Unclear Capacity**: Only remaining seats were shown (e.g., `38`), making it impossible to know the total class size at a glance.
- **Monolithic Components**: The form modal was over 1500 lines, making maintenance and debugging difficult.
- **Inconsistent Theme Contrast**: The light theme had low contrast and suboptimal spacing for long-term use.

## Implemented Improvements
- **Clarified Intent**: Renamed action buttons to **Details** to accurately reflect the modal's content.
- **Better Data Presentation**: Capacity now follows the `Total / Remaining` format (e.g., `40 / 38`).
- **Modern UI**: Integrated card-based layouts, consistent iconography from `lucide-react`, and refined typography.
- **Theme Polish**: Updated light theme variables in `globals.css` for softer backgrounds and higher contrast text.

## User Flow
1. **Admin**: Navigates to Offered Subjects -> Views list -> Clicks "Details" or "Edit" -> Uses Form Modal (manual or AI-assisted) to manage schedules.
2. **Instructor/Student**: Navigates to their respective Offered Subjects page -> Views assigned/available subjects -> Clicks "Details" to see schedule and marking snapshot.

## Component Structure
The module is built using a highly modular architecture:

### 1. Page Shells
- `offered-subject-page.tsx`: The main entry point for different roles (Admin/Student/Instructor).
- `offered-subject-table.tsx`: A reusable table component that adapts its actions based on props.

### 2. Form Decomposition (New Strategy)
The form modal has been split into dedicated sub-components for better scalability:
- **`BasicInfoSection`**: Handles subject selection, instructor assignment, and capacity.
- **`SupportSection`**: Provides scheduling aids like AI Planner links and instructor busy-slot checking.
- **`ScheduleBlocksSection`**: A complex dynamic section for adding multiple room/time assignments with real-time room availability validation.

### 3. State & Validation
- Uses a centralized `OfferedSubjectFormState` to manage complex multi-block schedules.
- Real-time room occupancy checks via `useSemesterRoomOccupancy` hook.

## API Integration & Optimization
- **Server Actions**: Uses `createOfferedSubjectAction` and `updateOfferedSubjectAction` for secure data mutations.
- **Optimized Fetching**: Uses `.select()` on the backend to fetch only necessary fields for comparable subject checks, reducing payload size.
- **Query Keys**: Implemented consistent query key management for efficient caching and invalidation.

## Performance Optimization
- **Render Optimization**: Split large components into smaller, focused ones to reduce re-render scope.
- **Conditional Loading**: Busy slots and room availability are only checked when required inputs (instructor, registration) are selected.
- **Skeleton States**: Implemented `TableSkeleton` for a smoother initial loading experience.

## Future Scalability
- **Reusable Form Sections**: The `BasicInfoSection` and `ScheduleBlocksSection` can be repurposed for other scheduling modules (e.g., Class Sessions).
- **Type-Safe Props**: Uses shared UI types in `lib/type/dashboard/admin/offered-subject/ui.ts` to ensure consistency between the main modal and its children.
- **Flexible Table**: The table component is designed to be extensible, allowing new columns or actions to be added with minimal changes.

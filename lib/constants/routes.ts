/**
 * Centralized route and constant definitions
 * This prevents hardcoding paths throughout the codebase
 */

// Public routes
export const PUBLIC_ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  CONTACT: "/contact",
  ACADEMIC_CALENDAR: "/academic-calendar",
  ACADEMIC_INSTRUCTORS: "/academic-instructors",
  ALUMNI: "/alumni",
  EVENTS: "/events",
  NOTICES: "/notices",
  LOGIN: "/login",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
} as const;

// Dashboard routes
export const DASHBOARD_ROUTES = {
  HOME: "/dashboard",
  ADMIN: "/dashboard/admin",
  ADMIN_SUBJECTS: "/dashboard/admin/subjects",
  ADMIN_INSTRUCTORS: "/dashboard/admin/instructors",
  ADMIN_STUDENTS: "/dashboard/admin/students",
  ADMIN_ROOMS: "/dashboard/admin/rooms",
  ADMIN_SEMESTERS: "/dashboard/admin/semesters",
  ADMIN_DEPARTMENTS: "/dashboard/admin/departments",
  ADMIN_NOTICES: "/dashboard/admin/notices",
  ADMIN_PERIOD_CONFIG: "/dashboard/admin/period-config",
  ADMIN_OFFERED_SUBJECTS: "/dashboard/admin/offered-subjects",
  ADMIN_SEMESTER_REGISTRATION: "/dashboard/admin/semester-registration",
  ADMIN_CURRICULUM: "/dashboard/admin/curriculum",
  ADMIN_ACADEMIC_SEMESTER: "/dashboard/admin/academic-semester",
  ADMIN_ACADEMIC_INSTRUCTOR: "/dashboard/admin/academic-instructor",

  INSTRUCTOR: "/dashboard/instructor",
  INSTRUCTOR_CLASSES: "/dashboard/instructor/classes",
  INSTRUCTOR_ATTENDANCE: "/dashboard/instructor/attendance",
  INSTRUCTOR_MARKS: "/dashboard/instructor/marks",

  STUDENT: "/dashboard/student",
  STUDENT_COURSES: "/dashboard/student/courses",
  STUDENT_ATTENDANCE: "/dashboard/student/attendance",
  STUDENT_MARKS: "/dashboard/student/marks",

  PROFILE: "/dashboard/profile",
  FORBIDDEN: "/dashboard/forbidden",
  NOT_FOUND: "/dashboard/[...missing]",
} as const;

// API routes
export const API_ROUTES = {
  // Auth
  AUTH_LOGIN: "/api/auth/login",
  AUTH_LOGOUT: "/api/auth/logout",
  AUTH_REFRESH: "/api/auth/refresh",
  AUTH_ME: "/api/auth/me",

  // Admin
  ADMIN_SUBJECTS: "/api/subjects",
  ADMIN_INSTRUCTORS: "/api/instructors",
  ADMIN_STUDENTS: "/api/students",
  ADMIN_ROOMS: "/api/rooms",
  ADMIN_SEMESTERS: "/api/semesters",
  ADMIN_DEPARTMENTS: "/api/departments",
  ADMIN_NOTICES: "/api/notices",
  ADMIN_PERIOD_CONFIG: "/api/period-config",
  ADMIN_OFFERED_SUBJECTS: "/api/offered-subjects",
  ADMIN_CURRICULUM: "/api/curriculum",
  ADMIN_ACADEMIC_SEMESTER: "/api/academic-semester",
  ADMIN_ACADEMIC_INSTRUCTOR: "/api/academic-instructor",
  ADMIN_SEMESTER_REGISTRATION: "/api/semester-registration",

  // Public
  PUBLIC_NOTICES: "/api/notices/public",
  PUBLIC_INSTRUCTORS: "/api/instructors/public",
  PUBLIC_DEPARTMENTS: "/api/departments/public",
  PUBLIC_EVENTS: "/api/events/public",

  // Chatbot
  CHATBOT: "/api/chatbot",
} as const;

// Query parameter names
export const QUERY_PARAMS = {
  PAGE: "page",
  LIMIT: "limit",
  SORT: "sort",
  SEARCH: "search",
  FILTER: "filter",
  STATUS: "status",
  ROLE: "role",
  DEPARTMENT: "department",
} as const;

// Cache tags for revalidation
export const CACHE_TAGS = {
  // Subjects
  SUBJECT_LIST: "subject-list",
  SUBJECT_DETAIL: (id: string) => `subject-${id}`,

  // Instructors
  INSTRUCTOR_LIST: "instructor-list",
  INSTRUCTOR_DETAIL: (id: string) => `instructor-${id}`,

  // Students
  STUDENT_LIST: "student-list",
  STUDENT_DETAIL: (id: string) => `student-${id}`,

  // Notices
  NOTICE_LIST: "notice-list",
  NOTICE_DETAIL: (id: string) => `notice-${id}`,
  PUBLIC_NOTICES: "public-notices",

  // Rooms
  ROOM_LIST: "room-list",

  // Semesters
  SEMESTER_LIST: "semester-list",
  CURRENT_SEMESTER: "current-semester",

  // Departments
  DEPARTMENT_LIST: "department-list",

  // Offered Subjects
  OFFERED_SUBJECT_LIST: "offered-subject-list",

  // Period Config
  PERIOD_CONFIG: "period-config",

  // All data (use sparingly)
  ALL: "all-cache",
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 25,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
} as const;

// Validation limits
export const VALIDATION_LIMITS = {
  NAME_MIN: 2,
  NAME_MAX: 100,
  EMAIL_MIN: 5,
  EMAIL_MAX: 255,
  DESCRIPTION_MIN: 10,
  DESCRIPTION_MAX: 5000,
  CODE_MIN: 1,
  CODE_MAX: 999999,
  PHONE_MIN: 10,
  PHONE_MAX: 20,
} as const;

// Time limits (in milliseconds)
export const TIME_LIMITS = {
  API_TIMEOUT: 30000, // 30 seconds
  LONG_REQUEST_THRESHOLD: 5000, // 5 seconds
  RETRY_BACKOFF: 1000, // 1 second base backoff
} as const;

// HTTP Status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

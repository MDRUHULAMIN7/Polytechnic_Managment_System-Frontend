import type { AcademicDepartment } from "@/lib/type/dashboard/admin/academic-department";

export type InstructorName = {
  firstName: string;
  middleName?: string;
  lastName: string;
};

export type InstructorStatus = "active" | "blocked";

export type InstructorUserSummary = {
  _id: string;
  id?: string;
  email?: string;
  role?: string;
  status?: InstructorStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type InstructorBloodGroup =
  | "A+"
  | "A-"
  | "B+"
  | "B-"
  | "AB+"
  | "AB-"
  | "O+"
  | "O-";

export type InstructorGender = "male" | "female" | "other";

export type Instructor = {
  _id: string;
  id: string;
  name: InstructorName;
  designation: string;
  gender: InstructorGender;
  dateOfBirth?: string;
  email: string;
  contactNo: string;
  emergencyContactNo: string;
  bloogGroup?: InstructorBloodGroup;
  presentAddress: string;
  permanentAddress: string;
  profileImg?: string;
  academicDepartment?: AcademicDepartment | string;
  academicInstructor?: string;
  user?: InstructorUserSummary;
  createdAt?: string;
  updatedAt?: string;
};

export type InstructorSortOption = "-createdAt" | "createdAt";

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
};

export type InstructorListPayload = {
  meta: PaginationMeta;
  result: Instructor[];
};

export type InstructorListParams = {
  searchTerm?: string;
  page?: number;
  limit?: number;
  sort?: InstructorSortOption;
  academicDepartment?: string;
  fields?: string;
};

export type InstructorInput = {
  designation: string;
  name: InstructorName;
  gender: InstructorGender;
  dateOfBirth?: string;
  email: string;
  contactNo: string;
  emergencyContactNo: string;
  bloogGroup?: InstructorBloodGroup;
  presentAddress: string;
  permanentAddress: string;
  profileImg?: string;
  academicDepartment: string;
};

export type InstructorCreatePayload = {
  password?: string;
  instructorData: InstructorInput;
};

export type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  meta?: PaginationMeta;
};

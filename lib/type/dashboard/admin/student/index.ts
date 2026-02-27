import type { AcademicDepartment } from "@/lib/type/dashboard/admin/academic-department";
import type { AcademicSemester } from "@/lib/type/dashboard/admin/academic-semester";

export type StudentName = {
  firstName: string;
  middleName?: string;
  lastName: string;
};

export type StudentGuardian = {
  fatherName: string;
  fatherOccupation: string;
  fatherContactNo: string;
  motherName: string;
  motherOccupation: string;
  motherContactNo: string;
};

export type StudentLocalGuardian = {
  name: string;
  occupation: string;
  contactNo: string;
  address: string;
};

export type StudentStatus = "active" | "blocked";

export type StudentUserSummary = {
  _id: string;
  id?: string;
  email?: string;
  role?: string;
  status?: StudentStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type StudentBloodGroup =
  | "A+"
  | "A-"
  | "B+"
  | "B-"
  | "AB+"
  | "AB-"
  | "O+"
  | "O-";

export type Student = {
  _id: string;
  id: string;
  name: StudentName;
  gender: "male" | "female" | "others";
  dateOfBirth?: string;
  email: string;
  contactNo: string;
  emergencyContactNo: string;
  bloodGroup?: StudentBloodGroup;
  presentAddress: string;
  permanentAddress: string;
  guardian: StudentGuardian;
  localGuardian: StudentLocalGuardian;
  profileImg?: string;
  admissionSemester?: AcademicSemester | string;
  academicDepartment?: AcademicDepartment | string;
  academicInstructor?: string;
  user?: StudentUserSummary;
  createdAt?: string;
  updatedAt?: string;
};

export type StudentSortOption =
  | "-createdAt"
  | "createdAt"
  | "name.firstName"
  | "-name.firstName"
  | "email"
  | "-email";

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
};

export type StudentListPayload = {
  meta: PaginationMeta;
  result: Student[];
};

export type StudentListParams = {
  searchTerm?: string;
  page?: number;
  limit?: number;
  sort?: StudentSortOption;
  academicDepartment?: string;
  admissionSemester?: string;
  fields?: string;
};

export type StudentInput = {
  name: StudentName;
  gender: "male" | "female" | "others";
  dateOfBirth?: string;
  email: string;
  contactNo: string;
  emergencyContactNo: string;
  bloodGroup?: StudentBloodGroup;
  presentAddress: string;
  permanentAddress: string;
  guardian: StudentGuardian;
  localGuardian: StudentLocalGuardian;
  admissionSemester: string;
  academicDepartment: string;
  profileImg?: string;
};

export type StudentCreatePayload = {
  password?: string;
  studentData: StudentInput;
};

export type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  meta?: PaginationMeta;
};

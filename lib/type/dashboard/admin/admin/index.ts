export type AdminName = {
  firstName: string;
  middleName?: string;
  lastName: string;
};

export type AdminStatus = "active" | "blocked";

export type AdminUserSummary = {
  _id: string;
  id?: string;
  email?: string;
  role?: string;
  status?: AdminStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminBloodGroup =
  | "A+"
  | "A-"
  | "B+"
  | "B-"
  | "AB+"
  | "AB-"
  | "O+"
  | "O-";

export type AdminGender = "male" | "female" | "other";

export type Admin = {
  _id: string;
  id: string;
  name: AdminName;
  designation: string;
  gender: AdminGender;
  dateOfBirth?: string;
  email: string;
  contactNo: string;
  emergencyContactNo: string;
  bloogGroup?: AdminBloodGroup;
  presentAddress: string;
  permanentAddress: string;
  profileImg?: string;
  user?: AdminUserSummary;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminSortOption = "-createdAt" | "createdAt";

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
};

export type AdminListPayload = {
  meta: PaginationMeta;
  result: Admin[];
};

export type AdminListParams = {
  searchTerm?: string;
  page?: number;
  limit?: number;
  sort?: AdminSortOption;
  fields?: string;
};

export type AdminInput = {
  designation: string;
  name: AdminName;
  gender: AdminGender;
  dateOfBirth?: string;
  email: string;
  contactNo: string;
  emergencyContactNo: string;
  bloogGroup?: AdminBloodGroup;
  presentAddress: string;
  permanentAddress: string;
  profileImg?: string;
};

export type AdminCreatePayload = {
  password?: string;
  adminData: AdminInput;
};

export type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  meta?: PaginationMeta;
};

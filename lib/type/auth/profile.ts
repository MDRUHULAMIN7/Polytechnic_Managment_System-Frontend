import type { AuthRole } from "@/lib/type/auth/login";

export type AccountStatus = "active" | "blocked";

export type ProfileName = {
  firstName?: string;
  middleName?: string;
  lastName?: string;
};

export type ProfileGuardian = {
  fatherName?: string;
  fatherOccupation?: string;
  fatherContactNo?: string;
  motherName?: string;
  motherOccupation?: string;
  motherContactNo?: string;
};

export type ProfileLocalGuardian = {
  name?: string;
  occupation?: string;
  contactNo?: string;
  address?: string;
};

export type ProfileReference = {
  _id?: string;
  name?: string;
  year?: string;
  code?: string;
  startMonth?: string;
  endMonth?: string;
};

export type CurrentUserAccount = {
  _id?: string;
  id?: string;
  email?: string;
  role?: AuthRole;
  status?: AccountStatus;
  needsPasswordChange?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CurrentUserProfile = {
  _id?: string;
  id?: string;
  role?: AuthRole;
  status?: AccountStatus;
  needsPasswordChange?: boolean;
  name?: ProfileName;
  designation?: string;
  gender?: string;
  dateOfBirth?: string;
  email?: string;
  contactNo?: string;
  emergencyContactNo?: string;
  bloodGroup?: string;
  bloogGroup?: string;
  presentAddress?: string;
  permanentAddress?: string;
  profileImg?: string;
  guardian?: ProfileGuardian;
  localGuardian?: ProfileLocalGuardian;
  admissionSemester?: ProfileReference | string;
  academicDepartment?: ProfileReference | string;
  academicInstructor?: ProfileReference | string;
  user?: CurrentUserAccount;
  createdAt?: string;
  updatedAt?: string;
};

export type CurrentUserProfileResponse = {
  success?: boolean;
  message?: string;
  data?: CurrentUserProfile | null;
};

export type CurrentUserProfileUpdate = {
  name?: ProfileName;
  designation?: string;
  gender?: string;
  dateOfBirth?: string;
  contactNo?: string;
  emergencyContactNo?: string;
  bloodGroup?: string;
  bloogGroup?: string;
  presentAddress?: string;
  permanentAddress?: string;
  profileImg?: string;
  guardian?: ProfileGuardian;
  localGuardian?: ProfileLocalGuardian;
};

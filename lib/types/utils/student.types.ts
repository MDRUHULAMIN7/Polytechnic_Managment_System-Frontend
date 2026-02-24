import type { StudentProfile } from "@/lib/types/api";

export type StudentSort = "name" | "-name";

export type StudentTableRow = Pick<
  StudentProfile,
  | "_id"
  | "id"
  | "name"
  | "email"
  | "user"
  | "admissionSemester"
  | "academicDepartment"
  | "profileImg"
>;

export type CreateStudentFormValues = {
  password: string;
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  email: string;
  contactNo: string;
  emergencyContactNo: string;
  bloodGroup: string;
  presentAddress: string;
  permanentAddress: string;
  academicDepartment: string;
  admissionSemester: string;
  fatherName: string;
  fatherOccupation: string;
  fatherContactNo: string;
  motherName: string;
  motherOccupation: string;
  motherContactNo: string;
  localGuardianName: string;
  localGuardianOccupation: string;
  localGuardianContactNo: string;
  localGuardianAddress: string;
  profileFile: FileList | null;
};

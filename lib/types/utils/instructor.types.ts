import type { InstructorProfile } from "@/lib/types/api";

export type InstructorSort = "name" | "-name";

export type InstructorTableRow = Pick<
  InstructorProfile,
  | "_id"
  | "id"
  | "name"
  | "designation"
  | "email"
  | "user"
  | "academicDepartment"
  | "profileImg"
>;

export type CreateInstructorFormValues = {
  password: string;
  designation: string;
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  email: string;
  contactNo: string;
  emergencyContactNo: string;
  bloogGroup: string;
  presentAddress: string;
  permanentAddress: string;
  academicDepartment: string;
  profileFile: FileList | null;
};

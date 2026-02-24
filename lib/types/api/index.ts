export type ApiMeta = {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  meta?: ApiMeta;
};

export type ApiListData<T> = {
  meta: ApiMeta;
  result: T[];
};

export type LoginPayload = {
  id: string;
  password: string;
};

export type AcademicInstructor = {
  _id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AcademicDepartment = {
  _id: string;
  name: string;
  academicInstructor: string | AcademicInstructor | null;
  createdAt?: string;
  updatedAt?: string;
};

export type AcademicSemesterName =
  | "First"
  | "Second"
  | "Third"
  | "Fourth"
  | "Fifth"
  | "Sixth"
  | "Seventh"
  | "Eighth";

export type AcademicSemesterCode = "01" | "02" | "03" | "04" | "05" | "06" | "07" | "08";

export type AcademicSemesterMonth =
  | "January"
  | "February"
  | "March"
  | "April"
  | "May"
  | "June"
  | "July"
  | "August"
  | "September"
  | "October"
  | "November"
  | "December";

export type AcademicSemester = {
  _id: string;
  name: AcademicSemesterName;
  code: AcademicSemesterCode;
  year: string;
  startMonth: AcademicSemesterMonth;
  endMonth: AcademicSemesterMonth;
  createdAt?: string;
  updatedAt?: string;
};

export type SemesterRegistrationStatus = "UPCOMING" | "ONGOING" | "ENDED";
export type SemesterRegistrationShift = "MORNING" | "DAY";
export type SemesterEnrollmentStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "COMPLETED";

export type SemesterRegistration = {
  _id: string;
  academicSemester: string | AcademicSemester;
  status: SemesterRegistrationStatus;
  shift: SemesterRegistrationShift;
  startDate: string;
  endDate: string;
  totalCredit: number;
  createdAt?: string;
  updatedAt?: string;
};

export type SemesterEnrollment = {
  _id: string;
  student:
    | string
    | {
        _id: string;
        id?: string;
        name?: {
          firstName?: string;
          middleName?: string;
          lastName?: string;
        };
      };
  curriculum:
    | string
    | {
        _id: string;
        session?: string;
        regulation?: number;
        totalCredit?: number;
      };
  semesterRegistration:
    | string
    | {
        _id: string;
        status?: SemesterRegistrationStatus;
        shift?: SemesterRegistrationShift;
        startDate?: string;
        endDate?: string;
      };
  academicSemester:
    | string
    | {
        _id: string;
        name?: string;
        year?: string;
        startMonth?: string;
      };
  academicDepartment:
    | string
    | {
        _id: string;
        name?: string;
      };
  status: SemesterEnrollmentStatus;
  fees: number;
  isPaid: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type UserStatus = "active" | "blocked";

export type AdminUserRef = {
  _id: string;
  id?: string;
  role?: string;
  email?: string;
  status?: UserStatus;
};

export type AdminName = {
  firstName: string;
  middleName?: string;
  lastName: string;
};

export type AdminProfile = {
  _id: string;
  id: string;
  user: string | AdminUserRef;
  designation: string;
  name: AdminName;
  gender: "male" | "female" | "other";
  dateOfBirth?: string;
  email: string;
  contactNo: string;
  emergencyContactNo: string;
  bloogGroup?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  presentAddress: string;
  permanentAddress: string;
  profileImg?: string;
  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type InstructorProfile = {
  _id: string;
  id: string;
  user: string | AdminUserRef;
  designation: string;
  name: AdminName;
  gender: "male" | "female" | "other";
  dateOfBirth?: string;
  email: string;
  contactNo: string;
  emergencyContactNo: string;
  bloogGroup?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  presentAddress: string;
  permanentAddress: string;
  profileImg?: string;
  academicDepartment: string | AcademicDepartment | null;
  academicInstructor?: string | AcademicInstructor | null;
  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string;
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

export type StudentProfile = {
  _id: string;
  id: string;
  user: string | AdminUserRef;
  name: AdminName;
  gender: "male" | "female" | "others";
  dateOfBirth?: string;
  email: string;
  contactNo: string;
  emergencyContactNo: string;
  bloodGroup?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  presentAddress: string;
  permanentAddress: string;
  guardian: StudentGuardian;
  localGuardian: StudentLocalGuardian;
  profileImg?: string;
  admissionSemester: string | AcademicSemester | null;
  academicDepartment: string | AcademicDepartment | null;
  academicInstructor?: string | AcademicInstructor | null;
  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type SubjectPreRequisite = {
  subject:
    | string
    | {
        _id: string;
        title?: string;
        prefix?: string;
        code?: number;
      };
  isDeleted?: boolean;
};

export type SubjectProfile = {
  _id: string;
  title: string;
  prefix: string;
  code: number;
  credits: number;
  regulation: number;
  preRequisiteSubjects?: SubjectPreRequisite[];
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type SubjectInstructorAssignment = {
  _id: string;
  subject: string | SubjectProfile;
  instructors: Array<string | InstructorProfile>;
};

export type OfferedSubjectDay =
  | "Sat"
  | "Sun"
  | "Mon"
  | "Tue"
  | "Wed"
  | "Thu"
  | "Fri";

export type OfferedSubject = {
  _id: string;
  semesterRegistration: string | SemesterRegistration;
  academicSemester: string | AcademicSemester;
  academicInstructor: string | AcademicInstructor;
  academicDepartment: string | AcademicDepartment;
  subject: string | SubjectProfile;
  instructor: string | InstructorProfile;
  maxCapacity: number;
  section: number;
  days: OfferedSubjectDay[];
  startTime: string;
  endTime: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Curriculum = {
  _id: string;
  academicDepartment: string | AcademicDepartment;
  academicSemester: string | AcademicSemester;
  semisterRegistration: string | SemesterRegistration;
  regulation: number;
  session: string;
  subjects: Array<string | SubjectProfile>;
  totalCredit: number;
  createdAt?: string;
  updatedAt?: string;
};

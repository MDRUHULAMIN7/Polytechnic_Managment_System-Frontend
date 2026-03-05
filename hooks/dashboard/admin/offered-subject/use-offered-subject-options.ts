"use client";

import { useEffect, useState } from "react";
import type { AcademicDepartment } from "@/lib/type/dashboard/admin/academic-department";
import type { AcademicInstructor } from "@/lib/type/dashboard/admin/academic-instructor";
import type { Instructor, InstructorListParams } from "@/lib/type/dashboard/admin/instructor";
import type { Subject } from "@/lib/type/dashboard/admin/subject";
import {
  getAcademicDepartment,
  getAcademicDepartments,
} from "@/lib/api/dashboard/admin/academic-department";
import {
  getAcademicInstructor,
  getAcademicInstructors,
} from "@/lib/api/dashboard/admin/academic-instructor";
import { getInstructor, getInstructors } from "@/lib/api/dashboard/admin/instructor";
import { getSubject, getSubjects } from "@/lib/api/dashboard/admin/subject";
import { getOfferedSubjects } from "@/lib/api/dashboard/admin/offered-subject";
import { useDebouncedValue } from "@/utils/common/use-debounced-value";
import { resolveId } from "@/utils/dashboard/admin/utils";

type UseOfferedSubjectOptionsArgs = {
  open: boolean;
  subjects: Subject[];
  instructors: Instructor[];
  academicDepartments: AcademicDepartment[];
  academicInstructors: AcademicInstructor[];
  semesterRegistrationId: string;
  academicInstructorId: string;
  academicDepartmentId: string;
  subjectId: string;
  instructorId: string;
};

export function useOfferedSubjectOptions({
  open,
  subjects,
  instructors,
  academicDepartments,
  academicInstructors,
  semesterRegistrationId,
  academicInstructorId,
  academicDepartmentId,
  subjectId,
  instructorId,
}: UseOfferedSubjectOptionsArgs) {
  const [subjectQuery, setSubjectQuery] = useState("");
  const [subjectOptions, setSubjectOptions] = useState<Subject[]>(subjects);
  const [subjectLoading, setSubjectLoading] = useState(false);
  const [subjectError, setSubjectError] = useState<string | null>(null);

  const [academicInstructorQuery, setAcademicInstructorQuery] = useState("");
  const [academicInstructorOptions, setAcademicInstructorOptions] = useState<
    AcademicInstructor[]
  >(academicInstructors);
  const [academicInstructorLoading, setAcademicInstructorLoading] = useState(false);
  const [academicInstructorError, setAcademicInstructorError] = useState<
    string | null
  >(null);

  const [departmentQuery, setDepartmentQuery] = useState("");
  const [departmentOptions, setDepartmentOptions] =
    useState<AcademicDepartment[]>(academicDepartments);
  const [departmentLoading, setDepartmentLoading] = useState(false);
  const [departmentError, setDepartmentError] = useState<string | null>(null);

  const [instructorQuery, setInstructorQuery] = useState("");
  const [instructorOptions, setInstructorOptions] =
    useState<Instructor[]>(instructors);
  const [instructorLoading, setInstructorLoading] = useState(false);
  const [instructorError, setInstructorError] = useState<string | null>(null);

  const debouncedSubjectQuery = useDebouncedValue(subjectQuery, 400);
  const debouncedAcademicInstructorQuery = useDebouncedValue(academicInstructorQuery, 400);
  const debouncedDepartmentQuery = useDebouncedValue(departmentQuery, 400);
  const debouncedInstructorQuery = useDebouncedValue(instructorQuery, 400);

  useEffect(() => {
    if (!open) {
      return;
    }

    setSubjectQuery("");
    setAcademicInstructorQuery("");
    setDepartmentQuery("");
    setInstructorQuery("");
    setSubjectOptions(subjects);
    setAcademicInstructorOptions(academicInstructors);
    setDepartmentOptions(academicDepartments);
    setInstructorOptions(instructors);
    setSubjectError(null);
    setAcademicInstructorError(null);
    setDepartmentError(null);
    setInstructorError(null);
  }, [open, subjects, academicInstructors, academicDepartments, instructors]);

  useEffect(() => {
    if (!open) {
      return;
    }

    let active = true;
    setSubjectLoading(true);
    setSubjectError(null);

    getSubjects({
      page: 1,
      limit: 50,
      sort: "title",
      searchTerm: debouncedSubjectQuery.trim() || undefined,
      fields: "title",
    })
      .then((payload) => {
        if (!active) return;
        setSubjectOptions(payload.result ?? []);
      })
      .catch((fetchError) => {
        if (!active) return;
        setSubjectError(
          fetchError instanceof Error ? fetchError.message : "Unable to load subjects."
        );
      })
      .finally(() => {
        if (!active) return;
        setSubjectLoading(false);
      });

    return () => {
      active = false;
    };
  }, [open, debouncedSubjectQuery]);

  useEffect(() => {
    if (!open) {
      return;
    }

    let active = true;
    setAcademicInstructorLoading(true);
    setAcademicInstructorError(null);

    getAcademicInstructors({
      page: 1,
      limit: 50,
      sort: "name",
      searchTerm: debouncedAcademicInstructorQuery.trim() || undefined,
    })
      .then((payload) => {
        if (!active) return;
        setAcademicInstructorOptions(payload.result ?? []);
      })
      .catch((fetchError) => {
        if (!active) return;
        setAcademicInstructorError(
          fetchError instanceof Error
            ? fetchError.message
            : "Unable to load academic instructors."
        );
      })
      .finally(() => {
        if (!active) return;
        setAcademicInstructorLoading(false);
      });

    return () => {
      active = false;
    };
  }, [open, debouncedAcademicInstructorQuery]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!academicInstructorId) {
      setDepartmentOptions([]);
      setDepartmentError(null);
      setDepartmentLoading(false);
      return;
    }

    let active = true;
    setDepartmentLoading(true);
    setDepartmentError(null);

    getAcademicDepartments({
      page: 1,
      limit: 50,
      sort: "name",
      academicInstructor: academicInstructorId,
      searchTerm: debouncedDepartmentQuery.trim() || undefined,
    })
      .then((payload) => {
        if (!active) return;
        setDepartmentOptions(payload.result ?? []);
      })
      .catch((fetchError) => {
        if (!active) return;
        setDepartmentError(
          fetchError instanceof Error
            ? fetchError.message
            : "Unable to load departments."
        );
      })
      .finally(() => {
        if (!active) return;
        setDepartmentLoading(false);
      });

    return () => {
      active = false;
    };
  }, [open, academicInstructorId, debouncedDepartmentQuery]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!academicInstructorId) {
      setInstructorOptions([]);
      setInstructorError(null);
      setInstructorLoading(false);
      return;
    }

    let active = true;
    setInstructorLoading(true);
    setInstructorError(null);

    const params: InstructorListParams = {
      page: 1,
      limit: 50,
      sort: "-createdAt",
      searchTerm: debouncedInstructorQuery.trim() || undefined,
      fields: "name,designation,academicInstructor,academicDepartment",
      academicDepartment: academicDepartmentId || undefined,
    };

    getInstructors(params)
      .then((payload) => {
        if (!active) return;
        let list = payload.result ?? [];
        if (!academicDepartmentId) {
          list = list.filter(
            (item) => resolveId(item.academicInstructor) === academicInstructorId
          );
        }
        setInstructorOptions(list);
      })
      .catch((fetchError) => {
        if (!active) return;
        setInstructorError(
          fetchError instanceof Error
            ? fetchError.message
            : "Unable to load instructors."
        );
      })
      .finally(() => {
        if (!active) return;
        setInstructorLoading(false);
      });

    return () => {
      active = false;
    };
  }, [
    open,
    academicInstructorId,
    academicDepartmentId,
    debouncedInstructorQuery,
  ]);

  // Exclude already offered subjects in selected semester registration
  useEffect(() => {
    if (!open) {
      return;
    }
    if (!semesterRegistrationId) {
      return;
    }
    let active = true;
    getOfferedSubjects({
      page: 1,
      limit: 1000,
      semesterRegistration: semesterRegistrationId,
      academicInstructor: academicInstructorId || undefined,
      academicDepartment: academicDepartmentId || undefined,
      fields: "subject",
    })
      .then((payload) => {
        if (!active) return;
        const offeredIds = new Set<string>();
        for (const item of payload.result ?? []) {
          const subj: any = (item as any).subject;
          if (typeof subj === "string") {
            offeredIds.add(subj);
          } else if (subj && typeof subj._id === "string") {
            offeredIds.add(subj._id);
          }
        }
        setSubjectOptions((prev) => prev.filter((s) => !offeredIds.has(s._id)));
      })
      .catch(() => {
        // ignore fetch error; keep full subject list
      });
    return () => {
      active = false;
    };
  }, [open, semesterRegistrationId, academicInstructorId, academicDepartmentId]);

  useEffect(() => {
    if (!open || !subjectId) {
      return;
    }

    if (subjectOptions.some((item) => item._id === subjectId)) {
      return;
    }

    let active = true;
    getSubject(subjectId)
      .then((item) => {
        if (!active) return;
        if (item && !subjectOptions.some((entry) => entry._id === item._id)) {
          setSubjectOptions((prev) => [item, ...prev]);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [open, subjectId, subjectOptions]);

  useEffect(() => {
    if (!open || !academicInstructorId) {
      return;
    }

    if (academicInstructorOptions.some((item) => item._id === academicInstructorId)) {
      return;
    }

    let active = true;
    getAcademicInstructor(academicInstructorId)
      .then((item) => {
        if (!active) return;
        if (
          item &&
          !academicInstructorOptions.some((entry) => entry._id === item._id)
        ) {
          setAcademicInstructorOptions((prev) => [item, ...prev]);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [open, academicInstructorId, academicInstructorOptions]);

  useEffect(() => {
    if (!open || !academicDepartmentId) {
      return;
    }

    if (departmentOptions.some((item) => item._id === academicDepartmentId)) {
      return;
    }

    let active = true;
    getAcademicDepartment(academicDepartmentId)
      .then((item) => {
        if (!active) return;
        if (item && !departmentOptions.some((entry) => entry._id === item._id)) {
          setDepartmentOptions((prev) => [item, ...prev]);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [open, academicDepartmentId, departmentOptions]);

  useEffect(() => {
    if (!open || !instructorId) {
      return;
    }

    if (instructorOptions.some((item) => item._id === instructorId)) {
      return;
    }

    let active = true;
    getInstructor(instructorId)
      .then((item) => {
        if (!active) return;
        if (item && !instructorOptions.some((entry) => entry._id === item._id)) {
          setInstructorOptions((prev) => [item, ...prev]);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [open, instructorId, instructorOptions]);

  return {
    subjectQuery,
    setSubjectQuery,
    subjectOptions,
    subjectLoading,
    subjectError,
    academicInstructorQuery,
    setAcademicInstructorQuery,
    academicInstructorOptions,
    academicInstructorLoading,
    academicInstructorError,
    departmentQuery,
    setDepartmentQuery,
    departmentOptions,
    departmentLoading,
    departmentError,
    instructorQuery,
    setInstructorQuery,
    instructorOptions,
    instructorLoading,
    instructorError,
  };
}

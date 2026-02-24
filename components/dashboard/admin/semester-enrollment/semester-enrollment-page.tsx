"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { CirclePlus } from "lucide-react";
import { getCurriculums } from "@/lib/api/curriculum";
import {
  getSemesterRegistrationById,
  getSemesterRegistrations,
} from "@/lib/api/semester-registration";
import {
  createSemesterEnrollment,
  getMySemesterEnrollments,
  getSemesterEnrollments,
} from "@/lib/api/semester-enrollment";
import { getInstructorsWithSubject, getSubjects } from "@/lib/api/subject";
import type {
  Curriculum,
  SemesterEnrollment,
  SemesterRegistration,
} from "@/lib/api/types";
import {
  isSameServerListState,
  parseServerListState,
  toApiQuery,
  toRouteQuery,
  type ServerListState,
} from "@/lib/list-query";
import { readSessionRole } from "@/lib/session";
import type {
  SemesterEnrollmentDialogMode,
  SemesterEnrollmentSort,
} from "@/lib/types/pages/semester-enrollment/semester-enrollment.types";
import { useToastManager } from "@/lib/use-toast-manager";
import { SemesterEnrollmentDetailsContent } from "@/components/dashboard/admin/semester-enrollment/semester-enrollment-details-content";
import { SemesterEnrollmentFilters } from "@/components/dashboard/admin/semester-enrollment/semester-enrollment-filters";
import { SemesterEnrollmentTable } from "@/components/dashboard/admin/semester-enrollment/semester-enrollment-table";
import { ModalFrame } from "@/components/ui/modal-frame";
import { PageHeader } from "@/components/ui/page-header";
import { ToastRegion } from "@/components/ui/toast-region";
import {
  resolveAcademicDepartmentLabel,
  resolveAcademicSemesterLabel,
  resolveSemesterRegistrationLabel,
} from "@/lib/utils/curriculum/curriculum-utils";
import { resolveInstructorFullName, resolveSubjectCode, type SubjectOption } from "@/lib/utils/subject/subject-utils";
import { formatDate } from "@/lib/utils/utils";
import {
  SEMESTER_ENROLLMENT_DEFAULT_META,
  SEMESTER_ENROLLMENT_DEFAULT_TABLE_STATE,
  SEMESTER_ENROLLMENT_ROWS_PER_PAGE,
  SEMESTER_ENROLLMENT_SORT_OPTIONS,
  SEMESTER_ENROLLMENT_TABLE_FIELDS,
} from "@/lib/utils/semester-enrollment/semester-enrollment-utils";

type SemesterEnrollmentPageProps = {
  viewerRole?: "instructor" | "student";
};

type SemesterEnrollmentCreateFormValues = {
  curriculum: string;
};

function sortRows(rows: SemesterEnrollment[], sort: SemesterEnrollmentSort) {
  const nextRows = [...rows];

  nextRows.sort((a, b) => {
    if (sort === "fees") {
      return (a.fees ?? 0) - (b.fees ?? 0);
    }
    if (sort === "-fees") {
      return (b.fees ?? 0) - (a.fees ?? 0);
    }

    const aTime = new Date(a.createdAt ?? 0).getTime();
    const bTime = new Date(b.createdAt ?? 0).getTime();

    if (sort === "createdAt") {
      return aTime - bTime;
    }

    return bTime - aTime;
  });

  return nextRows;
}

function resolveCurriculumLabel(curriculum: Curriculum) {
  const semester =
    typeof curriculum.academicSemester === "string"
      ? "-"
      : resolveAcademicSemesterLabel(curriculum.academicSemester);
  const session = curriculum.session ? `Session ${curriculum.session}` : "Session -";
  const regulation =
    typeof curriculum.regulation === "number"
      ? `Reg ${curriculum.regulation}`
      : "Reg -";
  const totalCredit =
    typeof curriculum.totalCredit === "number"
      ? `Credit ${curriculum.totalCredit}`
      : "Credit -";

  return `${semester} | ${session} | ${regulation} | ${totalCredit}`;
}

function resolveCurriculumSemesterRegistrationRef(curriculum: Curriculum | null) {
  if (!curriculum) return null;

  const source = curriculum as Curriculum & {
    semesterRegistration?: string | SemesterRegistration;
  };

  const value = source.semisterRegistration ?? source.semesterRegistration ?? null;
  if (!value) return null;
  if (typeof value === "string") return value;
  return value;
}

export function SemesterEnrollmentPage({
  viewerRole,
}: SemesterEnrollmentPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<SemesterEnrollment[]>([]);
  const [meta, setMeta] = useState(SEMESTER_ENROLLMENT_DEFAULT_META);
  const [tableState, setTableState] = useState<ServerListState>(() =>
    parseServerListState(
      searchParams,
      SEMESTER_ENROLLMENT_DEFAULT_TABLE_STATE,
      SEMESTER_ENROLLMENT_SORT_OPTIONS,
    ),
  );
  const [dialogMode, setDialogMode] =
    useState<SemesterEnrollmentDialogMode>(null);
  const [detailRow, setDetailRow] = useState<SemesterEnrollment | null>(null);
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [curriculumsLoading, setCurriculumsLoading] = useState(false);
  const [subjectOptions, setSubjectOptions] = useState<SubjectOption[]>([]);
  const [semesterRegistrations, setSemesterRegistrations] = useState<
    SemesterRegistration[]
  >([]);
  const [subjectAssignmentLoading, setSubjectAssignmentLoading] = useState(false);
  const [subjectAssignmentBySubjectId, setSubjectAssignmentBySubjectId] =
    useState<Record<string, string[]>>({});
  const [selectedSemesterRegistration, setSelectedSemesterRegistration] =
    useState<SemesterRegistration | null>(null);

  const { toasts, toast, dismissToast } = useToastManager();

  const createForm = useForm<SemesterEnrollmentCreateFormValues>({
    defaultValues: { curriculum: "" },
  });
  const selectedCurriculumId = createForm.watch("curriculum");

  const fetchRows = useCallback(
    async (requestState: ServerListState) => {
      setLoading(true);
      try {
        if (viewerRole === "student") {
          const response = await getMySemesterEnrollments();
          const allRows = (response.data ?? []).map((row) => ({
            ...row,
            student:
              typeof row.student === "string"
                ? { _id: row.student, id: "Me" }
                : { ...row.student, id: row.student.id ?? "Me" },
          }));
          const sortedRows = sortRows(
            allRows,
            requestState.sort as SemesterEnrollmentSort,
          );
          const total = sortedRows.length;
          const totalPage = Math.max(1, Math.ceil(total / requestState.limit));
          const safePage = Math.min(Math.max(requestState.page, 1), totalPage);
          const start = (safePage - 1) * requestState.limit;
          const pagedRows = sortedRows.slice(start, start + requestState.limit);

          setRows(pagedRows);
          setMeta({
            page: safePage,
            limit: requestState.limit,
            total,
            totalPage,
          });
          return;
        }

        const query = toApiQuery(
          requestState,
          SEMESTER_ENROLLMENT_DEFAULT_TABLE_STATE,
          SEMESTER_ENROLLMENT_TABLE_FIELDS,
        );
        const response = await getSemesterEnrollments(query);
        const nextRows = response.data?.result ?? [];
        const nextMeta = response.data?.meta ?? {
          page: requestState.page,
          limit: requestState.limit,
          total: nextRows.length,
          totalPage: 1,
        };

        setRows(nextRows);
        setMeta(nextMeta);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load semester enrollments.";
        setRows([]);
        setMeta((prev) => ({
          ...prev,
          total: 0,
          totalPage: 1,
          page: requestState.page,
          limit: requestState.limit,
        }));
        toast.error("Load Failed", message);
      } finally {
        setLoading(false);
      }
    },
    [toast, viewerRole],
  );

  const fetchCurriculums = useCallback(async () => {
    if (viewerRole !== "student") return;

    setCurriculumsLoading(true);
    try {
      const curriculumQuery = new URLSearchParams({
        page: "1",
        limit: "1000",
        sort: "-createdAt",
        fields:
          "_id,session,regulation,totalCredit,academicDepartment,academicSemester,semisterRegistration,subjects",
      });
      const semesterRegistrationQuery = new URLSearchParams({
        page: "1",
        limit: "1000",
        sort: "-createdAt",
        fields: "_id,academicSemester,shift,status,startDate,endDate",
      });
      const subjectQuery = new URLSearchParams({
        page: "1",
        limit: "1000",
        sort: "title",
        fields: "_id,title,prefix,code",
      });

      const [curriculumResponse, semesterRegistrationResponse, subjectResponse] =
        await Promise.all([
          getCurriculums(curriculumQuery),
          getSemesterRegistrations(semesterRegistrationQuery),
          getSubjects<SubjectOption>(subjectQuery),
        ]);

      setCurriculums(curriculumResponse.data?.result ?? []);
      setSemesterRegistrations(semesterRegistrationResponse.data?.result ?? []);
      setSubjectOptions(subjectResponse.data?.result ?? []);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load curriculum preview data.";
      setCurriculums([]);
      setSemesterRegistrations([]);
      setSubjectOptions([]);
      toast.error("Curriculum Load Failed", message);
    } finally {
      setCurriculumsLoading(false);
    }
  }, [toast, viewerRole]);

  useEffect(() => {
    const nextState = parseServerListState(
      searchParams,
      SEMESTER_ENROLLMENT_DEFAULT_TABLE_STATE,
      SEMESTER_ENROLLMENT_SORT_OPTIONS,
    );
    setTableState((prev) =>
      isSameServerListState(prev, nextState) ? prev : nextState,
    );
  }, [searchParams]);

  useEffect(() => {
    const nextQuery = toRouteQuery(
      tableState,
      SEMESTER_ENROLLMENT_DEFAULT_TABLE_STATE,
    ).toString();
    const currentQuery = searchParams.toString();
    if (nextQuery === currentQuery) return;

    const target = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    router.replace(target, { scroll: false });
  }, [pathname, router, searchParams, tableState]);

  useEffect(() => {
    const role = readSessionRole();
    if (viewerRole) {
      if (role !== viewerRole) {
        router.replace("/dashboard/forbidden");
      }
      return;
    }

    if (role !== "admin" && role !== "superAdmin") {
      router.replace("/dashboard/forbidden");
    }
  }, [viewerRole, router]);

  useEffect(() => {
    void fetchRows(tableState);
  }, [fetchRows, tableState]);

  useEffect(() => {
    void fetchCurriculums();
  }, [fetchCurriculums]);

  const openDetails = (row: SemesterEnrollment) => {
    setDetailRow(row);
    setDialogMode("details");
  };

  const selectedCurriculum = useMemo(
    () => curriculums.find((item) => item._id === selectedCurriculumId) ?? null,
    [curriculums, selectedCurriculumId],
  );

  const selectedCurriculumSubjects = useMemo(
    () => selectedCurriculum?.subjects ?? [],
    [selectedCurriculum],
  );

  useEffect(() => {
    if (viewerRole !== "student") return;

    const semesterRegistrationRef =
      resolveCurriculumSemesterRegistrationRef(selectedCurriculum);

    if (!semesterRegistrationRef) {
      setSelectedSemesterRegistration(null);
      return;
    }

    if (typeof semesterRegistrationRef !== "string") {
      setSelectedSemesterRegistration(semesterRegistrationRef);
      return;
    }

    const fromList =
      semesterRegistrations.find((item) => item._id === semesterRegistrationRef) ??
      null;
    if (fromList) {
      setSelectedSemesterRegistration(fromList);
      return;
    }

    let active = true;
    void getSemesterRegistrationById(semesterRegistrationRef)
      .then((response) => {
        if (!active) return;
        setSelectedSemesterRegistration(response.data ?? null);
      })
      .catch(() => {
        if (!active) return;
        setSelectedSemesterRegistration(null);
      });

    return () => {
      active = false;
    };
  }, [selectedCurriculum, semesterRegistrations, viewerRole]);

  useEffect(() => {
    if (viewerRole !== "student") return;
    if (!selectedCurriculum || selectedCurriculumSubjects.length === 0) {
      setSubjectAssignmentBySubjectId({});
      setSubjectAssignmentLoading(false);
      return;
    }

    const subjectIds = selectedCurriculumSubjects.map((item) =>
      typeof item === "string" ? item : item._id,
    );

    let active = true;
    setSubjectAssignmentLoading(true);

    void Promise.allSettled(
      subjectIds.map(async (subjectId) => {
        const response = await getInstructorsWithSubject(subjectId);
        const instructors = response.data?.instructors ?? [];
        const instructorLabels = instructors
          .map((item) =>
            typeof item === "string" ? item : resolveInstructorFullName(item),
          )
          .filter(Boolean);
        return { subjectId, instructorLabels };
      }),
    )
      .then((results) => {
        if (!active) return;

        const nextAssignments: Record<string, string[]> = {};
        let hasFailure = false;

        results.forEach((result) => {
          if (result.status === "fulfilled") {
            nextAssignments[result.value.subjectId] = result.value.instructorLabels;
            return;
          }

          hasFailure = true;
        });

        setSubjectAssignmentBySubjectId(nextAssignments);

        if (hasFailure) {
          toast.error(
            "Subject Preview Partial",
            "Some subject-instructor assignment data could not be loaded.",
          );
        }
      })
      .finally(() => {
        if (!active) return;
        setSubjectAssignmentLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedCurriculum, selectedCurriculumSubjects, toast, viewerRole]);

  const subjectOptionById = useMemo(
    () => new Map(subjectOptions.map((item) => [item._id, item])),
    [subjectOptions],
  );

  const handleCreate = createForm.handleSubmit(async (values) => {
    if (!values.curriculum) {
      createForm.setError("curriculum", {
        type: "manual",
        message: "Please select a curriculum.",
      });
      return;
    }

    try {
      const response = await createSemesterEnrollment({
        curriculum: values.curriculum,
      });
      toast.success("Enrollment Created", response.message);
      setDialogMode(null);
      createForm.reset({ curriculum: "" });
      await fetchRows(tableState);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create enrollment.";
      toast.error("Create Failed", message);
    }
  });

  const totalPages = Math.max(1, meta.totalPage || 1);
  const currentPage = Math.max(1, Math.min(tableState.page, totalPages));

  useEffect(() => {
    if (currentPage === tableState.page) return;
    setTableState((prev) => ({ ...prev, page: currentPage }));
  }, [currentPage, tableState.page]);

  return (
    <section className="space-y-5">
      <ToastRegion toasts={toasts} onDismiss={dismissToast} />

      <PageHeader
        title="Semester Enrollment"
        subtitle={
          viewerRole === "student"
            ? "See your semester enrollments in a responsive table, open details, and create semester enrollment."
            : "See all semester enrollments in a responsive table."
        }
        action={
          viewerRole === "student" ? (
            <button
              type="button"
              onClick={() => setDialogMode("create")}
              className="focus-ring inline-flex items-center gap-2 rounded-xl bg-(--primary) px-3.5 py-2 text-sm font-semibold text-(--primary-ink)"
            >
              <CirclePlus className="h-4 w-4" aria-hidden />
              Enrollment into Curriculum
            </button>
          ) : undefined
        }
      />

      <section className="rounded-2xl border border-(--line) bg-(--surface) p-4 lg:p-5">
        <SemesterEnrollmentFilters
          sort={tableState.sort as SemesterEnrollmentSort}
          limit={tableState.limit}
          rowsPerPage={SEMESTER_ENROLLMENT_ROWS_PER_PAGE}
          onSortChange={(value) =>
            setTableState((prev) => ({ ...prev, sort: value, page: 1 }))
          }
          onLimitChange={(value) =>
            setTableState((prev) => ({ ...prev, limit: value, page: 1 }))
          }
        />

        <SemesterEnrollmentTable
          loading={loading}
          rows={rows}
          total={meta.total}
          currentPage={currentPage}
          totalPages={totalPages}
          onDetails={openDetails}
          onPrevPage={() =>
            setTableState((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))
          }
          onNextPage={() =>
            setTableState((prev) => ({
              ...prev,
              page: Math.min(totalPages, prev.page + 1),
            }))
          }
        />
      </section>

      {viewerRole === "student" ? (
        <ModalFrame
          open={dialogMode === "create"}
          title="Enrollment into Curriculum"
          description="Select a curriculum and review details before confirming semester enrollment."
          onClose={() => setDialogMode(null)}
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="curriculum">
                Curriculum
              </label>
              <select
                id="curriculum"
                className="focus-ring w-full rounded-xl border border-(--line) bg-(--surface) px-3 py-2 text-sm"
                {...createForm.register("curriculum", {
                  required: "Curriculum is required.",
                })}
              >
                <option value="">
                  {curriculumsLoading
                    ? "Loading curriculums..."
                    : "Select curriculum"}
                </option>
                {curriculums.map((curriculum) => (
                  <option key={curriculum._id} value={curriculum._id}>
                    {resolveCurriculumLabel(curriculum)}
                  </option>
                ))}
              </select>
              {createForm.formState.errors.curriculum ? (
                <p className="mt-1 text-xs text-(--danger)">
                  {createForm.formState.errors.curriculum.message}
                </p>
              ) : null}
            </div>

            <section className="rounded-xl border border-(--line) bg-(--surface-2) p-3 text-sm">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-(--text-dim)">
                Curriculum Preview
              </p>
              {selectedCurriculum ? (
                <div className="space-y-1.5 text-(--text-dim)">
                  <p>
                    <span className="font-semibold text-(--text)">Academic Department:</span>{" "}
                    {resolveAcademicDepartmentLabel(
                      selectedCurriculum.academicDepartment,
                    )}
                  </p>
                  <p>
                    <span className="font-semibold text-(--text)">Academic Semester:</span>{" "}
                    {resolveAcademicSemesterLabel(
                      selectedCurriculum.academicSemester,
                    )}
                  </p>
                  <p>
                    <span className="font-semibold text-(--text)">Semester Registration:</span>{" "}
                    {resolveSemesterRegistrationLabel(selectedSemesterRegistration)}
                  </p>
                  <p>
                    <span className="font-semibold text-(--text)">Semester Duration:</span>{" "}
                    {selectedSemesterRegistration
                      ? `${formatDate(selectedSemesterRegistration.startDate)} - ${formatDate(selectedSemesterRegistration.endDate)}`
                      : "-"}
                  </p>
                  <p>
                    <span className="font-semibold text-(--text)">Registration Shift:</span>{" "}
                    {selectedSemesterRegistration?.shift ?? "-"}
                  </p>
                  <p>
                    <span className="font-semibold text-(--text)">Registration Status:</span>{" "}
                    {selectedSemesterRegistration?.status ?? "-"}
                  </p>
                  <p>
                    <span className="font-semibold text-(--text)">Session:</span>{" "}
                    {selectedCurriculum.session || "-"}
                  </p>
                  <p>
                    <span className="font-semibold text-(--text)">Regulation:</span>{" "}
                    {selectedCurriculum.regulation ?? "-"}
                  </p>
                  <p>
                    <span className="font-semibold text-(--text)">Subjects:</span>{" "}
                    {selectedCurriculum.subjects?.length ?? 0}
                  </p>
                  <p>
                    <span className="font-semibold text-(--text)">Total Credit:</span>{" "}
                    {selectedCurriculum.totalCredit ?? "-"}
                  </p>

                  <div className="mt-3 rounded-lg border border-(--line) bg-(--surface) p-2.5">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-(--text-dim)">
                      Subjects and Instructor Assignment
                    </p>
                    {selectedCurriculumSubjects.length === 0 ? (
                      <p className="text-(--text-dim)">No subjects found in this curriculum.</p>
                    ) : subjectAssignmentLoading ? (
                      <p className="text-(--text-dim)">
                        Loading subject and instructor assignment...
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {selectedCurriculumSubjects.map((subject) => {
                          const subjectId =
                            typeof subject === "string" ? subject : subject._id;
                          const mappedSubject = subjectOptionById.get(subjectId);
                          const subjectCode =
                            typeof subject !== "string"
                              ? resolveSubjectCode(subject)
                              : mappedSubject
                                ? resolveSubjectCode(mappedSubject)
                                : "-";
                          const subjectTitle =
                            typeof subject !== "string"
                              ? subject.title
                              : mappedSubject?.title ?? subjectId;
                          const instructors =
                            subjectAssignmentBySubjectId[subjectId] ?? [];

                          return (
                            <li key={subjectId} className="rounded-md border border-(--line) p-2">
                              <p>
                                <span className="font-semibold text-(--text)">Subject:</span>{" "}
                                {subjectCode !== "-" ? `${subjectCode} - ${subjectTitle}` : subjectTitle}
                              </p>
                              <p className="text-(--text-dim)">
                                <span className="font-semibold text-(--text)">
                                  Instructor Assigned:
                                </span>{" "}
                                {instructors.length
                                  ? instructors.join(", ")
                                  : "No instructor assigned yet"}
                              </p>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-(--text-dim)">
                  Select a curriculum to see details before enrollment.
                </p>
              )}
            </section>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDialogMode(null)}
                className="focus-ring rounded-xl border border-(--line) px-3 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="focus-ring rounded-xl bg-(--primary) px-3.5 py-2 text-sm font-semibold text-(--primary-ink)"
              >
                Enrollment into Curriculum
              </button>
            </div>
          </form>
        </ModalFrame>
      ) : null}

      <ModalFrame
        open={dialogMode === "details"}
        title="Semester Enrollment Details"
        description="Single semester enrollment detail view."
        onClose={() => setDialogMode(null)}
      >
        <SemesterEnrollmentDetailsContent detailRow={detailRow} />
      </ModalFrame>
    </section>
  );
}

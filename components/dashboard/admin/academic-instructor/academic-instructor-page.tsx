"use client";

import { CirclePlus } from "lucide-react";
import { useAcademicInstructorPageController } from "@/components/dashboard/admin/academic-instructor/use-academic-instructor-page-controller";
import { AcademicInstructorDetailsContent } from "@/components/dashboard/admin/academic-instructor/academic-instructor-details-content";
import { AcademicInstructorFilters } from "@/components/dashboard/admin/academic-instructor/academic-instructor-filters";
import { AcademicInstructorForm } from "@/components/dashboard/admin/academic-instructor/academic-instructor-form";
import { AcademicInstructorTable } from "@/components/dashboard/admin/academic-instructor/academic-instructor-table";
import { ModalFrame } from "@/components/ui/modal-frame";
import { PageHeader } from "@/components/ui/page-header";
import { ToastRegion } from "@/components/ui/toast-region";

export function AcademicInstructorPage() {
  const {
    closeDialog,
    createForm,
    detailLoading,
    detailRow,
    dialogMode,
    dismissToast,
    goNextPage,
    goPrevPage,
    handleCreate,
    handleUpdate,
    loading,
    openCreate,
    openDetails,
    openUpdate,
    pagination,
    rowsPerPage,
    setLimit,
    setSearchTerm,
    setSort,
    setStartsWith,
    tableState,
    toasts,
    updateForm,
  } = useAcademicInstructorPageController();

  return (
    <section className="space-y-5">
      <ToastRegion toasts={toasts} onDismiss={dismissToast} />

      <PageHeader
        title="Academic Instructor"
        subtitle="Manage all Academic Instructors"
        action={
          <button
            type="button"
            onClick={openCreate}
            className="focus-ring inline-flex items-center gap-2 rounded-xl bg-(--primary) px-3.5 py-2 text-sm font-semibold text-(--primary-ink) transition hover:brightness-110"
          >
            <CirclePlus className="h-4 w-4" aria-hidden />
            Create
          </button>
        }
      />

      <section className="rounded-2xl border border-(--line) bg-(--surface) p-4 lg:p-5">
        <AcademicInstructorFilters
          tableState={tableState}
          rowsPerPage={rowsPerPage}
          onSearchChange={setSearchTerm}
          onStartsWithChange={setStartsWith}
          onSortChange={setSort}
          onLimitChange={setLimit}
        />

        <AcademicInstructorTable
          loading={loading}
          pagination={pagination}
          onDetails={openDetails}
          onUpdate={openUpdate}
          onPrevPage={goPrevPage}
          onNextPage={goNextPage}
        />
      </section>

      <ModalFrame
        open={dialogMode === "create"}
        title="Create Academic Instructor"
        description="Provide instructor name and submit."
        onClose={closeDialog}
      >
        <AcademicInstructorForm
          form={createForm}
          onSubmit={handleCreate}
          onCancel={closeDialog}
          idPrefix="create"
          submitLabel="Create"
          submittingLabel="Creating..."
        />
      </ModalFrame>

      <ModalFrame
        open={dialogMode === "update"}
        title="Update Academic Instructor"
        description="Edit instructor name and save changes."
        onClose={closeDialog}
      >
        <AcademicInstructorForm
          form={updateForm}
          onSubmit={handleUpdate}
          onCancel={closeDialog}
          idPrefix="update"
          submitLabel="Update"
          submittingLabel="Updating..."
        />
      </ModalFrame>

      <ModalFrame
        open={dialogMode === "details"}
        title="Academic Instructor Details"
        description="Single academic instructor detail view."
        onClose={closeDialog}
      >
        <AcademicInstructorDetailsContent
          detailLoading={detailLoading}
          detailRow={detailRow}
        />
      </ModalFrame>
    </section>
  );
}



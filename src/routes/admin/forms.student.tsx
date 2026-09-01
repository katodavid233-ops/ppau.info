import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchFormConfig } from "@/lib/admin/forms";
import { FormConfigEditor } from "@/components/admin/FormConfigEditor";
import { BookOpen } from "lucide-react";

export const Route = createFileRoute("/admin/forms/student")({
  component: EditStudentFormPage,
});

function EditStudentFormPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["form-config", "student"],
    queryFn: () => fetchFormConfig("student"),
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          Student membership form
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          All fields match the public form at{" "}
          <a href="/membership-form/student" className="text-primary underline" target="_blank" rel="noreferrer">
            /membership-form/student
          </a>
          . Save to sync labels and visibility.
        </p>
      </div>
      {isLoading && <p>Loading…</p>}
      {data && (
        <FormConfigEditor
          config={data}
          previewPath="/membership-form/student"
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ["form-config", "student"] });
            queryClient.invalidateQueries({ queryKey: ["public-form-config", "student"] });
          }}
        />
      )}
    </div>
  );
}

/** Inline error/success message shown at the top of a form. */
export function FormMessage({
  tone,
  children,
}: {
  tone: "error" | "success";
  children: React.ReactNode;
}) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-control px-3.5 py-2.5 text-sm ${
        tone === "error" ? "bg-danger-light text-danger" : "bg-primary-light text-ink"
      }`}
    >
      {children}
    </p>
  );
}

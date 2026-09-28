/**
 * Standard page width + side gutters for company screens.
 * The bottom padding leaves room for the mobile tab bar.
 */
export function PageContainer({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-page px-4 pb-24 md:px-6 md:pb-16 lg:px-8">{children}</div>;
}

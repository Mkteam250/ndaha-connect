import { PageHeader } from "@/components/ui/page-header";

export default function AdminSettings() {
  return (
    <div>
      <PageHeader title="Settings" description="System preferences" />
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">Admin settings coming soon.</p>
      </div>
    </div>
  );
}

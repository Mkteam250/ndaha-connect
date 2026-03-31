import { PageHeader } from "@/components/ui/page-header";

export default function MasterSettings() {
  return (
    <div>
      <PageHeader title="Settings" description="Manage your preferences" />
      <div className="rounded-xl border border-border bg-card p-5 space-y-6">
        {[
          { label: "Email notifications", description: "Receive daily attendance summaries", defaultChecked: true },
          { label: "SMS alerts", description: "Get notified for absent students", defaultChecked: false },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked={item.defaultChecked} className="sr-only peer" />
              <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-master transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:bg-card after:rounded-full after:transition-transform peer-checked:after:translate-x-4" />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

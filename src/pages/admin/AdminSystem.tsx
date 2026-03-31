import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Server, AlertTriangle, Trash2 } from "lucide-react";
import { useState } from "react";

const systemInfo = [
  { label: "OS", value: "Ubuntu 22.04 LTS" },
  { label: "Runtime", value: "Node.js 20.11.0" },
  { label: "Database", value: "PostgreSQL 15.4" },
  { label: "Region", value: "eu-west-1 (Frankfurt)" },
];

const sampleLogs = [
  "[2026-03-31 08:15:02] INFO: Student S001 check-in recorded",
  "[2026-03-31 08:22:15] INFO: Student S002 check-in recorded",
  "[2026-03-31 08:30:44] INFO: Student S003 check-in recorded",
  "[2026-03-31 08:45:01] INFO: Student S005 check-in recorded",
  "[2026-03-31 07:00:00] INFO: Daily backup completed successfully",
  "[2026-03-31 06:00:00] INFO: SSL certificate renewed",
  "[2026-03-30 23:00:00] INFO: Database vacuum completed",
  "[2026-03-30 18:22:10] WARN: High memory usage detected (78%)",
  "[2026-03-30 12:00:00] INFO: Cache cleared automatically",
];

export default function AdminSystem() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  return (
    <div>
      <PageHeader title="System" description="Server configuration and maintenance" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {systemInfo.map((info) => (
          <motion.div key={info.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">{info.label}</p>
            <p className="text-sm font-semibold text-foreground">{info.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Maintenance</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  <span className="text-sm text-foreground">Maintenance mode</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={maintenanceMode} onChange={() => setMaintenanceMode(!maintenanceMode)} className="sr-only peer" />
                  <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-admin transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:bg-card after:rounded-full after:transition-transform peer-checked:after:translate-x-4" />
                </label>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <Trash2 className="w-4 h-4 mr-1" /> Clear Cache
              </Button>
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Server className="w-4 h-4" /> System Logs
          </h3>
          <div className="bg-muted/50 rounded-lg p-4 h-64 overflow-auto font-mono text-xs text-muted-foreground space-y-1">
            {sampleLogs.map((log, i) => (
              <div key={i} className={log.includes("WARN") ? "text-warning" : ""}>{log}</div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

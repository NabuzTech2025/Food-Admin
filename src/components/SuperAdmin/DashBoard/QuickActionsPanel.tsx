import { Store } from "lucide-react";

interface QuickActionsPanelProps {
  onManageStores: () => void;
}

function QuickActionsPanel({ onManageStores }: QuickActionsPanelProps) {
  return (
    <div className="bg-white rounded-xl border border-border shadow-sm p-5">
      <h3 className="font-semibold text-neutral-800 mb-4">Quick Actions</h3>
      <div className="space-y-3">
        <button
          onClick={onManageStores}
          className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-primary-light hover:border-primary/30 transition-colors text-sm font-medium text-neutral-700"
        >
          <div className="flex items-center gap-3">
            <Store size={18} className="text-primary" />
            Manage Stores
          </div>
        </button>
      </div>
    </div>
  );
}

export default QuickActionsPanel;

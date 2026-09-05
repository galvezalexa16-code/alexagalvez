interface TopBarProps {
  title: string;
}

export function TopBar({ title }: TopBarProps) {
  return (
    <header className="dashboard-topbar">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-6 rounded-full bg-amber-500" />
        <h1 className="text-slate-800 font-semibold text-lg">{title}</h1>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <span className="text-xs text-slate-400">
          {new Date().toLocaleDateString("en-PH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </span>
      </div>
    </header>
  );
}

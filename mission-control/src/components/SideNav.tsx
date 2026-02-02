import Link from "next/link";

const NAV_ITEMS = [
  "Tasks",
  "Content Calendar",
  "Knowledge Base",
  "Meeting Notes",
  "Approvals",
  "Support",
  "B2B",
  "Templates",
  "Reports",
];

export default function SideNav() {
  return (
    <aside className="space-y-6 sticky top-6 self-start">
      <div className="rounded-2xl border border-zinc-200 bg-white p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Navigation</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {NAV_ITEMS.map((item) => (
            <li key={item} className="rounded-lg px-3 py-2 hover:bg-zinc-100">
              {item}
            </li>
          ))}
          <li className="rounded-lg px-3 py-2 hover:bg-zinc-100">
            <Link href="/agents/new" className="text-sm">Add Agent</Link>
          </li>
          <li className="rounded-lg px-3 py-2 hover:bg-zinc-100">
            <Link href="/tasks/assign" className="text-sm">Create Task</Link>
          </li>
        </ul>
      </div>
    </aside>
  );
}

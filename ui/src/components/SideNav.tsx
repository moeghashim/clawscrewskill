import Link from "next/link";

const items = [
  { href: "/", label: "Dashboard" },
  { href: "/tasks", label: "Tasks" },
  { href: "/documents", label: "Documents" },
  { href: "/agents", label: "Agents" },
];

export default function SideNav() {
  return (
    <aside className="w-full md:w-60 border border-[var(--grid)] bg-white p-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-6 h-6 bg-[var(--forest)]"></div>
        <span className="text-xs uppercase tracking-[0.2em] mono">ClawsCrew</span>
      </div>
      <nav className="flex flex-col gap-3 text-sm">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-xs uppercase tracking-[0.2em] mono hover:text-[var(--coral)]"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <form action="/api/logout" method="post" className="mt-10">
        <button className="text-[10px] uppercase tracking-[0.2em] border border-[var(--forest)] px-4 py-2 mono">
          Logout
        </button>
      </form>
    </aside>
  );
}

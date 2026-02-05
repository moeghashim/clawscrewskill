import Link from "next/link";

const items = [
  { href: "/", label: "Dashboard" },
  { href: "/tasks", label: "Tasks" },
  { href: "/documents", label: "Documents" },
  { href: "/agents", label: "Agents" },
];

export default function SideNav() {
  return (
    <aside className="w-full md:w-60 border border-[#3A3A38]/20 bg-white p-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-6 h-6 bg-[#1A3C2B]"></div>
        <span className="text-xs uppercase tracking-[0.2em]">ClawsCrew</span>
      </div>
      <nav className="flex flex-col gap-3 text-sm">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-xs uppercase tracking-[0.2em] hover:text-[#FF8C69]"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <form action="/api/logout" method="post" className="mt-10">
        <button className="text-[10px] uppercase tracking-[0.2em] border border-[#1A3C2B] px-4 py-2">
          Logout
        </button>
      </form>
    </aside>
  );
}

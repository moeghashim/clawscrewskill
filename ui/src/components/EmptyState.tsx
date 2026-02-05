export default function EmptyState({ label }: { label: string }) {
  return (
    <div className="border border-[var(--grid)] bg-white p-6 text-sm opacity-60">
      {label}
    </div>
  );
}

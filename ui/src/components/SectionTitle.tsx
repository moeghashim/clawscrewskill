export default function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <div className="text-[10px] uppercase tracking-[0.2em] opacity-60 mono">{subtitle}</div>
      <h2 className="text-2xl uppercase tracking-tight leading-none">{title}</h2>
    </div>
  );
}

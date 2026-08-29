export default function LoadingBlock({ label = 'بنجهزلك الصفحة...' }: { label?: string }) {
  return (
    <div className="flex min-h-[320px] items-center justify-center" role="status" aria-live="polite">
      <div className="text-center">
        <div className="loading-line" aria-hidden="true"><span /></div>
        <p className="mt-4 text-sm font-semibold text-ink/55">{label}</p>
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 rounded-md bg-muted animate-pulse" />
      <div className="h-4 w-96 max-w-full rounded-md bg-muted animate-pulse" />
      <div className="h-40 rounded-2xl bg-muted/50 animate-pulse" />
    </div>
  );
}

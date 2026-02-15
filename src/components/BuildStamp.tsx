export function BuildStamp() {
  return (
    <div className="text-[10px] opacity-60">
      build: {process.env.NEXT_PUBLIC_GIT_SHA?.slice(0, 8) ?? "no-sha"}
    </div>
  );
}

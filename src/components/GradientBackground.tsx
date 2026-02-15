export default function GradientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute -left-32 -top-40 h-[36rem] w-[36rem] rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(600px at 50% 50%, #117CFF, transparent 70%)" }}
      />
      <div
        className="absolute -bottom-40 -right-32 h-[36rem] w-[36rem] rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(600px at 50% 50%, #00D1FF, transparent 70%)" }}
      />
    </div>
  );
}

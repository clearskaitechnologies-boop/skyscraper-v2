export default function MockupCard({ title, src, alt }) {
  return (
    <section style={{ maxWidth: 1200, margin: "2rem auto", padding: "0 1rem" }}>
      <h3 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.75rem" }}>{title}</h3>
      <img
        src={src}
        alt={alt ?? title}
        style={{ width: "100%", height: "auto", display: "block", borderRadius: "10px" }}
      />
    </section>
  );
}

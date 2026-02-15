import MockupCard from "./components/MockupCard.jsx";
import { MOCKUPS } from "./config/mockups.js";

export default function App() {
  return (
    <main style={{ fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
      <header style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #eee" }}>
        <h1 style={{ margin: 0, fontSize: "1.75rem" }}>SkaiScraper — Mockups</h1>
      </header>
      {MOCKUPS.map((m) => (
        <MockupCard key={m.key} title={m.title} src={m.hero} />
      ))}
      <footer style={{ padding: "2rem 1.25rem", color: "#666" }}>
        © {new Date().getFullYear()} SkaiScraper
      </footer>
    </main>
  );
}

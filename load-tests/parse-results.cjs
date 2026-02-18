const fs = require("fs");
const data = JSON.parse(fs.readFileSync("./load-tests/results/soak-60m-results.json", "utf8"));
const m = data.metrics;

console.log("=== 60-MIN SOAK — FULL SCORECARD ===\n");

console.log("HTTP Request Duration:");
console.log("  avg:", Math.round(m.http_req_duration?.values?.avg || 0), "ms");
console.log("  p95:", Math.round(m.http_req_duration?.values?.["p(95)"] || 0), "ms");
console.log("  p99:", Math.round(m.http_req_duration?.values?.["p(99)"] || 0), "ms");
console.log("  max:", Math.round(m.http_req_duration?.values?.max || 0), "ms");

console.log("\nError Metrics:");
console.log("  errors rate:", ((m.errors?.values?.rate || 0) * 100).toFixed(3) + "%");
console.log(
  "  http_req_failed rate:",
  ((m.http_req_failed?.values?.rate || 0) * 100).toFixed(3) + "%"
);
console.log("  api_errors count:", m.api_errors?.values?.count || 0);

console.log("\nServer Heap (from /health/live body):");
console.log("  avg:", Math.round(m.server_heap_used_mb?.values?.avg || 0), "MB");
console.log("  max:", Math.round(m.server_heap_used_mb?.values?.max || 0), "MB");
console.log("  min:", Math.round(m.server_heap_used_mb?.values?.min || 0), "MB");
console.log("  count:", m.server_heap_used_mb?.values?.count || 0, "samples");

console.log("\nServer DB Latency (from /health/live body):");
console.log("  avg:", Math.round(m.server_db_latency_ms?.values?.avg || 0), "ms");
console.log("  max:", Math.round(m.server_db_latency_ms?.values?.max || 0), "ms");
console.log("  count:", m.server_db_latency_ms?.values?.count || 0, "samples");

console.log("\nHealth Live Latency:");
console.log("  avg:", Math.round(m.health_live_latency?.values?.avg || 0), "ms");
console.log("  p95:", Math.round(m.health_live_latency?.values?.["p(95)"] || 0), "ms");
console.log("  max:", Math.round(m.health_live_latency?.values?.max || 0), "ms");

console.log("\nDeep Health Latency:");
console.log("  avg:", Math.round(m.deep_health_latency?.values?.avg || 0), "ms");
console.log("  p95:", Math.round(m.deep_health_latency?.values?.["p(95)"] || 0), "ms");

console.log("\nDB Dependent Latency (auth-gated routes):");
console.log("  avg:", Math.round(m.db_dependent_latency?.values?.avg || 0), "ms");
console.log("  p95:", Math.round(m.db_dependent_latency?.values?.["p(95)"] || 0), "ms");
console.log("  max:", Math.round(m.db_dependent_latency?.values?.max || 0), "ms");

console.log("\nVolume:");
console.log("  total requests:", m.http_reqs?.values?.count || 0);
console.log("  burst cycles:", m.burst_cycles?.values?.count || 0);
console.log("  iterations:", m.iterations?.values?.count || 0);

console.log("\n=== THRESHOLD PASS/FAIL ===");
Object.keys(m).forEach((k) => {
  const t = m[k].thresholds;
  if (t) {
    Object.entries(t).forEach(([rule, result]) => {
      console.log(result.ok ? "  PASS" : "  FAIL", "-", k, ":", rule);
    });
  }
});

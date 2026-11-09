// k6 load test for the busiest read endpoints (docs/testing.md section 9).
// Run it with `pnpm test:performance`, which starts the app against the local
// test database. This file runs inside k6, not Node.
import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://127.0.0.1:3100";
const HANDLE = __ENV.PERF_HANDLE || "perf.trader";
// smoke: 1 user for 15s, a quick "does it work" check.
// load (default): ramps to 10 people browsing at once for about a minute.
const PROFILE = __ENV.PERF_PROFILE || "load";

const stages =
  PROFILE === "smoke"
    ? [{ duration: "15s", target: 1 }]
    : [
        { duration: "15s", target: 10 },
        { duration: "45s", target: 10 },
        { duration: "10s", target: 0 },
      ];

export const options = {
  scenarios: { browse: { executor: "ramping-vus", startVUs: 1, stages } },
  // TRD section 16: most API calls under 300 ms at the server (Proposed).
  // Measured here from the client, so it includes the local network too.
  thresholds: {
    http_req_failed: ["rate<0.01"],
    checks: ["rate>0.99"],
    "http_req_duration{endpoint:health}": ["p(95)<300"],
    "http_req_duration{endpoint:hobbies}": ["p(95)<300"],
    "http_req_duration{endpoint:profile}": ["p(95)<300"],
  },
};

function get(path, endpoint) {
  const response = http.get(`${BASE_URL}${path}`, { tags: { endpoint } });
  check(response, { [`${endpoint} is 200`]: (r) => r.status === 200 });
  return response;
}

// What a visitor does: open onboarding or a filter (hobbies), look at a
// profile. Health is there to separate app time from database time.
export default function browse() {
  get("/api/hobbies", "hobbies");
  sleep(1);
  get(`/api/users/${HANDLE}`, "profile");
  sleep(1);
  get("/api/health", "health");
  sleep(1);
}

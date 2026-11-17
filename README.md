# PSA Companion (PortSwigger Academy Companion)

> **Interactive learning bridge for self-learners on PortSwigger Web Security Academy.**  
> Eliminating cognitive friction with intuitive concept analogies, visual packet traces, and live X-Ray sandboxes.

Hosted directly on **GitHub Pages**: [https://jaiongithub.github.io/psa-companion/](https://jaiongithub.github.io/psa-companion/)

---

## 1. About the Project

PortSwigger Web Security Academy provides world-class labs, but beginners often face steep cognitive friction when black-box lab environments reject payloads without diagnostic feedback.

**PSA Companion** bridges this gap:
- Explaining the underlying logic with clear analogies and real-world context.
- Providing visual packet traces showing how inputs mutate across server filters.
- Offering interactive **X-Ray Sandboxes** with line-by-line simulated execution.
- Testing comprehension with interactive **Logic Quizzes**.
- Providing an **Exploit Playground** where learners craft unassisted raw payloads against practical simulated targets before heading to PortSwigger's official labs.

---

## 2. Learning Flow

Each lab inside a vulnerability module guides you through four focused stages:

1. **Stage 1 — Fundamentals & Normal Behavior**: Clear definitions, real-world analogies, and interactive SVG diagrams contrasting safe confinement against boundary breakout.
2. **Stage 2 — Defense Logic & Live Packet Trace**: Focused breakdown of the specific filter mechanism with a slowed 4-node animated packet trace (`HTTP Query` $\rightarrow$ `Filter / Decode` $\rightarrow$ `Path Join` $\rightarrow$ `OS Syscall`).
3. **Stage 3 — X-Ray Sandbox & Virtual Filesystem**: Interactive URL builder with clean probe payloads, illustrative backend code execution highlighting, string transformation steps, and live virtual filesystem tree inspection.
4. **Stage 4 — Logic Quiz & Confidence Launchpad**: 2 multiple-choice questions testing conceptual retention (with a shuffle option), unlocking the direct launch link to the official PortSwigger lab.

### Practical Exploit Playground
Accessible directly from the module sidebar after the labs, the **Exploit Playground** tests practical problem-solving across progressive targets without preset buttons or code assistance.

---

## 3. Local Development

PSA Companion is built with browser-native ES modules and runs with any standard local HTTP server:

```bash
# Using Python
python -m http.server 8000
```

Open `http://localhost:8000` in any modern web browser.

# PSA Companion (PortSwigger Academy Companion)

> **An interactive, browser-native learning bridge designed to demystify web security concepts for beginners before tackling official PortSwigger Web Security Academy labs.**

🌐 **Live Website:** [https://jaiongithub.github.io/psa-companion/](https://jaiongithub.github.io/psa-companion/)  
📂 **GitHub Repository:** [https://github.com/jaiongithub/psa-companion](https://github.com/jaiongithub/psa-companion)

---

## ⚠️ Important Disclaimer & Non-Affiliation Notice

> [!IMPORTANT]
> **PSA Companion is an independent, community-driven educational project developed out of personal interest and a passion for accessible cybersecurity learning. It is NOT an official PortSwigger product, nor is it affiliated with, endorsed by, sponsored by, or connected to PortSwigger Ltd. in any way.**
>
> *PortSwigger*, *Web Security Academy*, and related names, marks, and logos are the registered trademarks of PortSwigger Ltd. 
> 
> All backend code snippets, server traces, and filesystem behaviors presented in PSA Companion are **simplified illustrative simulation models** designed purely for pedagogical demonstration; they do **not** represent PortSwigger's proprietary backend infrastructure or actual academy lab code.

---

## 🎯 Project Objective

Starting a journey in web application security is exciting, but self-learners and students frequently encounter a steep cognitive wall:

1. **Text-Heavy Documentation:** Theoretical vulnerability write-ups can feel abstract and overwhelming for newcomers who don't yet have deep systems or backend experience.
2. **The "Black-Box" Dilemma:** Official practice environments (such as PortSwigger Academy) intentionally simulate real-world targets where a failed payload yields zero diagnostic feedback—often leaving beginners guessing *why* their request was blocked.

**PSA Companion** bridges this gap by transforming abstract security flaws into intuitive, visual, and diagnostic experiences. Before directing the learner to the official PortSwigger lab, PSA Companion provides:
- **Everyday Analogies:** Grounding technical concepts in relatable real-world scenarios.
- **Paced Mutating Packet Animations:** Visualizing payloads traversing through HTTP decoders, sanitizers, and OS syscalls.
- **Server-Side X-Ray Sandboxes:** Line-by-line illustrative code execution highlighting showing exactly where filters trigger.
- **Concept Quizzes & Practical Playgrounds:** Reinforcing logic retention and hands-on payload crafting in a safe, zero-consequence environment.

---

## 👥 Who Is This For?

### 🧭 For Self-Learners
- **Build Real Intuition First:** Understand the *mechanics* of a vulnerability rather than memorizing copy-paste cheat-sheet payloads.
- **Zero Diagnostic Guesswork:** The interactive X-Ray sandbox reveals whether your payload failed due to a missing prefix, a single-pass strip, or an encoding mismatch.
- **Confidence Launchpad:** Validate your understanding through conceptual logic checks before taking on PortSwigger's official labs.

### 🎓 For Students
- **Zero Setup & Friction-Free:** 100% browser-based. No virtual machines to configure, no Docker containers to spin up, and no local databases to install.
- **Safe Experimentation:** Break, mutate, and probe simulated file paths without the fear of corrupting environments or triggering rate limits.
- **Sequential Learning Flow:** Move systematically from basic concepts to complex bypasses with difficulty badges aligned with PortSwigger's curriculum.

### 👩‍🏫 For Teachers, Professors & Cybersecurity Instructors
- **Ready-Made Classroom Visual Aid:** Perfect for projecting on a screen during lectures. Use the **Trace Packet** animation to visually demonstrate how user input flows from query parameters into backend functions.
- **Interactive Demonstrations:** Step through line-by-line code execution in Python, Node.js, PHP, Java, and Go to show students the exact line where a vulnerability or filter check lives.
- **Lab Preparation & Pre-Flight:** Assign PSA Companion modules as pre-lab reading/activities so students arrive at hands-on lab sessions with strong conceptual foundations.
- **Works 100% Offline in Computer Labs:** Because there are no backend servers or database dependencies, instructors can download or clone the repo and run it on offline campus workstations.

---

## 🔬 The 4-Stage Learning Framework

Every vulnerability lab in PSA Companion follows a standardized 4-stage pedagogical flow:

```
┌────────────────────────────────────────────────────────────────────────┐
│  Stage 1: Fundamentals & Normal Behavior (Analogy & Interactive SVG)   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│  Stage 2: Defense Logic & Live Packet Trace (Paced 4-Node Pipeline)    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│  Stage 3: X-Ray Sandbox & Linux VFS (Execution Line Highlighter)       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│  Stage 4: Logic Quiz & Launchpad ───► Unlocks Official PortSwigger Lab │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Stage 1 — Fundamentals & Normal Behavior:** Concise cards answering *What is the flaw?*, *Everyday analogies*, and *Why it happens*, paired with an interactive SVG vector motion graphic toggling between **Normal Flow** and **Boundary Escape**.
2. **Stage 2 — Defense Logic & Live Packet Trace:** Crisp 3-bullet breakdown of the specific filter quirk paired with a paced, 4-node animated packet trace (`01. HTTP Query` $\rightarrow$ `02. Filter / Decode` $\rightarrow$ `03. Path Join` $\rightarrow$ `04. OS Syscall`).
3. **Stage 3 — X-Ray Browser Sandbox & Virtual Filesystem:** Interactive URL builder with clean probe payloads, illustrative backend source code with active line highlighting, step-by-step string transformations, and a live Linux filesystem tree.
4. **Stage 4 — Logic Quiz & Confidence Launchpad:** Interactive questions verifying core concepts with instant diagnostic feedback, unlocking the direct launch link to the official PortSwigger lab.

### 🎯 Practical Exploit Playground
Positioned as a dedicated section in the module sidebar after all labs, the **Exploit Playground** challenges learners to solve progressive, unassisted targets by typing raw payloads without preset buttons or code hints.

---

## 💻 Local Setup Instructions (For Faculty & Offline Classrooms)

Because PSA Companion runs entirely on standard browser technologies (native ES modules, vanilla JavaScript, Tailwind CSS via CDN, and localStorage), **no npm packages, build tools, or compilers are required**.

### Quick Start with Python
If you or your students have Python installed (standard on macOS, Linux, and modern Windows):

```bash
# 1. Clone the repository
git clone https://github.com/jaiongithub/psa-companion.git

# 2. Navigate to the project directory
cd psa-companion

# 3. Start a simple static web server
python -m http.server 8000
```
Open **`http://localhost:8000`** in any modern web browser (Chrome, Firefox, Edge, Safari).

---

### Alternative Local Servers

<details>
<summary><strong>Using Node.js / npx</strong></summary>

```bash
npx serve .
# or
npx http-server -p 8000
```
</details>

<details>
<summary><strong>Using PHP</strong></summary>

```bash
php -S localhost:8000
```
</details>

<details>
<summary><strong>Using VS Code Live Server</strong></summary>

1. Install the **Live Server** extension by Ritwick Dey in VS Code.
2. Right-click `index.html` and select **Open with Live Server**.
</details>

---

## 🛠️ Architecture & Technical Highlights

- **Zero-Backend Execution:** All simulation engines (virtual POSIX filesystem, path resolvers, token filters) run client-side in the browser.
- **Client-Side State Persistence:** Progress is isolated per module using namespaced `localStorage` keys, complete with JSON export/import for backing up student progress.
- **Native ES Modules:** Clean separation of concerns across reusable engines (`posix-vfs-engine.js`), controllers (`pipeline-tracer.js`, `quiz-engine.js`), and data configurations.

---

## 📜 License

This project is open-source and released under the **MIT License**. You are free to use, adapt, and share it for personal study, classroom teaching, workshops, and educational programs.

*Happy learning, and good luck conquering your PortSwigger Academy labs!*

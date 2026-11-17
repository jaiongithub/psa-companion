/**
 * CommandInjectionMotionGraphic
 * Interactive SVG vector animation demonstrating normal argument passing vs shell command injection breakout.
 */
export class CommandInjectionMotionGraphic {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
        this.mode = options.initialMode || 'normal'; // 'normal' | 'injection'
        this.baseCommand = options.baseCommand || 'stockcheck.sh';
        this.normalArg = options.normalArg || 'storeId=29';
        this.injectedCmd = options.injectedCmd || '| whoami';
    }

    setContainer(container) {
        this.container = typeof container === 'string' ? document.getElementById(container) : container;
    }

    render() {
        if (!this.container) {
            this.container = document.getElementById(this.containerId);
        }
        if (!this.container) return;
        const isNormal = this.mode === 'normal';

        this.container.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full ${isNormal ? 'bg-emerald-400' : 'bg-rose-400'}"></span>
          <span class="text-xs font-mono font-bold text-slate-200">
            ${isNormal ? 'NORMAL FLOW: SAFE COMMAND ARGUMENT' : 'COMMAND INJECTION: SHELL OPERATOR BREAKOUT'}
          </span>
        </div>
        <div class="inline-flex rounded-lg bg-slate-900 p-0.5 border border-slate-800" role="group" aria-label="Motion graphic mode switcher">
          <button type="button" data-mode="normal" class="px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors ${isNormal ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400 hover:text-slate-200'}">
            Normal Flow
          </button>
          <button type="button" data-mode="injection" class="px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors ${!isNormal ? 'bg-rose-500/20 text-rose-300 font-bold' : 'text-slate-400 hover:text-slate-200'}">
            Command Injection
          </button>
        </div>
      </div>

      <!-- Interactive SVG Command Execution Visual -->
      <div class="relative rounded-lg bg-slate-900/70 border border-slate-800/80 p-3 overflow-hidden">
        <svg viewBox="0 0 560 215" class="w-full h-auto select-none" role="img" aria-label="Demonstration of shell command injection">
          <defs>
            <marker id="ci-arrow-green" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
            </marker>
            <marker id="ci-arrow-red" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e" />
            </marker>
            <linearGradient id="ci-pipe-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#38bdf8" />
              <stop offset="100%" stop-color="${isNormal ? '#10b981' : '#f43f5e'}" />
            </linearGradient>
          </defs>

          <!-- HTTP Input Box -->
          <rect x="12" y="75" width="138" height="64" rx="8" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5" />
          <text x="24" y="96" fill="#38bdf8" font-size="9" font-family="JetBrains Mono" font-weight="bold">USER HTTP INPUT</text>
          <text x="24" y="114" fill="#e2e8f0" font-size="9.5" font-family="JetBrains Mono">
            ${isNormal ? 'storeId=29' : 'storeId=29 | whoami'}
          </text>
          <text x="24" y="128" fill="#64748b" font-size="8.5" font-family="JetBrains Mono">
            ${isNormal ? '(data value)' : '(operator injected)'}
          </text>

          <!-- Connecting line to Shell Concatenator -->
          <line x1="150" y1="107" x2="204" y2="107" stroke="url(#ci-pipe-grad)" stroke-width="2" class="animate-flow" />

          <!-- Shell Context Box (The System Interpreter) -->
          <rect x="206" y="25" width="340" height="165" rx="10" fill="#0b1329" stroke="${isNormal ? '#334155' : '#f43f5e'}" stroke-width="${isNormal ? '1.4' : '1.8'}" />
          <text x="220" y="46" fill="#94a3b8" font-size="9" font-family="JetBrains Mono" font-weight="bold">HOST OPERATING SYSTEM SHELL (/bin/sh)</text>

          <!-- Primary Intended Command -->
          <rect x="222" y="60" width="145" height="52" rx="7" fill="#0f172a" stroke="#10b981" stroke-width="1.4" />
          <text x="232" y="79" fill="#34d399" font-size="9" font-family="JetBrains Mono" font-weight="bold">1. INTENDED COMMAND</text>
          <text x="232" y="97" fill="#f8fafc" font-size="9.5" font-family="JetBrains Mono">./stockcheck.sh 29</text>

          ${isNormal ? `
            <!-- Normal: Data stays strictly as an argument -->
            <rect x="385" y="60" width="145" height="52" rx="7" fill="#052e16" fill-opacity="0.3" stroke="#10b981" stroke-width="1.3" />
            <text x="395" y="79" fill="#34d399" font-size="9" font-family="JetBrains Mono" font-weight="bold">OUTPUT TO APP</text>
            <text x="395" y="97" fill="#6ee7b7" font-size="9.5" font-family="JetBrains Mono">"54 units in stock"</text>

            <line x1="367" y1="86" x2="383" y2="86" stroke="#10b981" stroke-width="2" marker-end="url(#ci-arrow-green)" class="animate-flow" />

            <circle r="4.5" fill="#34d399">
              <animateMotion dur="2.4s" repeatCount="indefinite" path="M 80 107 L 206 107 L 295 86 L 450 86" />
            </circle>
          ` : `
            <!-- Injected Secondary Command Box -->
            <rect x="385" y="60" width="145" height="52" rx="7" fill="#2d121c" stroke="#f43f5e" stroke-width="1.8" />
            <text x="395" y="79" fill="#fb7185" font-size="9" font-family="JetBrains Mono" font-weight="bold">2. HIJACKED EXECUTION</text>
            <text x="395" y="97" fill="#fda4af" font-size="9.5" font-family="JetBrains Mono">whoami</text>

            <!-- Shell Operator Splitting Badge -->
            <rect x="345" y="128" width="80" height="26" rx="5" fill="#1e1b2e" stroke="#fb7185" stroke-width="1" />
            <text x="353" y="145" fill="#fb7185" font-size="9" font-family="JetBrains Mono" font-weight="bold">PIPE: |</text>

            <!-- Chained Execution Output Box -->
            <rect x="222" y="125" width="115" height="52" rx="7" fill="#052e16" fill-opacity="0.2" stroke="#64748b" stroke-width="1" />
            <text x="232" y="145" fill="#94a3b8" font-size="8.5" font-family="JetBrains Mono">STDIN HIJACKED</text>
            <text x="232" y="162" fill="#cbd5e1" font-size="9" font-family="JetBrains Mono">returns "peter-lab"</text>

            <!-- Red Trajectory Arrow -->
            <path d="M 367 86 C 375 86, 375 86, 383 86" fill="none" stroke="#f43f5e" stroke-width="2.2" marker-end="url(#ci-arrow-red)" class="animate-flow" />

            <circle r="4.5" fill="#fb7185">
              <animateMotion dur="2.4s" repeatCount="indefinite" path="M 80 107 L 206 107 L 295 86 L 450 86" />
            </circle>
          `}
        </svg>
      </div>

      <div class="mt-2.5 flex items-center justify-between text-[11px] font-mono">
        <span class="${isNormal ? 'text-emerald-400' : 'text-rose-400'}">
          ${isNormal
            ? '✓ Input is treated strictly as an argument to the intended command'
            : '⚠ Shell operator ("|", ";", "&", "$()") triggers arbitrary OS execution'}
        </span>
        <span class="text-slate-500">Shell AST Visualizer</span>
      </div>
    `;

        const normalBtn = this.container.querySelector('button[data-mode="normal"]');
        const injectionBtn = this.container.querySelector('button[data-mode="injection"]');
        if (normalBtn) normalBtn.onclick = () => this.setMode('normal');
        if (injectionBtn) injectionBtn.onclick = () => this.setMode('injection');
    }

    setMode(newMode) {
        this.mode = newMode;
        this.render();
    }
}

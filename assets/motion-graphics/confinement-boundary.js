/**
 * ConfinementBoundaryMotionGraphic
 * Standalone interactive SVG vector animation demonstrating normal confined flow vs boundary escape.
 */
export class ConfinementBoundaryMotionGraphic {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
        this.mode = options.initialMode || 'normal'; // 'normal' | 'escape'
        this.instanceName = options.instanceName || 'window.confinementMotionGraphic';
        this.trustedRoot = options.trustedRoot || '/var/www/images/';
        this.targetFile = options.targetFile || '/etc/passwd';
        this.normalFile = options.normalFile || 'banner.png';
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
            ${isNormal ? 'NORMAL BEHAVIOR: CONFINED ASSET FETCH' : 'BOUNDARY ESCAPE: UNCONFINED TRAVERSAL'}
          </span>
        </div>
        <div class="inline-flex rounded-lg bg-slate-900 p-0.5 border border-slate-800" role="group" aria-label="Motion graphic mode switcher">
          <button type="button" data-mode="normal" class="px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors ${isNormal ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400 hover:text-slate-200'}">
            Normal Flow
          </button>
          <button type="button" data-mode="escape" class="px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors ${!isNormal ? 'bg-rose-500/20 text-rose-300 font-bold' : 'text-slate-400 hover:text-slate-200'}">
            Boundary Escape
          </button>
        </div>
      </div>

      <!-- Interactive SVG Directory Tree Motion Graphic -->
      <div class="relative rounded-lg bg-slate-900/70 border border-slate-800/80 p-3 overflow-hidden">
        <svg viewBox="0 0 560 205" class="w-full h-auto select-none" role="img" aria-label="Visual demonstration of directory traversal path resolution">
          <defs>
            <marker id="mg-arrow-green" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
            </marker>
            <marker id="mg-arrow-red" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e" />
            </marker>
          </defs>

          <!-- HTTP Client Box -->
          <rect x="12" y="72" width="132" height="58" rx="8" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5" />
          <text x="24" y="93" fill="#38bdf8" font-size="9" font-family="JetBrains Mono" font-weight="bold">HTTP REQUEST</text>
          <text x="24" y="110" fill="#e2e8f0" font-size="9.5" font-family="JetBrains Mono">
            ${isNormal ? `?file=${this.normalFile}` : '?file=<traversal>'}
          </text>

          <!-- Filesystem Root Box (Restricted Zone) -->
          <rect x="200" y="12" width="150" height="62" rx="8" fill="#1e1b2e" stroke="#f43f5e" stroke-dasharray="4 3" stroke-width="1.4" />
          <text x="212" y="31" fill="#fb7185" font-size="9" font-family="JetBrains Mono" font-weight="bold">/ (SYSTEM ROOT)</text>
          <rect x="212" y="40" width="126" height="24" rx="5" fill="#0f172a" stroke="#f43f5e" stroke-opacity="0.5" />
          <text x="220" y="55" fill="#fda4af" font-size="9.5" font-family="JetBrains Mono">🔑 ${this.targetFile}</text>

          <!-- Confinement Boundary Box (/var/www/images/) -->
          <rect x="200" y="96" width="345" height="96" rx="10" fill="#052e16" fill-opacity="0.28" stroke="#10b981" stroke-width="1.6" />
          <text x="214" y="115" fill="#34d399" font-size="9.5" font-family="JetBrains Mono" font-weight="bold">TRUSTED WEB ROOT: ${this.trustedRoot}</text>

          <!-- Safe Child File inside Confinement -->
          <rect x="385" y="132" width="144" height="44" rx="7" fill="#0f172a" stroke="#10b981" stroke-width="1.4" />
          <text x="396" y="151" fill="#6ee7b7" font-size="9" font-family="JetBrains Mono" font-weight="bold">SAFE CHILD ASSET</text>
          <text x="396" y="166" fill="#e2e8f0" font-size="9.5" font-family="JetBrains Mono">🖼️ ${this.normalFile}</text>

          <!-- Server Path Joiner Node -->
          <rect x="214" y="132" width="136" height="44" rx="7" fill="#0f172a" stroke="#64748b" stroke-width="1.3" />
          <text x="224" y="150" fill="#94a3b8" font-size="8.5" font-family="JetBrains Mono">BASE + INPUT</text>
          <text x="224" y="165" fill="#f8fafc" font-size="9" font-family="JetBrains Mono">open(joined_path)</text>

          <!-- Request Connector -->
          <line x1="144" y1="101" x2="210" y2="152" stroke="${isNormal ? '#10b981' : '#f43f5e'}" stroke-width="2" class="animate-flow" />

          ${isNormal ? `
            <!-- Normal Path Trajectory inside Green Zone -->
            <line x1="350" y1="154" x2="379" y2="154" stroke="#10b981" stroke-width="2.2" marker-end="url(#mg-arrow-green)" class="animate-flow" />
            <circle r="5" fill="#34d399">
              <animateMotion dur="2.2s" repeatCount="indefinite" path="M 78 101 L 282 154 L 455 154" />
            </circle>
          ` : `
            <!-- Escape Trajectory Breaking Out of Green Zone Upward to /etc/passwd -->
            <path d="M 282 132 C 282 104, 275 94, 275 70" fill="none" stroke="#f43f5e" stroke-width="2.2" marker-end="url(#mg-arrow-red)" class="animate-flow" />
            <circle r="5" fill="#fb7185">
              <animateMotion dur="2.4s" repeatCount="indefinite" path="M 78 101 L 282 154 L 282 132 C 282 104, 275 94, 275 64" />
            </circle>
          `}
        </svg>
      </div>

      <div class="mt-2.5 flex items-center justify-between text-[11px] font-mono">
        <span class="${isNormal ? 'text-emerald-400' : 'text-rose-400'}">
          ${isNormal
            ? `✓ Resolved path stays strictly inside ${this.trustedRoot}`
            : `⚠ Parent segments ("..") climb out of ${this.trustedRoot} to /`}
        </span>
        <span class="text-slate-500">SVG Motion Engine</span>
      </div>
    `;

        // Wire event listeners directly without relying on global window identifiers
        const normalBtn = this.container.querySelector('button[data-mode="normal"]');
        const escapeBtn = this.container.querySelector('button[data-mode="escape"]');
        if (normalBtn) normalBtn.onclick = () => this.setMode('normal');
        if (escapeBtn) escapeBtn.onclick = () => this.setMode('escape');
    }

    setMode(newMode) {
        this.mode = newMode;
        this.render();
    }
}

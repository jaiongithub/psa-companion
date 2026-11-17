/**
 * UIRenderer
 * Master UI coordinator connecting engines, motion graphics, and state management.
 */
import { escapeHtml } from './quiz-engine.js';
import { DEFAULT_VFS_TREE_NODES } from '../engines/posix-vfs-engine.js';
import { ConfinementBoundaryMotionGraphic } from '../../assets/motion-graphics/confinement-boundary.js';

export class UIRenderer {
    constructor({ moduleConfig, arenaConfig, stateManager, pipelineTracer, quizEngine, router }) {
        this.moduleConfig = moduleConfig;
        this.arenaConfig = arenaConfig;
        this.stateManager = stateManager;
        this.pipelineTracer = pipelineTracer;
        this.quizEngine = quizEngine;
        this.router = router;

        this.motionGraphic = null;
        this.activeLabIndex = 0;
        this.activeArenaIndex = 0;
    }

    init(initialLabIndex = 0) {
        this.activeLabIndex = initialLabIndex;
        this.stateManager.load(this.moduleConfig.labs);

        // Mount motion graphic component
        this.motionGraphic = new ConfinementBoundaryMotionGraphic('normal-motion-graphic-host', {
            trustedRoot: '/var/www/images/',
            targetFile: '/etc/passwd',
            normalFile: '218.png'
        });
        this.motionGraphic.render();

        // Render persistent module headers
        this.renderModuleHeader();
        this.renderCommonMission();

        // Select the active lab
        this.selectLab(this.activeLabIndex, false);

        // Render Bug Bounty Arena
        this.renderArena();

        // Setup global event listeners
        this.bindEvents();
    }

    bindEvents() {
        const payloadInput = document.getElementById('payload-input');
        if (payloadInput) {
            payloadInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.executePayload(true);
                }
            });
        }
    }

    renderModuleHeader() {
        const meta = this.moduleConfig.moduleMetadata;
        const moduleTitleEl = document.getElementById('header-module-title');
        if (moduleTitleEl) {
            moduleTitleEl.textContent = meta.name;
        }
        const moduleTaglineEl = document.getElementById('header-module-tagline');
        if (moduleTaglineEl) {
            moduleTaglineEl.textContent = meta.tagline;
        }
    }

    renderCommonMission() {
        const mission = this.moduleConfig.moduleMetadata.commonMission;
        const container = document.getElementById('common-mission-card');
        if (!container || !mission) return;

        container.innerHTML = `
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2 text-xs font-semibold text-emerald-400">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>${escapeHtml(mission.title)}</span>
        </div>
        <span class="text-[10px] font-mono text-slate-500">${escapeHtml(mission.badge)}</span>
      </div>
      <p class="text-xs text-slate-300 leading-relaxed">${mission.description}</p>
      <div class="mt-2.5 px-2.5 py-1.5 rounded bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 flex items-center justify-between">
        <span>${escapeHtml(mission.targetPath)}</span>
        <span class="text-[10px] text-slate-500">${escapeHtml(mission.targetLabel)}</span>
      </div>
    `;
    }

    selectLab(index, updateHistory = true) {
        if (index < 0 || index >= this.moduleConfig.labs.length) return;
        this.activeLabIndex = index;
        if (updateHistory) {
            this.router.setRoute(this.moduleConfig.moduleMetadata.slug, index);
        }

        const lab = this.moduleConfig.labs[index];

        // Header info
        const badgeEl = document.getElementById('lab-badge');
        const numEl = document.getElementById('lab-number');
        const titleEl = document.getElementById('lab-title');

        if (badgeEl) {
            badgeEl.className = lab.level === 'APPRENTICE'
                ? 'px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider bg-purple-500/15 text-purple-300 border border-purple-500/30';
            badgeEl.textContent = lab.level;
        }
        if (numEl) {
            numEl.textContent = `LAB ${lab.number} OF ${String(this.moduleConfig.labs.length).padStart(2, '0')}`;
        }
        if (titleEl) {
            titleEl.textContent = lab.title;
        }

        // Stage 1 Concept Bullets
        const bulletsEl = document.getElementById('concept-bullets');
        if (bulletsEl) {
            bulletsEl.innerHTML = lab.bullets.map(b => `
        <li class="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
          <span class="text-cyan-400 font-mono font-bold shrink-0 mt-0.5">▸</span>
          <span class="leading-relaxed">${b}</span>
        </li>
      `).join('');
        }

        // Tactical Hint
        const hintText = document.getElementById('hint-text');
        if (hintText) hintText.textContent = lab.hint;

        // Reset Hint Box Visibility
        const hintBox = document.getElementById('hint-box');
        const hintBtnText = document.getElementById('hint-toggle-btn')?.querySelector('span');
        if (hintBox && hintBtnText) {
            hintBox.classList.add('hidden');
            hintBtnText.textContent = 'Show Tactical Hint';
            this.stateManager.state.hintVisible = false;
        }

        // Stage 2: Default input & Conceptual Probe Chips
        const defaultProbe = lab.probes[0]?.value || '218.png';
        const payloadInput = document.getElementById('payload-input');
        if (payloadInput) payloadInput.value = defaultProbe;

        const backendFilename = document.getElementById('backend-filename');
        if (backendFilename) backendFilename.textContent = lab.backendFile;

        const chipsEl = document.getElementById('probe-chips');
        if (chipsEl) {
            chipsEl.innerHTML = lab.probes.map((probe, idx) => `
        <button 
          type="button"
          data-probe-val="${escapeHtml(probe.value)}"
          class="probe-chip-btn px-2.5 py-1 rounded-md text-[11px] font-mono bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-300 border border-slate-700/80 transition-colors"
        >
          ${idx === lab.probes.length - 1 ? '⚡ ' : ''}${escapeHtml(probe.label)}
        </button>
      `).join('');

            chipsEl.querySelectorAll('.probe-chip-btn').forEach(btn => {
                btn.onclick = () => {
                    const val = btn.getAttribute('data-probe-val');
                    if (payloadInput) payloadInput.value = val;
                    this.executePayload(true);
                };
            });
        }

        this.renderSidebar();
        this.renderQuiz();
        this.executePayload(false); // Silent run
        this.updateReadinessUI();
    }

    renderSidebar() {
        const container = document.getElementById('lab-list');
        if (!container) return;

        container.innerHTML = this.moduleConfig.labs.map((lab, idx) => {
            const isActive = idx === this.activeLabIndex;
            const complete = this.stateManager.isLabComplete(lab);

            const badgeColor = lab.level === 'APPRENTICE'
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                : 'bg-purple-500/10 text-purple-400 border-purple-500/20';

            let stateIndicator = '';
            if (complete) {
                stateIndicator = '<span class="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">READY</span>';
            } else if (isActive) {
                stateIndicator = '<span class="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">ACTIVE</span>';
            }

            const activeStyles = isActive
                ? 'bg-slate-800/90 border-cyan-500/60 shadow-lg shadow-cyan-500/5'
                : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700';

            return `
        <button 
          type="button"
          data-lab-index="${idx}"
          class="sidebar-lab-btn w-full text-left p-3 rounded-xl border transition-all ${activeStyles}"
        >
          <div class="flex items-center justify-between gap-1 mb-1.5">
            <div class="flex items-center gap-1.5">
              <span class="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${badgeColor}">
                ${lab.level === 'APPRENTICE' ? 'APP' : 'PRAC'}
              </span>
              <span class="text-[10px] font-mono text-slate-400">LAB ${lab.number}</span>
            </div>
            ${stateIndicator}
          </div>
          <div class="text-xs font-semibold text-slate-100 line-clamp-2">${escapeHtml(lab.title)}</div>
          <div class="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Filter: <strong class="text-slate-300">${escapeHtml(lab.filterBadge)}</strong></span>
          </div>
        </button>
      `;
        }).join('');

        container.querySelectorAll('.sidebar-lab-btn').forEach(btn => {
            btn.onclick = () => {
                const idx = parseInt(btn.getAttribute('data-lab-index'), 10);
                this.selectLab(idx);
            };
        });

        // Global Module Progress Bar
        const totalLabs = this.moduleConfig.labs.length;
        const readyCount = this.moduleConfig.labs.filter(l => this.stateManager.isLabComplete(l)).length;
        const pct = Math.round((readyCount / totalLabs) * 100);

        const progText = document.getElementById('global-progress-text');
        const progBar = document.getElementById('global-progress-bar');
        if (progText) progText.textContent = `${readyCount} / ${totalLabs} Labs Ready`;
        if (progBar) progBar.style.width = `${pct}%`;
    }

    renderQuiz() {
        const lab = this.moduleConfig.labs[this.activeLabIndex];
        this.quizEngine.render('quiz-container', 'quiz-score-label', lab, (poolIdx, optionIdx) => {
            this.quizEngine.recordAnswer(lab, poolIdx, optionIdx);
            this.renderQuiz();
            this.renderSidebar();
            this.updateReadinessUI();

            if (this.stateManager.isLabComplete(lab)) {
                this.showToast('Lab Readiness Unlocked!', `You are ready to solve "${lab.title}" on PortSwigger Academy.`, 'emerald');
            }
        });
    }

    reshuffleQuizPool() {
        const lab = this.moduleConfig.labs[this.activeLabIndex];
        this.stateManager.reshuffleLabQuiz(lab);
        this.renderQuiz();
        this.renderSidebar();
        this.updateReadinessUI();
        this.showToast('Quiz Pool Shuffled', 'Drew 2 fresh questions from the 5-question pool.', 'cyan');
    }

    executePayload(userTriggered = true) {
        const lab = this.moduleConfig.labs[this.activeLabIndex];
        const inputEl = document.getElementById('payload-input');
        if (!inputEl) return;
        const rawInput = inputEl.value;

        const result = lab.simulate(rawInput);
        const prog = this.stateManager.getLabProgress(lab.id);

        // Mark sandbox exfiltration solved if /etc/passwd was hit
        if (!result.blocked && result.canonicalPath === '/etc/passwd' && !prog.sandboxSolved) {
            prog.sandboxSolved = true;
            this.stateManager.save();
            this.showToast('Target File Exfiltrated!', 'Successfully read /etc/passwd. Pass the quiz to unlock the official lab!', 'emerald');
            this.renderSidebar();
            this.updateReadinessUI();
        }

        // 1. Render Backend Source Code
        const codeEl = document.getElementById('backend-code-view');
        if (codeEl) {
            codeEl.innerHTML = lab.codeLines.map(line => {
                const isExecuted = result.activeLines.includes(line.num);
                const isBlockLine = result.blocked && isExecuted && line.num === result.activeLines[result.activeLines.length - 1];

                let lineStyle = 'text-slate-500 opacity-60';
                let indicator = '&nbsp;&nbsp;';

                if (isBlockLine) {
                    lineStyle = 'bg-rose-500/15 text-rose-300 font-bold border-l-2 border-rose-500 pl-2';
                    indicator = '🚫';
                } else if (isExecuted) {
                    lineStyle = 'bg-cyan-500/10 text-cyan-200 border-l-2 border-cyan-400 pl-2';
                    indicator = '▶&nbsp;';
                } else if (line.comment) {
                    lineStyle = 'text-amber-400/80 italic';
                }

                return `
          <div class="flex items-center gap-2 py-0.5 px-1 rounded transition-colors ${lineStyle}">
            <span class="w-6 text-right select-none font-mono text-[10px] text-slate-600">${line.num}</span>
            <span class="select-none font-mono text-[10px] w-4">${indicator}</span>
            <pre class="font-mono text-xs overflow-x-auto"><code>${escapeHtml(line.code)}</code></pre>
          </div>
        `;
            }).join('');
        }

        // 2. Render Step-by-Step String Transformation Trace
        const stepsEl = document.getElementById('transformation-steps');
        const verdictBadge = document.getElementById('trace-verdict-badge');

        if (verdictBadge) {
            if (result.blocked) {
                verdictBadge.textContent = 'BLOCKED BY FILTER';
                verdictBadge.className = 'px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300';
            } else if (result.canonicalPath === '/etc/passwd') {
                verdictBadge.textContent = 'EXPLOIT SUCCESSFUL';
                verdictBadge.className = 'px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300';
            } else {
                verdictBadge.textContent = 'NORMAL REQUEST';
                verdictBadge.className = 'px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300';
            }
        }

        if (stepsEl) {
            stepsEl.innerHTML = result.steps.map((step, idx) => {
                let badgeClass = 'bg-slate-900 border-slate-800 text-slate-400';
                if (step.status === 'blocked') {
                    badgeClass = 'bg-rose-950/60 border-rose-500/40 text-rose-300 font-bold';
                } else if (step.status === 'bypassed') {
                    badgeClass = 'bg-amber-950/60 border-amber-500/40 text-amber-300 font-bold';
                } else if (step.isTarget) {
                    badgeClass = 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 font-bold';
                } else if (step.highlight) {
                    badgeClass = 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300';
                }

                return `
          <div class="p-2.5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 ${badgeClass}">
            <span class="text-[11px] font-mono text-slate-400 font-medium">${escapeHtml(step.label)}</span>
            <span class="font-mono text-xs text-slate-100 break-all select-all">${escapeHtml(step.value)}</span>
          </div>
        `;
            }).join('');
        }

        // 3. Update Pipeline Static Nodes
        this.pipelineTracer.updateStaticNodes({ rawInput, result });

        // 4. Virtual Filesystem & HTTP Response
        const statusBadge = document.getElementById('http-status-badge');
        const previewEl = document.getElementById('http-response-preview');

        if (result.blocked) {
            if (statusBadge) {
                statusBadge.textContent = '403 Forbidden';
                statusBadge.className = 'px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-500/20 text-rose-300';
            }
            if (previewEl) {
                previewEl.textContent = `HTTP/1.1 403 Forbidden\nContent-Type: text/plain; charset=utf-8\nX-Content-Type-Options: nosniff\n\n${result.blockReason}`;
            }
        } else {
            const canon = result.canonicalPath;
            const isTarget = canon === '/etc/passwd';

            if (canon === '/var/www/images/218.png') {
                if (statusBadge) {
                    statusBadge.textContent = '200 OK';
                    statusBadge.className = 'px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/20 text-emerald-300';
                }
                if (previewEl) {
                    previewEl.textContent = 'HTTP/1.1 200 OK\nContent-Type: image/png\nContent-Length: 14820\n\n[BINARY PNG DATA: 14,820 bytes - Product Thumbnail #218]';
                }
            } else if (isTarget) {
                if (statusBadge) {
                    statusBadge.textContent = '200 OK (FLAG HIT)';
                    statusBadge.className = 'px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/30 text-emerald-300 border border-emerald-500/40';
                }
                if (previewEl) {
                    previewEl.textContent = 'HTTP/1.1 200 OK\nContent-Type: text/plain\nContent-Length: 184\n\nroot:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\nacademy:x:1001:1001:PortSwigger Lab User:/home/academy:/bin/bash';
                }
            } else if (canon === '/var/www/html/index.php') {
                if (statusBadge) {
                    statusBadge.textContent = '200 OK';
                    statusBadge.className = 'px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-500/20 text-cyan-300';
                }
                if (previewEl) {
                    previewEl.textContent = 'HTTP/1.1 200 OK\nContent-Type: text/plain\n\n<?php\n// Shop front controller\nrequire_once __DIR__ . "/../config/db.php";\necho "<h1>Welcome to CyberShop</h1>";\n?>';
                }
            } else if (canon === '/etc/hosts') {
                if (statusBadge) {
                    statusBadge.textContent = '200 OK';
                    statusBadge.className = 'px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-500/20 text-cyan-300';
                }
                if (previewEl) {
                    previewEl.textContent = 'HTTP/1.1 200 OK\nContent-Type: text/plain\n\n127.0.0.1\tlocalhost\n127.0.1.1\tweb-academy-lab.internal\n::1\t\tlocalhost ip6-localhost ip6-loopback';
                }
            } else {
                if (statusBadge) {
                    statusBadge.textContent = '404 Not Found';
                    statusBadge.className = 'px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300';
                }
                if (previewEl) {
                    previewEl.textContent = `HTTP/1.1 404 Not Found\nContent-Type: text/plain\n\nError: ENOENT: no such file or directory, open '${canon}'`;
                }
            }
        }

        // 5. Render Virtual Filesystem Tree
        this.renderVfsTree(result.canonicalPath, result.traversalSteps);

        // 6. Mutating Packet Animation
        if (userTriggered) {
            this.pipelineTracer.animate({ rawInput, lab, result });
        }
    }

    renderVfsTree(activeCanonical, traversalSteps = []) {
        const treeEl = document.getElementById('vfs-tree');
        if (!treeEl) return;
        const visitedDirs = new Set(traversalSteps.map(s => s.current));

        treeEl.innerHTML = DEFAULT_VFS_TREE_NODES.map(node => {
            const isSelected = activeCanonical === node.path;
            const isTraversed = visitedDirs.has(node.path) || (node.path === '/' && visitedDirs.has('/'));
            const indent = node.depth * 14;

            let rowStyle = 'text-slate-400 border-transparent';
            let badge = '';

            if (isSelected && node.target) {
                rowStyle = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 font-bold';
                badge = '<span class="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/25 text-emerald-300">EXFILTRATED</span>';
            } else if (isSelected) {
                rowStyle = 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 font-semibold';
                badge = '<span class="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300">RESOLVED</span>';
            } else if (isTraversed) {
                rowStyle = 'text-amber-300/90 border-transparent';
                badge = '<span class="text-[9px] text-amber-400/80">traversed</span>';
            } else if (node.target) {
                rowStyle = 'text-slate-300 border-transparent';
                badge = '<span class="text-[9px] text-rose-400/80">target</span>';
            }

            const icon = node.isDir ? '📁' : (node.target ? '🔑' : '📄');

            return `
        <div style="padding-left: ${indent + 8}px" class="pr-2 py-1 rounded border flex items-center justify-between ${rowStyle}">
          <div class="flex items-center gap-1.5 truncate">
            <span class="text-[11px]">${icon}</span>
            <span class="truncate">${node.label}</span>
          </div>
          ${badge}
        </div>
      `;
        }).join('');
    }

    updateReadinessUI() {
        const lab = this.moduleConfig.labs[this.activeLabIndex];
        const prog = this.stateManager.getLabProgress(lab.id);
        const quizPassed = this.stateManager.isLabQuizPassed(lab);
        const sampledIndices = this.stateManager.ensureLabQuizSample(lab);

        // Header Status Pills
        const pillSb = document.getElementById('status-pill-sandbox');
        const pillQz = document.getElementById('status-pill-quiz');

        if (pillSb) {
            if (prog.sandboxSolved) {
                pillSb.className = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border bg-emerald-950/40 border-emerald-500/40 text-emerald-300';
                pillSb.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span><span>Sandbox: Solved</span>';
            } else {
                pillSb.className = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border bg-slate-950 border-slate-800 text-slate-400';
                pillSb.innerHTML = '<span class="w-2 h-2 rounded-full bg-slate-600"></span><span>Sandbox: Pending</span>';
            }
        }

        if (pillQz) {
            const passedCount = sampledIndices.filter(poolIdx => prog.quizAnswers[poolIdx] === lab.quizPool[poolIdx].correctIndex).length;
            if (quizPassed) {
                pillQz.className = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border bg-emerald-950/40 border-emerald-500/40 text-emerald-300';
                pillQz.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-400"></span><span>Quiz: 2/2 Passed</span>';
            } else {
                pillQz.className = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border bg-slate-950 border-slate-800 text-slate-400';
                pillQz.innerHTML = `<span class="w-2 h-2 rounded-full bg-slate-600"></span><span>Quiz: ${passedCount}/2</span>`;
            }
        }

        // Gatekeeper Checklist Statuses in Stage 3
        const sbState = document.getElementById('gate-sandbox-state');
        const sbIcon = document.getElementById('gate-sandbox-icon');
        const qzState = document.getElementById('gate-quiz-state');
        const qzIcon = document.getElementById('gate-quiz-icon');

        if (sbState && sbIcon) {
            if (prog.sandboxSolved) {
                sbIcon.className = 'w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400';
                sbState.textContent = 'EXFILTRATED';
                sbState.className = 'text-[10px] font-mono font-bold text-emerald-400';
            } else {
                sbIcon.className = 'w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center text-slate-600';
                sbState.textContent = 'PENDING';
                sbState.className = 'text-[10px] font-mono text-slate-500';
            }
        }

        if (qzState && qzIcon) {
            const passedCount = sampledIndices.filter(poolIdx => prog.quizAnswers[poolIdx] === lab.quizPool[poolIdx].correctIndex).length;
            if (quizPassed) {
                qzIcon.className = 'w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400';
                qzState.textContent = 'PASSED (2/2)';
                qzState.className = 'text-[10px] font-mono font-bold text-emerald-400';
            } else {
                qzIcon.className = 'w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center text-slate-600';
                qzState.textContent = `${passedCount}/2 PASSED`;
                qzState.className = 'text-[10px] font-mono text-slate-500';
            }
        }

        // Explore Mode Toggle Visuals
        const toggleBtn = document.getElementById('explore-mode-toggle');
        const toggleKnob = document.getElementById('explore-mode-knob');
        if (toggleBtn && toggleKnob) {
            toggleBtn.setAttribute('aria-checked', String(this.stateManager.state.exploreMode));
            if (this.stateManager.state.exploreMode) {
                toggleBtn.className = 'w-9 h-5 rounded-full bg-cyan-600 border border-cyan-400 p-0.5 transition-colors relative';
                toggleKnob.className = 'block w-3.5 h-3.5 rounded-full bg-white transition-transform translate-x-4';
            } else {
                toggleBtn.className = 'w-9 h-5 rounded-full bg-slate-800 border border-slate-700 p-0.5 transition-colors relative';
                toggleKnob.className = 'block w-3.5 h-3.5 rounded-full bg-slate-400 transition-transform translate-x-0';
            }
        }

        // Launch Button State
        const unlocked = this.stateManager.isLabComplete(lab) || this.stateManager.state.exploreMode;
        const launchBtn = document.getElementById('launch-wsa-btn');
        const lockIcon = document.getElementById('launch-lock-icon');
        const btnText = document.getElementById('launch-btn-text');

        if (launchBtn && lockIcon && btnText) {
            launchBtn.href = lab.wsaUrl;
            if (unlocked) {
                launchBtn.className = 'w-full py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 shadow-lg shadow-emerald-500/20 cursor-pointer';
                lockIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />';
                btnText.textContent = this.stateManager.isLabComplete(lab)
                    ? 'Launch Official PortSwigger Lab ↗'
                    : 'Launch Official PortSwigger Lab (Explore Mode) ↗';
            } else {
                launchBtn.className = 'w-full py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed';
                lockIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />';
                btnText.textContent = 'Complete Sandbox & Quiz to Unlock';
            }
        }
    }

    toggleExploreMode() {
        this.stateManager.state.exploreMode = !this.stateManager.state.exploreMode;
        this.stateManager.save();
        this.updateReadinessUI();
        if (this.stateManager.state.exploreMode) {
            this.showToast('Explore Mode Enabled', 'All official PortSwigger Academy lab links are now unlocked.', 'cyan');
        }
    }

    handleLaunchClick(event) {
        const lab = this.moduleConfig.labs[this.activeLabIndex];
        const unlocked = this.stateManager.isLabComplete(lab) || this.stateManager.state.exploreMode;
        if (!unlocked) {
            event.preventDefault();
            this.showToast('Launchpad Locked', 'Exfiltrate /etc/passwd in the X-Ray Sandbox and pass the 2 quiz questions first (or enable Explore Mode).', 'amber');
        }
    }

    toggleHint() {
        this.stateManager.state.hintVisible = !this.stateManager.state.hintVisible;
        const box = document.getElementById('hint-box');
        const btnText = document.getElementById('hint-toggle-btn')?.querySelector('span');
        if (box && btnText) {
            if (this.stateManager.state.hintVisible) {
                box.classList.remove('hidden');
                btnText.textContent = 'Hide Tactical Hint';
            } else {
                box.classList.add('hidden');
                btnText.textContent = 'Show Tactical Hint';
            }
        }
    }

    toggleFundamentalsDrawer() {
        const body = document.getElementById('fundamentals-body');
        const btn = document.getElementById('fundamentals-toggle-btn');
        if (!body || !btn) return;
        this.stateManager.state.fundamentalsOpen = !this.stateManager.state.fundamentalsOpen;
        if (this.stateManager.state.fundamentalsOpen) {
            body.classList.remove('hidden');
            btn.textContent = 'Collapse Baseline';
        } else {
            body.classList.add('hidden');
            btn.textContent = 'Expand Baseline';
        }
    }

    // ==========================================
    // STAGE 4: BUG BOUNTY ARENA RENDERER
    // ==========================================
    isArenaUnlocked(index) {
        if (index === 0) return true;
        const prevScenario = this.arenaConfig[index - 1];
        return this.stateManager.getArenaState(prevScenario).solved;
    }

    selectArenaScenario(index) {
        if (!this.isArenaUnlocked(index)) {
            this.showToast('Target Locked', 'Compromise the previous target first to unlock this challenge.', 'amber');
            return;
        }
        this.activeArenaIndex = index;
        this.renderArena();
    }

    toggleArenaHint() {
        const scenario = this.arenaConfig[this.activeArenaIndex];
        const st = this.stateManager.getArenaState(scenario);
        st.hintOpen = !st.hintOpen;
        this.renderArena();
    }

    submitArenaPayload() {
        const scenario = this.arenaConfig[this.activeArenaIndex];
        const st = this.stateManager.getArenaState(scenario);
        const inputEl = document.getElementById('arena-payload-input');
        if (!inputEl) return;
        const rawInput = inputEl.value;

        st.attempts += 1;
        st.lastInput = rawInput;

        const evalResult = scenario.evaluate(rawInput);

        if (evalResult.blocked) {
            st.lastStatus = '403 Forbidden';
            st.lastOutput = `HTTP/1.1 403 Forbidden\nServer: ${scenario.domain}\n\n${evalResult.reason}`;
        } else {
            const canon = evalResult.canonical;
            if (scenario.fs[canon]) {
                st.lastStatus = '200 OK';
                st.lastOutput = `HTTP/1.1 200 OK\nServer: ${scenario.domain}\nX-Canonical-Path: ${canon}\n\n${scenario.fs[canon]}`;

                if (canon === scenario.targetFile && !st.solved) {
                    st.solved = true;
                    this.showToast(`Target Compromised: ${scenario.name}`, 'Flag file exfiltrated! Next real-world target unlocked.', 'emerald');
                }
            } else {
                st.lastStatus = '404 Not Found';
                st.lastOutput = `HTTP/1.1 404 Not Found\nServer: ${scenario.domain}\n\nError: ENOENT: no such file '${canon}'`;
            }
        }

        this.stateManager.save();
        this.renderArena();
    }

    renderArena() {
        const tabsEl = document.getElementById('arena-tabs');
        const workspaceEl = document.getElementById('arena-workspace');
        const badgeEl = document.getElementById('arena-progress-badge');
        if (!tabsEl || !workspaceEl) return;

        const solvedTotal = this.arenaConfig.filter(s => this.stateManager.getArenaState(s).solved).length;
        if (badgeEl) {
            badgeEl.textContent = `${solvedTotal} / ${this.arenaConfig.length} Targets Compromised`;
        }

        tabsEl.innerHTML = this.arenaConfig.map((sc, idx) => {
            const unlocked = this.isArenaUnlocked(idx);
            const st = this.stateManager.getArenaState(sc);
            const isActive = idx === this.activeArenaIndex;

            let cardStyle = 'bg-slate-950/60 border-slate-800/70 opacity-60 cursor-not-allowed';
            if (unlocked && isActive) {
                cardStyle = 'bg-slate-950 border-rose-500/70 shadow-lg shadow-rose-500/10 cursor-pointer';
            } else if (unlocked) {
                cardStyle = 'bg-slate-950/90 hover:bg-slate-950 border-slate-800 cursor-pointer';
            }

            return `
        <button type="button" data-arena-idx="${idx}" class="arena-tab-btn text-left p-3.5 rounded-xl border transition-all ${cardStyle}">
          <div class="flex items-center justify-between mb-1">
            <span class="font-mono text-[10px] font-bold ${isActive ? 'text-rose-400' : 'text-slate-500'}">${sc.stage}</span>
            ${st.solved
                    ? '<span class="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300">PWNED</span>'
                    : unlocked
                        ? '<span class="px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyan-500/15 text-cyan-300">ACTIVE</span>'
                        : '<span class="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-800 text-slate-500">LOCKED</span>'}
          </div>
          <div class="text-xs font-bold text-slate-100">${escapeHtml(sc.name)}</div>
          <div class="text-[11px] font-mono text-slate-500 truncate mt-0.5">${escapeHtml(sc.domain)}</div>
        </button>
      `;
        }).join('');

        tabsEl.querySelectorAll('.arena-tab-btn').forEach(btn => {
            btn.onclick = () => {
                const idx = parseInt(btn.getAttribute('data-arena-idx'), 10);
                this.selectArenaScenario(idx);
            };
        });

        const activeSc = this.arenaConfig[this.activeArenaIndex];
        const activeSt = this.stateManager.getArenaState(activeSc);

        const statusBadgeClass = activeSt.lastStatus.startsWith('200')
            ? 'bg-emerald-500/20 text-emerald-300'
            : activeSt.lastStatus.startsWith('403')
                ? 'bg-rose-500/20 text-rose-300'
                : 'bg-slate-800 text-slate-300';

        workspaceEl.innerHTML = `
      <!-- Simulated Browser Chrome Top Bar -->
      <div class="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
          <span class="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
          <span class="ml-2 px-2.5 py-0.5 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300">
            https://${escapeHtml(activeSc.domain)}
          </span>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-[11px] font-mono text-slate-400">Attempts: <strong class="text-slate-200">${activeSt.attempts}</strong></span>
          <button id="arena-hint-btn" type="button" class="px-2.5 py-1 rounded text-[11px] font-mono bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors">
            ${activeSt.hintOpen ? 'Hide Recon Hint' : 'Recon Hint'}
          </button>
        </div>
      </div>

      <div class="p-4 sm:p-5 space-y-4">
        <!-- Mission Brief & Scope Box -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div class="lg:col-span-8 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div class="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold mb-1">Target Brief</div>
            <p class="text-xs text-slate-300 leading-relaxed">${escapeHtml(activeSc.missionText)}</p>
          </div>
          <div class="lg:col-span-4 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-[11px] space-y-1.5">
            <div><span class="text-slate-500">Web Root:</span> <span class="text-amber-300">${escapeHtml(activeSc.baseDir)}</span></div>
            <div><span class="text-slate-500">Target:</span> <span class="text-emerald-400">${escapeHtml(activeSc.targetFile)}</span></div>
          </div>
        </div>

        ${activeSt.hintOpen ? `
          <div class="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200/90 flex items-start gap-2">
            <span class="font-mono font-bold text-amber-400">[RECON]</span>
            <span>${escapeHtml(activeSc.hintText)}</span>
          </div>
        ` : ''}

        <!-- Free-Input Payload Bar (Zero Preset Buttons) -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div class="flex items-center bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 flex-1 focus-within:border-rose-500 transition-colors">
            <span class="text-xs font-mono font-bold text-rose-400 mr-2 select-none">${activeSc.method}</span>
            <span class="text-xs font-mono text-slate-400 select-none">${escapeHtml(activeSc.endpointPrefix)}</span>
            <input
              id="arena-payload-input"
              type="text"
              value="${escapeHtml(activeSt.lastInput)}"
              autocomplete="off"
              spellcheck="false"
              placeholder="Type your raw path payload..."
              class="bg-transparent border-none outline-none text-xs sm:text-sm font-mono text-white flex-1 min-w-0 ml-0.5"
            />
          </div>
          <button id="arena-submit-btn" type="button" class="px-5 py-2.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs sm:text-sm transition-colors shrink-0">
            Fire Request
          </button>
        </div>

        <!-- Simulated Server Response -->
        <div class="rounded-xl bg-slate-900/90 border border-slate-800 overflow-hidden">
          <div class="px-3.5 py-2 border-b border-slate-800 flex items-center justify-between">
            <span class="text-[11px] font-mono text-slate-400">Target HTTP Response</span>
            <span class="px-2 py-0.5 rounded font-mono text-[11px] font-bold ${statusBadgeClass}">${escapeHtml(activeSt.lastStatus)}</span>
          </div>
          <pre class="p-3.5 font-mono text-xs text-slate-200 whitespace-pre-wrap overflow-x-auto max-h-[180px] overflow-y-auto">${escapeHtml(activeSt.lastOutput)}</pre>
        </div>
      </div>
    `;

        const hintBtn = document.getElementById('arena-hint-btn');
        if (hintBtn) hintBtn.onclick = () => this.toggleArenaHint();

        const submitBtn = document.getElementById('arena-submit-btn');
        if (submitBtn) submitBtn.onclick = () => this.submitArenaPayload();

        const arenaInput = document.getElementById('arena-payload-input');
        if (arenaInput) {
            arenaInput.onkeydown = (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.submitArenaPayload();
                }
            };
        }
    }

    resetAllProgress() {
        this.stateManager.resetAllProgress(this.moduleConfig.labs);
        this.selectLab(this.activeLabIndex);
        this.renderArena();
        this.showToast('Progress Reset', 'All sandbox, quiz pool, and Bug Bounty Arena progress cleared.', 'cyan');
    }

    // ==========================================
    // BACKUP & RESTORE UTILITIES
    // ==========================================
    exportBackup() {
        const jsonStr = this.stateManager.exportStateJSON();
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `psa-companion-${this.moduleConfig.moduleMetadata.slug}-backup.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.showToast('Backup Exported', 'Progress downloaded as JSON file.', 'emerald');
    }

    importBackup(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const res = this.stateManager.importStateJSON(e.target.result, this.moduleConfig.labs);
            if (res.success) {
                this.selectLab(this.activeLabIndex);
                this.renderArena();
                this.showToast('Backup Restored', 'Progress loaded successfully from file.', 'emerald');
            } else {
                this.showToast('Import Failed', res.error, 'rose');
            }
        };
        reader.readAsText(file);
    }

    // ==========================================
    // TOAST NOTIFICATIONS
    // ==========================================
    showToast(title, msg, type = 'emerald') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const colors = type === 'emerald'
            ? 'border-emerald-500/50 bg-slate-900 text-emerald-300'
            : type === 'amber'
                ? 'border-amber-500/50 bg-slate-900 text-amber-300'
                : type === 'rose'
                    ? 'border-rose-500/50 bg-slate-900 text-rose-300'
                    : 'border-cyan-500/50 bg-slate-900 text-cyan-300';

        const toast = document.createElement('div');
        toast.className = `p-3.5 rounded-xl border shadow-2xl transition-all duration-300 transform translate-y-2 opacity-0 flex items-start gap-3 pointer-events-auto ${colors}`;
        toast.innerHTML = `
      <div class="mt-0.5 text-base">
        ${type === 'emerald' ? '✓' : type === 'rose' ? '✕' : type === 'amber' ? '⚠' : 'ℹ'}
      </div>
      <div class="flex-1">
        <div class="text-xs font-bold text-white">${escapeHtml(title)}</div>
        <div class="text-[11px] text-slate-300 mt-0.5 leading-snug">${escapeHtml(msg)}</div>
      </div>
    `;

        container.appendChild(toast);
        requestAnimationFrame(() => {
            toast.classList.remove('translate-y-2', 'opacity-0');
        });

        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-y-2');
            setTimeout(() => toast.remove(), 300);
        }, 4200);
    }
}

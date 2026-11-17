/**
 * PipelineTracer
 * Mutating packet animation engine across the 4-node processing pipeline.
 * Paced comfortably so learners can observe and read the payload mutation at each step.
 */

export class PipelineTracer {
    constructor() {
        this.animationTimer = null;
    }

    animate({ rawInput, lab, result }) {
        const packet = document.getElementById('traveling-packet');
        const stageTag = document.getElementById('packet-stage-tag');
        const payloadLabel = document.getElementById('packet-payload-label');

        if (!packet || !stageTag || !payloadLabel) return;

        const truncate = (s, n = 24) => (s && s.length > n ? s.slice(0, n) + '…' : (s || ''));

        const stages = [
            {
                nodeId: 'pipe-node-1',
                left: '11%',
                tag: '01 IN',
                text: truncate(rawInput, 22),
                style: 'border-cyan-400 text-cyan-300 bg-slate-900'
            },
            {
                nodeId: 'pipe-node-2',
                left: '37%',
                tag: result.blocked ? '02 BLOCK' : '02 CLEAN',
                text: result.blocked ? '403 Rejected' : truncate(result.steps[1]?.value, 22),
                style: result.blocked
                    ? 'border-rose-500 text-rose-300 bg-rose-950'
                    : 'border-amber-400 text-amber-300 bg-slate-900'
            },
            {
                nodeId: 'pipe-node-3',
                left: '63%',
                tag: '03 JOIN',
                text: result.blocked ? 'Halted' : truncate(result.joinedPath, 24),
                style: result.blocked
                    ? 'border-rose-500/60 text-rose-400 bg-slate-900'
                    : 'border-purple-400 text-purple-300 bg-slate-900'
            },
            {
                nodeId: 'pipe-node-4',
                left: '89%',
                tag: result.blocked ? '403' : (result.canonicalPath === '/etc/passwd' ? '200 HIT' : 'OS'),
                text: result.blocked ? 'Blocked' : truncate(result.canonicalPath, 22),
                style: result.blocked
                    ? 'border-rose-500 text-rose-300 bg-rose-950'
                    : result.canonicalPath === '/etc/passwd'
                        ? 'border-emerald-400 text-emerald-300 bg-emerald-950'
                        : 'border-cyan-400 text-cyan-300 bg-slate-900'
            }
        ];

        packet.style.opacity = '1';

        // Slowed down to 1250ms per node for comfortable reading
        const STEP_INTERVAL_MS = 1250;

        stages.forEach((st, idx) => {
            setTimeout(() => {
                packet.style.left = st.left;
                packet.className = `absolute top-0 -translate-x-1/2 z-20 px-2.5 py-1 rounded-md border font-mono text-[10px] font-bold shadow-xl whitespace-nowrap pointer-events-none flex items-center gap-1.5 ${st.style}`;
                stageTag.textContent = st.tag;
                payloadLabel.textContent = st.text;

                const nodeEl = document.getElementById(st.nodeId);
                if (nodeEl) {
                    nodeEl.classList.add('ring-2', 'ring-cyan-400', 'scale-[1.02]');
                    setTimeout(() => {
                        nodeEl.classList.remove('ring-2', 'ring-cyan-400', 'scale-[1.02]');
                    }, 1000);
                }
            }, idx * STEP_INTERVAL_MS);
        });
    }

    updateStaticNodes({ rawInput, result }) {
        const val1 = document.getElementById('pipe-val-1');
        const badge2 = document.getElementById('pipe-badge-2');
        const val2 = document.getElementById('pipe-val-2');
        const val3 = document.getElementById('pipe-val-3');
        const status4 = document.getElementById('pipe-status-4');
        const val4 = document.getElementById('pipe-val-4');

        if (val1) val1.textContent = `filename=${rawInput}`;
        if (badge2) {
            badge2.textContent = result.filterSummary;
            badge2.className = `text-[10px] font-mono px-1.5 rounded ${result.blocked ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-300'}`;
        }
        if (val2) val2.textContent = result.steps[1]?.value || 'Clean';
        if (val3) val3.textContent = result.joinedPath;
        if (status4) {
            if (result.blocked) {
                status4.textContent = '403 Forbidden';
                status4.className = 'text-[10px] font-mono px-1.5 rounded bg-rose-500/20 text-rose-300';
            } else if (result.canonicalPath === '/etc/passwd') {
                status4.textContent = '200 HIT /etc/passwd';
                status4.className = 'text-[10px] font-mono px-1.5 rounded bg-emerald-500/20 text-emerald-300 font-bold';
            } else {
                status4.textContent = '200 OK';
                status4.className = 'text-[10px] font-mono px-1.5 rounded bg-slate-800 text-slate-300';
            }
        }
        if (val4) val4.textContent = result.canonicalPath || 'None (Blocked)';
    }
}

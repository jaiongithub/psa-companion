/**
 * QuizEngine
 * Randomized 2-of-5 question gatekeeper quiz sampler and grading engine.
 */

export function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export class QuizEngine {
    constructor(stateManager) {
        this.stateManager = stateManager;
    }

    render(containerId, scoreLabelId, lab, onAnswer) {
        const container = document.getElementById(containerId);
        const scoreLabel = document.getElementById(scoreLabelId);
        if (!container) return;

        const prog = this.stateManager.getLabProgress(lab.id);
        const sampledIndices = this.stateManager.ensureLabQuizSample(lab);

        let passedCount = 0;
        sampledIndices.forEach(poolIdx => {
            if (prog.quizAnswers[poolIdx] === lab.quizPool[poolIdx].correctIndex) {
                passedCount++;
            }
        });

        if (scoreLabel) {
            scoreLabel.textContent = `${passedCount} / 2 Passed`;
        }

        container.innerHTML = sampledIndices.map((poolIdx, displayIdx) => {
            const q = lab.quizPool[poolIdx];
            const chosenIdx = prog.quizAnswers[poolIdx];
            const hasAnswered = chosenIdx !== undefined;
            const isCorrect = chosenIdx === q.correctIndex;

            const optionsHtml = q.options.map((opt, oIdx) => {
                let btnClass = 'bg-slate-950 hover:bg-slate-800/80 border-slate-800 text-slate-300';
                if (hasAnswered) {
                    if (oIdx === q.correctIndex) {
                        btnClass = 'bg-emerald-950/50 border-emerald-500/60 text-emerald-200 font-medium';
                    } else if (oIdx === chosenIdx) {
                        btnClass = 'bg-rose-950/50 border-rose-500/60 text-rose-200';
                    } else {
                        btnClass = 'bg-slate-950/50 border-slate-800/60 text-slate-500';
                    }
                }

                return `
          <button 
            type="button"
            data-pool-idx="${poolIdx}"
            data-option-idx="${oIdx}"
            class="quiz-option-btn w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-start gap-2.5 ${btnClass}"
          >
            <span class="font-mono font-bold text-slate-500 shrink-0">${String.fromCharCode(65 + oIdx)}.</span>
            <span>${escapeHtml(opt)}</span>
          </button>
        `;
            }).join('');

            return `
        <div class="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90">
          <div class="flex items-center justify-between gap-2 mb-2.5">
            <div class="text-xs font-semibold text-slate-100">
              <span class="font-mono text-purple-400 mr-1.5">Q${displayIdx + 1}.</span>${escapeHtml(q.question)}
            </div>
            <span class="text-[10px] font-mono text-slate-600 shrink-0">#${poolIdx + 1}/5</span>
          </div>
          <div class="space-y-2">
            ${optionsHtml}
          </div>
          ${hasAnswered ? `
            <div class="mt-3 p-2.5 rounded-lg text-[11px] leading-relaxed ${isCorrect ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'}">
              ${isCorrect ? q.explanation : 'Not quite — review the X-Ray trace above and try another option.'}
            </div>
          ` : ''}
        </div>
      `;
        }).join('');

        // Wire event listeners
        container.querySelectorAll('.quiz-option-btn').forEach(btn => {
            btn.onclick = (e) => {
                const pIdx = parseInt(btn.getAttribute('data-pool-idx'), 10);
                const oIdx = parseInt(btn.getAttribute('data-option-idx'), 10);
                if (typeof onAnswer === 'function') {
                    onAnswer(pIdx, oIdx);
                }
            };
        });
    }

    recordAnswer(lab, poolIdx, optionIdx) {
        const prog = this.stateManager.getLabProgress(lab.id);
        prog.quizAnswers[poolIdx] = optionIdx;
        this.stateManager.save();
        return this.stateManager.isLabQuizPassed(lab);
    }
}

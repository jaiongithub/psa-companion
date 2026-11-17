/**
 * StateManager
 * Namespaced localStorage persistence, JSON export/import, and quiz randomization tracker.
 */

export class StateManager {
    constructor(moduleSlug = 'path-traversal') {
        this.moduleSlug = moduleSlug;
        this.storageKey = `psa_companion_v1_${moduleSlug}`;
        this.state = {
            activeLabIndex: 0,
            activeArenaIndex: 0,
            exploreMode: false,
            hintVisible: false,
            fundamentalsOpen: true,
            progress: {},
            activeQuizIndices: {},
            arenaProgress: {}
        };
    }

    setModuleSlug(slug) {
        this.moduleSlug = slug;
        this.storageKey = `psa_companion_v1_${slug}`;
        this.load();
    }

    pickRandomTwoIndices(poolLength) {
        const indices = Array.from({ length: poolLength }, (_, i) => i);
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        return indices.slice(0, 2);
    }

    ensureLabQuizSample(lab) {
        if (!this.state.activeQuizIndices[lab.id] || this.state.activeQuizIndices[lab.id].length !== 2) {
            this.state.activeQuizIndices[lab.id] = this.pickRandomTwoIndices(lab.quizPool.length);
        }
        return this.state.activeQuizIndices[lab.id];
    }

    reshuffleLabQuiz(lab) {
        this.state.activeQuizIndices[lab.id] = this.pickRandomTwoIndices(lab.quizPool.length);
        const prog = this.getLabProgress(lab.id);
        prog.quizAnswers = {};
        this.save();
        return this.state.activeQuizIndices[lab.id];
    }

    load(labs = []) {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                this.state.progress = parsed.progress || {};
                this.state.exploreMode = Boolean(parsed.exploreMode);
                this.state.arenaProgress = parsed.arenaProgress || {};
            }
        } catch (e) {
            console.warn('Could not load saved state from localStorage:', e);
        }

        if (Array.isArray(labs) && labs.length > 0) {
            labs.forEach(lab => {
                this.state.activeQuizIndices[lab.id] = this.pickRandomTwoIndices(lab.quizPool.length);
            });
        }
    }

    save() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify({
                progress: this.state.progress,
                exploreMode: this.state.exploreMode,
                arenaProgress: this.state.arenaProgress
            }));
        } catch (e) {
            console.warn('Could not persist state to localStorage:', e);
        }
    }

    getLabProgress(labId) {
        if (!this.state.progress[labId]) {
            this.state.progress[labId] = {
                sandboxSolved: false,
                quizAnswers: {}
            };
        }
        return this.state.progress[labId];
    }

    isLabQuizPassed(lab) {
        const prog = this.getLabProgress(lab.id);
        const sampled = this.ensureLabQuizSample(lab);
        return sampled.every(poolIdx => prog.quizAnswers[poolIdx] === lab.quizPool[poolIdx].correctIndex);
    }

    isLabComplete(lab) {
        const prog = this.getLabProgress(lab.id);
        return prog.sandboxSolved && this.isLabQuizPassed(lab);
    }

    getArenaState(scenario) {
        if (!this.state.arenaProgress[scenario.id]) {
            const defaultPath = scenario.baseDir + scenario.defaultInput;
            const content = scenario.fs[defaultPath] || 'OK';
            this.state.arenaProgress[scenario.id] = {
                solved: false,
                attempts: 0,
                lastInput: scenario.defaultInput,
                lastStatus: '200 OK',
                lastOutput: `HTTP/1.1 200 OK\nServer: ${scenario.domain}\nX-Resolved-Path: ${defaultPath}\n\n${content}`,
                hintOpen: false
            };
        }
        return this.state.arenaProgress[scenario.id];
    }

    resetAllProgress(labs = []) {
        this.state.progress = {};
        this.state.arenaProgress = {};
        this.state.exploreMode = false;
        if (Array.isArray(labs)) {
            labs.forEach(lab => {
                this.state.activeQuizIndices[lab.id] = this.pickRandomTwoIndices(lab.quizPool.length);
            });
        }
        this.save();
    }

    exportStateJSON() {
        return JSON.stringify({
            moduleSlug: this.moduleSlug,
            exportedAt: new Date().toISOString(),
            data: {
                progress: this.state.progress,
                exploreMode: this.state.exploreMode,
                arenaProgress: this.state.arenaProgress
            }
        }, null, 2);
    }

    importStateJSON(jsonString, labs = []) {
        try {
            const parsed = JSON.parse(jsonString);
            const data = parsed.data || parsed;
            this.state.progress = data.progress || {};
            this.state.exploreMode = Boolean(data.exploreMode);
            this.state.arenaProgress = data.arenaProgress || {};
            if (Array.isArray(labs)) {
                labs.forEach(lab => {
                    this.state.activeQuizIndices[lab.id] = this.pickRandomTwoIndices(lab.quizPool.length);
                });
            }
            this.save();
            return { success: true };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }
}

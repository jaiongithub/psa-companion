/**
 * Router
 * Lightweight URL query router for zero-backend static hosting.
 */

export class Router {
    constructor() {
        this.listeners = [];
        window.addEventListener('popstate', () => this.handlePopState());
    }

    getQueryParams() {
        const params = new URLSearchParams(window.location.search);
        return {
            module: params.get('module') || 'path-traversal',
            lab: parseInt(params.get('lab') || '1', 10)
        };
    }

    setRoute(moduleSlug, labIndex, replace = false) {
        const url = new URL(window.location.href);
        url.searchParams.set('module', moduleSlug);
        url.searchParams.set('lab', (labIndex + 1).toString());

        if (replace) {
            window.history.replaceState({ module: moduleSlug, lab: labIndex + 1 }, '', url.toString());
        } else {
            window.history.pushState({ module: moduleSlug, lab: labIndex + 1 }, '', url.toString());
        }
    }

    onNavigate(callback) {
        this.listeners.push(callback);
    }

    handlePopState() {
        const route = this.getQueryParams();
        this.listeners.forEach(cb => cb(route));
    }
}

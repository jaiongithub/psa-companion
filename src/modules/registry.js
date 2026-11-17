/**
 * Master Registry of Vulnerability Modules
 * All modules are named strictly by vulnerability domain without sequential numbering.
 */
import { moduleMetadata as pathTraversalMeta, fundamentals as pathTraversalFundamentals, labs as pathTraversalLabs } from './path-traversal/module.config.js';
import { arenaScenarios as pathTraversalArena } from './path-traversal/arena.config.js';

export const MODULE_REGISTRY = {
    'path-traversal': {
        metadata: pathTraversalMeta,
        fundamentals: pathTraversalFundamentals,
        labs: pathTraversalLabs,
        arena: pathTraversalArena,
        motionGraphicType: 'confinement-boundary',
        status: 'available'
    },
    'sql-injection': {
        metadata: {
            slug: 'sql-injection',
            name: 'SQL Injection',
            tagline: 'Database manipulation, UNION extraction, blind time-delays & out-of-band exfiltration',
            category: 'Server-Side Vulnerabilities',
            difficulty: 'PRACTITIONER',
            labCount: 18,
        },
        motionGraphicType: 'ast-context-breakout',
        status: 'planned'
    },
    'xss': {
        metadata: {
            slug: 'xss',
            name: 'Cross-Site Scripting (XSS)',
            tagline: 'DOM, reflected, and stored JavaScript execution contexts & CSP bypasses',
            category: 'Client-Side Vulnerabilities',
            difficulty: 'PRACTITIONER',
            labCount: 30,
        },
        motionGraphicType: 'ast-context-breakout',
        status: 'planned'
    },
    'ssrf': {
        metadata: {
            slug: 'ssrf',
            name: 'Server-Side Request Forgery',
            tagline: 'Internal service pivoting, cloud metadata exfiltration & whitelist bypasses',
            category: 'Server-Side Vulnerabilities',
            difficulty: 'PRACTITIONER',
            labCount: 7,
        },
        motionGraphicType: 'confinement-boundary',
        status: 'planned'
    },
    'csrf': {
        metadata: {
            slug: 'csrf',
            name: 'Cross-Site Request Forgery',
            tagline: 'Token validation flaws, SameSite cookie mechanics & referrer validation',
            category: 'Client-Side Vulnerabilities',
            difficulty: 'APPRENTICE',
            labCount: 8,
        },
        motionGraphicType: 'parser-differential',
        status: 'planned'
    }
};

export function getModule(slug) {
    return MODULE_REGISTRY[slug] || null;
}

export function getAllModules() {
    return Object.values(MODULE_REGISTRY);
}

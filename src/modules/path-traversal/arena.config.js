/**
 * Bug Bounty Arena Configuration: Directory & Path Traversal
 * Contains 3 progressive real-world simulation targets with raw input evaluation.
 */
import { safeUrlDecode, resolvePosixPath } from '../../engines/posix-vfs-engine.js';

export const arenaScenarios = [
    {
        id: 'arena-1',
        stage: 'STAGE 01',
        name: 'ShopStream Media CDN',
        domain: 'cdn.shopstream.internal',
        method: 'GET',
        endpointPrefix: '/api/cdn/asset?file=',
        defaultInput: 'hero-sneaker.webp',
        baseDir: '/srv/shopstream/public/assets/',
        targetFile: '/srv/shopstream/config/database.yml',
        missionText: 'You are auditing an e-commerce media CDN endpoint. Escape the public assets directory and exfiltrate the application database configuration at /srv/shopstream/config/database.yml.',
        hintText: 'Notice the base directory is /srv/shopstream/public/assets/ (one level inside /srv/shopstream/). Traverse up two levels into config/database.yml.',
        fs: {
            '/srv/shopstream/public/assets/hero-sneaker.webp': '[BINARY WEBP IMAGE: 42.8 KB - ShopStream Product Asset]',
            '/srv/shopstream/config/database.yml': 'production:\n  adapter: postgresql\n  host: db-prod.shopstream.internal\n  username: shop_admin\n  password: <REDACTED_SECRET_TOKEN>',
            '/etc/passwd': 'root:x:0:0:root:/root:/bin/bash\nshopstream:x:1001:1001::/srv/shopstream:/bin/sh'
        },
        evaluate: (rawInput) => {
            const decoded = safeUrlDecode(rawInput);
            const joined = '/srv/shopstream/public/assets/' + decoded;
            const { canonical } = resolvePosixPath(joined);
            return { blocked: false, canonical };
        }
    },
    {
        id: 'arena-2',
        stage: 'STAGE 02',
        name: 'FinVault Invoice Portal',
        domain: 'portal.finvault.internal',
        method: 'POST',
        endpointPrefix: '/download/statement?path=',
        defaultInput: 'statements/2026/october.pdf',
        baseDir: '/var/finvault/data/',
        targetFile: '/var/finvault/secrets/audit_master.key',
        missionText: 'FinVault enforces that the path parameter must start with "statements/" and strips "../" once. Escape the statements folder to read /var/finvault/secrets/audit_master.key.',
        hintText: 'Preserve the required "statements/" prefix at the start, then use nested traversal tokens (e.g., "....//") so a single-pass strip leaves valid "../" segments.',
        fs: {
            '/var/finvault/data/statements/2026/october.pdf': '%PDF-1.7 FinVault Monthly Account Statement (Acct #8841)',
            '/var/finvault/secrets/audit_master.key': '-----BEGIN FINVAULT AUDIT MASTER KEY-----\nFV-KEY-9948-2026-ALPHA-CONFIDENTIAL\n-----END FINVAULT AUDIT MASTER KEY-----'
        },
        evaluate: (rawInput) => {
            const decoded = safeUrlDecode(rawInput);
            if (!decoded.startsWith('statements/')) {
                return {
                    blocked: true,
                    canonical: null,
                    reason: '403 Forbidden: Parameter "path" must begin with the "statements/" prefix.'
                };
            }
            const sanitized = decoded.replace(/\.\.\//g, '').replace(/\.\.\\/g, '');
            const joined = '/var/finvault/data/' + sanitized;
            const { canonical } = resolvePosixPath(joined);
            return { blocked: false, canonical };
        }
    },
    {
        id: 'arena-3',
        stage: 'STAGE 03',
        name: 'CloudDocs Legacy Exporter',
        domain: 'legacy.clouddocs.internal',
        method: 'GET',
        endpointPrefix: '/export/report?doc=',
        defaultInput: 'q3-summary.pdf',
        baseDir: '/opt/clouddocs/reports/',
        targetFile: '/opt/clouddocs/.env',
        missionText: 'This legacy C-backed exporter enforces that "doc" ends with ".pdf" before passing the string to a C file-open syscall. Exfiltrate /opt/clouddocs/.env.',
        hintText: 'Traverse one directory up from /opt/clouddocs/reports/ to .env, and terminate the C string early with a URL-encoded null byte (%00) before ".pdf".',
        fs: {
            '/opt/clouddocs/reports/q3-summary.pdf': '%PDF-1.5 CloudDocs Q3 Executive Summary Report',
            '/opt/clouddocs/.env': 'APP_ENV=production\nJWT_SIGNING_SECRET=cd_live_98a7f6e5d4c3b2a1\nAWS_BUCKET=clouddocs-private-vault'
        },
        evaluate: (rawInput) => {
            const decoded = safeUrlDecode(rawInput);
            if (!decoded.endsWith('.pdf')) {
                return {
                    blocked: true,
                    canonical: null,
                    reason: '403 Forbidden: Legacy exporter only accepts documents ending in ".pdf".'
                };
            }
            const nullIdx = decoded.indexOf('\0');
            const cStr = nullIdx !== -1 ? decoded.slice(0, nullIdx) : decoded;
            const joined = '/opt/clouddocs/reports/' + cStr;
            const { canonical } = resolvePosixPath(joined);
            return { blocked: false, canonical };
        }
    }
];

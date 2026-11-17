/**
 * PosixVirtualFS Engine
 * Virtual Linux/POSIX filesystem tree and path normalization simulator.
 */

export const VIRTUAL_FS = {
    '/var/www/images/218.png': {
        type: 'image/png',
        content: '[BINARY PNG DATA: 14,820 bytes - Product Thumbnail #218]'
    },
    '/var/www/html/index.php': {
        type: 'text/plain',
        content: '<?php\n// Shop front controller\nrequire_once __DIR__ . "/../config/db.php";\necho "<h1>Welcome to CyberShop</h1>";\n?>'
    },
    '/etc/passwd': {
        type: 'text/plain',
        content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\nacademy:x:1001:1001:PortSwigger Lab User:/home/academy:/bin/bash'
    },
    '/etc/hosts': {
        type: 'text/plain',
        content: '127.0.0.1\tlocalhost\n127.0.1.1\tweb-academy-lab.internal\n::1\t\tlocalhost ip6-localhost ip6-loopback'
    },
    '/root/.ssh/id_rsa': {
        type: 'text/plain',
        content: '-----BEGIN OPENSSH PRIVATE KEY-----\nb3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW\n[REDACTED SIMULATION KEY MATERIAL]\n-----END OPENSSH PRIVATE KEY-----'
    }
};

export const VFS_DIRECTORIES = [
    '/',
    '/var',
    '/var/www',
    '/var/www/images',
    '/var/www/html',
    '/etc',
    '/root',
    '/root/.ssh'
];

export const DEFAULT_VFS_TREE_NODES = [
    { path: '/', depth: 0, label: '/', isDir: true },
    { path: '/var/www/images', depth: 1, label: 'var/www/images/', isDir: true, base: true },
    { path: '/var/www/images/218.png', depth: 2, label: '218.png', isDir: false },
    { path: '/var/www/html', depth: 1, label: 'var/www/html/', isDir: true },
    { path: '/var/www/html/index.php', depth: 2, label: 'index.php', isDir: false },
    { path: '/etc', depth: 1, label: 'etc/', isDir: true },
    { path: '/etc/passwd', depth: 2, label: 'passwd', isDir: false, target: true },
    { path: '/etc/hosts', depth: 2, label: 'hosts', isDir: false },
    { path: '/root/.ssh/id_rsa', depth: 1, label: 'root/.ssh/id_rsa', isDir: false }
];

export function safeUrlDecode(str) {
    try {
        return decodeURIComponent(str);
    } catch (e) {
        return str.replace(/%([0-9A-Fa-f]{2})/g, (_, hex) =>
            String.fromCharCode(parseInt(hex, 16))
        );
    }
}

export function resolvePosixPath(inputPath) {
    const normalizedSlashes = inputPath.replace(/\\/g, '/');
    const rawParts = normalizedSlashes.split('/');
    const stack = [];
    const traversalSteps = [];

    for (const part of rawParts) {
        if (!part || part === '.') continue;
        if (part === '..') {
            if (stack.length > 0) stack.pop();
        } else {
            stack.push(part);
        }
        traversalSteps.push({
            token: part,
            current: '/' + stack.join('/')
        });
    }

    const canonical = '/' + stack.join('/');
    return { canonical, traversalSteps };
}

export class PosixVirtualFS {
    constructor(customFs = VIRTUAL_FS, directories = VFS_DIRECTORIES) {
        this.fs = { ...customFs };
        this.directories = [...directories];
    }

    readFile(path) {
        const entry = this.fs[path];
        if (!entry) return null;
        return entry.content;
    }

    exists(path) {
        return Boolean(this.fs[path] || this.directories.includes(path));
    }

    isDirectory(path) {
        return this.directories.includes(path);
    }

    resolve(baseDir, userInput) {
        let joined;
        if (userInput.startsWith('/')) {
            joined = userInput;
        } else {
            joined = (baseDir.endsWith('/') ? baseDir : baseDir + '/') + userInput;
        }
        return resolvePosixPath(joined);
    }
}

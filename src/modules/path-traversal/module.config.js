/**
 * Path Traversal Module Configuration
 * Domain: Directory & Path Traversal
 * Contains 6 sequentially numbered PortSwigger Academy labs with illustrative backend models and quiz questions.
 */
import { safeUrlDecode, resolvePosixPath } from '../../engines/posix-vfs-engine.js';

export const moduleMetadata = {
    slug: 'path-traversal',
    name: 'Directory & Path Traversal',
    tagline: 'Arbitrary filesystem access vulnerabilities & path canonicalization flaws',
    category: 'Server-Side Vulnerabilities',
    difficulty: 'PRACTITIONER',
    labCount: 6,
    commonMission: {
        title: 'Common Mission Objective',
        badge: 'ALL LABS',
        description: 'Escape the confined web root <code class="text-amber-300 bg-slate-950 px-1.5 py-0.5 rounded">/var/www/images/</code> and read the target POSIX file:',
        targetPath: '/etc/passwd',
        targetLabel: 'POSIX TARGET'
    }
};

export const fundamentals = {
    title: 'Fundamentals & Normal Behavior',
    subtitle: 'Core concepts, practical examples, and real-world analogies',
    pillars: [
        {
            number: '01',
            title: 'What is Path Traversal?',
            color: 'text-sky-400',
            description: 'A flaw where a website accepts filenames from users (like <code class="text-slate-200">?file=report.pdf</code>) and opens them directly from disk. If the server doesn\'t restrict the path, an attacker can look outside the intended folder and read sensitive operating system files.'
        },
        {
            number: '02',
            title: 'The Filing Cabinet Analogy',
            color: 'text-emerald-400',
            description: 'Imagine asking an office clerk for a file inside a cabinet labeled <em>Public Brochures</em>. If you ask for <em>"../../Confidential/Payroll.xlsx"</em>, a careless clerk follows the instructions, steps out of the brochure cabinet, and hands you private payroll records.'
        },
        {
            number: '03',
            title: 'Why Does It Happen?',
            color: 'text-amber-400',
            description: 'Developers often join user input directly to a base folder path using string addition (<code class="text-slate-200">base + input</code>). Because the operating system interprets <code class="text-slate-200">../</code> as "step up to the parent directory", each pair climbs one directory higher toward the system root.'
        }
    ]
};

export const labs = [
    {
        id: 'lab-1',
        number: '01',
        level: 'APPRENTICE',
        title: 'File path traversal, simple case',
        wsaUrl: 'https://portswigger.net/web-security/file-path-traversal/lab-simple',
        filterBadge: 'NO FILTER',
        backendFile: 'image_loader.py',
        bullets: [
            'The server appends the user-supplied <code>filename</code> directly onto <code>/var/www/images/</code> without any filtering.',
            'In operating systems, <code>../</code> tells the filesystem to step up one directory level.',
            'Repeating <code>../</code> three times climbs out of <code>/var/www/images/</code> to the root <code>/</code>, granting access to <code>/etc/passwd</code>.'
        ],
        hint: 'The web folder is 3 levels deep (/var/www/images/). Supply three "../" segments to reach the root, then specify etc/passwd.',
        probes: [
            { label: '218.png', value: '218.png' },
            { label: '../', value: '../' },
            { label: '../html/index.php', value: '../html/index.php' },
            { label: '⚡ ../../../etc/passwd', value: '../../../etc/passwd', isExploit: true }
        ],
        codeLines: [
            { num: 1, code: 'def get_image(request):', active: true },
            { num: 2, code: '    filename = url_decode(request.args.get("filename"))', active: true },
            { num: 3, code: '    # Direct string concatenation without path verification', active: false, comment: true },
            { num: 4, code: '    full_path = "/var/www/images/" + filename', active: true },
            { num: 5, code: '    return os_read_file(full_path)', active: true }
        ],
        simulate: (rawInput) => {
            const decoded = safeUrlDecode(rawInput);
            const joined = '/var/www/images/' + decoded;
            const { canonical, traversalSteps } = resolvePosixPath(joined);

            return {
                steps: [
                    { label: '1. Decoded Input', value: decoded, highlight: decoded !== rawInput },
                    { label: '2. Filter Check', value: 'None (Direct pass-through)', status: 'bypassed' },
                    { label: '3. Concatenated Path', value: joined, highlight: true },
                    { label: '4. Canonical OS Path', value: canonical, isTarget: canonical === '/etc/passwd' }
                ],
                filterSummary: 'NO FILTER',
                joinedPath: joined,
                canonicalPath: canonical,
                traversalSteps,
                activeLines: [1, 2, 4, 5],
                blocked: false
            };
        },
        quizPool: [
            {
                question: 'Why does /var/www/images/../../../etc/passwd resolve to /etc/passwd?',
                options: [
                    'The web server automatically redirects unknown images to /etc/',
                    'Each "../" steps up one directory (images -> www -> var -> /)',
                    'The plus (+) operator strips /var/www/images/ when a dot is present'
                ],
                correctIndex: 1,
                explanation: 'Correct! Three "../" segments step up out of images, www, and var, landing directly at the root directory "/".'
            },
            {
                question: 'What happens in POSIX if you include extra "../" segments beyond root (e.g., 6 levels up)?',
                options: [
                    'The OS throws a segmentation fault and crashes',
                    'The request is rejected with HTTP 400 Bad Request',
                    'Root "/" is its own parent, so extra "../" safely stay at "/"'
                ],
                correctIndex: 2,
                explanation: 'Correct! In Unix/Linux, "/.." resolves to "/", making extra "../" sequences reliable when directory depth is unknown.'
            },
            {
                question: 'Which HTTP error code typically indicates your traversal path landed on a directory rather than a file?',
                options: [
                    'HTTP 500 Internal Server Error (EISDIR: illegal operation on a directory)',
                    'HTTP 201 Created',
                    'HTTP 304 Not Modified'
                ],
                correctIndex: 0,
                explanation: 'Correct! Trying to read a directory with a file-read syscall raises EISDIR, commonly surfacing as a 500 error.'
            },
            {
                question: 'What is the most reliable programmatic fix against basic directory traversal?',
                options: [
                    'Hide the filename parameter inside a POST body',
                    'Resolve the canonical realpath and verify it starts with the intended base directory',
                    'Replace spaces with underscores'
                ],
                correctIndex: 1,
                explanation: 'Correct! Canonicalization collapses all ".." segments first so you can assert the final path stays inside the base directory.'
            },
            {
                question: 'Why do web applications often use a parameter like ?filename=218.png instead of direct static URLs?',
                options: [
                    'To enforce access control, logging, or dynamic storage lookups before streaming file bytes',
                    'Because HTML <img> tags cannot load PNG files directly',
                    'To prevent search engines from indexing images'
                ],
                correctIndex: 0,
                explanation: 'Correct! Applications often route file reads through backend handlers to check permissions or fetch from private storage.'
            }
        ]
    },

    {
        id: 'lab-2',
        number: '02',
        level: 'PRACTITIONER',
        title: 'File path traversal, traversal sequences blocked with absolute path bypass',
        wsaUrl: 'https://portswigger.net/web-security/file-path-traversal/lab-absolute-path-bypass',
        filterBadge: 'BLOCKS ../',
        backendFile: 'image_loader.js',
        bullets: [
            'The application checks for and blocks any input containing <code>../</code> or <code>..\\</code>.',
            'However, it neglects to check whether the input begins with a leading slash <code>/</code> (an absolute path).',
            'Many standard filesystem functions discard the base directory whenever an absolute path is provided.'
        ],
        hint: 'Since "../" is blocked, avoid relative climbing. Pass a full absolute path starting with a leading slash "/".',
        probes: [
            { label: '218.png', value: '218.png' },
            { label: '../etc/passwd', value: '../etc/passwd' },
            { label: '/var/www/images/218.png', value: '/var/www/images/218.png' },
            { label: '⚡ /etc/passwd', value: '/etc/passwd', isExploit: true }
        ],
        codeLines: [
            { num: 1, code: 'function getImage(req, res) {', active: true },
            { num: 2, code: '  const filename = decodeURIComponent(req.query.filename);', active: true },
            { num: 3, code: '  if (filename.includes("../") || filename.includes("..\\\\")) {', active: true },
            { num: 4, code: '    return res.status(403).send("Blocked: Traversal sequence detected");', active: false },
            { num: 5, code: '  }', active: true },
            { num: 6, code: '  // path.resolve resets to root if filename starts with a leading "/"', active: false, comment: true },
            { num: 7, code: '  const fullPath = path.resolve("/var/www/images/", filename);', active: true },
            { num: 8, code: '  return fs.readFileSync(fullPath);', active: true }
        ],
        simulate: (rawInput) => {
            const decoded = safeUrlDecode(rawInput);
            const hasTraversal = decoded.includes('../') || decoded.includes('..\\');

            if (hasTraversal) {
                return {
                    steps: [
                        { label: '1. Decoded Input', value: decoded },
                        { label: '2. Sequence Check', value: 'BLOCKED: Contains "../" pattern', status: 'blocked' },
                        { label: '3. Concatenated Path', value: 'Execution halted at Line 4' },
                        { label: '4. Canonical OS Path', value: 'N/A (HTTP 403 Forbidden)' }
                    ],
                    filterSummary: 'BLOCKED (../)',
                    joinedPath: 'BLOCKED',
                    canonicalPath: null,
                    traversalSteps: [],
                    activeLines: [1, 2, 3, 4],
                    blocked: true,
                    blockReason: 'HTTP 403 Forbidden: Traversal sequence "../" detected by application filter.'
                };
            }

            const joined = decoded.startsWith('/') ? decoded : '/var/www/images/' + decoded;
            const { canonical, traversalSteps } = resolvePosixPath(joined);

            return {
                steps: [
                    { label: '1. Decoded Input', value: decoded },
                    { label: '2. Sequence Check', value: 'PASSED (No "../" found)', status: 'bypassed' },
                    { label: '3. Resolved Path', value: joined, highlight: decoded.startsWith('/') },
                    { label: '4. Canonical OS Path', value: canonical, isTarget: canonical === '/etc/passwd' }
                ],
                filterSummary: 'PASSED (NO ../)',
                joinedPath: joined,
                canonicalPath: canonical,
                traversalSteps,
                activeLines: [1, 2, 3, 5, 7, 8],
                blocked: false
            };
        },
        quizPool: [
            {
                question: 'Why does path.resolve("/var/www/images/", "/etc/passwd") ignore /var/www/images/?',
                options: [
                    'Because /etc/passwd has no file extension',
                    'In path resolution APIs, a leading "/" resets the path directly to root',
                    'The web server automatically strips the base folder on errors'
                ],
                correctIndex: 1,
                explanation: 'Correct! Standard path resolve helpers treat any argument starting with "/" as an absolute root path, discarding prior base segments.'
            },
            {
                question: 'How should developers properly defend against both relative and absolute path injection?',
                options: [
                    'Block both "../" and leading "/" using regex',
                    'Canonicalize the final path and verify it starts with the intended base directory "/var/www/images/"',
                    'Convert the filename to lowercase before opening'
                ],
                correctIndex: 1,
                explanation: 'Correct! Resolving the canonical realpath and asserting `canonicalPath.startsWith("/var/www/images/")` defeats all traversal tricks.'
            },
            {
                question: 'Why do blacklist filters (like blocking "../") frequently fail in web security?',
                options: [
                    'Blacklists only work on Linux servers',
                    'Attackers can use alternative path representations (like absolute paths or encodings) not anticipated by the blocklist',
                    'Blacklists slow down database queries'
                ],
                correctIndex: 1,
                explanation: 'Correct! Denylists fail whenever an input achieves the same OS behavior without matching the exact blocked substring.'
            },
            {
                question: 'In Python, what does os.path.join("/var/www/images/", "/etc/hosts") return?',
                options: [
                    '"/var/www/images/etc/hosts"',
                    '"/etc/hosts" (any component starting with "/" discards all previous components)',
                    'It raises a ValueError exception'
                ],
                correctIndex: 1,
                explanation: 'Correct! Python’s os.path.join exhibits the exact same root-reset behavior when an argument begins with "/".'
            },
            {
                question: 'What safe design pattern avoids user-controlled filesystem paths altogether?',
                options: [
                    'Mapping opaque IDs (e.g., ?image_id=218) to hardcoded filenames in a database or lookup table',
                    'Base64-encoding the file path in the URL',
                    'Using HTTP POST instead of GET'
                ],
                correctIndex: 0,
                explanation: 'Correct! Indirection via opaque database IDs eliminates user-supplied path strings from ever reaching filesystem APIs.'
            }
        ]
    },

    {
        id: 'lab-3',
        number: '03',
        level: 'PRACTITIONER',
        title: 'File path traversal, traversal sequences stripped non-recursively',
        wsaUrl: 'https://portswigger.net/web-security/file-path-traversal/lab-sequences-stripped-non-recursively',
        filterBadge: 'STRIP ../ (1x)',
        backendFile: 'sanitize.php',
        bullets: [
            'Instead of blocking, the server attempts to clean input by stripping <code>../</code> once (single pass).',
            'Because the strip only runs once, nested patterns like <code>....//</code> collapse into valid <code>../</code> sequences.',
            'Wrapping a traversal token inside another leaves an intact <code>../</code> after the inner part is deleted.'
        ],
        hint: 'If the server deletes "../" once from the middle of a nested sequence, the outer characters collapse together into "../".',
        probes: [
            { label: '218.png', value: '218.png' },
            { label: '../etc/passwd', value: '../etc/passwd' },
            { label: '....//etc/hosts', value: '....//etc/hosts' },
            { label: '⚡ ....//....//....//etc/passwd', value: '....//....//....//etc/passwd', isExploit: true }
        ],
        codeLines: [
            { num: 1, code: '<?php', active: true },
            { num: 2, code: '$raw = urldecode($_GET["filename"]);', active: true },
            { num: 3, code: '// Single-pass non-recursive string removal flaw', active: false, comment: true },
            { num: 4, code: '$sanitized = str_replace("../", "", $raw);', active: true },
            { num: 5, code: '$path = "/var/www/images/" . $sanitized;', active: true },
            { num: 6, code: 'readfile($path);', active: true }
        ],
        simulate: (rawInput) => {
            const decoded = safeUrlDecode(rawInput);
            const sanitized = decoded.replace(/\.\.\//g, '').replace(/\.\.\\/g, '');
            const joined = '/var/www/images/' + sanitized;
            const { canonical, traversalSteps } = resolvePosixPath(joined);

            return {
                steps: [
                    { label: '1. Decoded Input', value: decoded },
                    { label: '2. After str_replace()', value: sanitized, highlight: sanitized !== decoded, status: sanitized.includes('../') ? 'bypassed' : 'neutral' },
                    { label: '3. Concatenated Path', value: joined },
                    { label: '4. Canonical OS Path', value: canonical, isTarget: canonical === '/etc/passwd' }
                ],
                filterSummary: sanitized !== decoded ? 'STRIPPED (1 PASS)' : 'NO CHANGE',
                joinedPath: joined,
                canonicalPath: canonical,
                traversalSteps,
                activeLines: [1, 2, 4, 5, 6],
                blocked: false
            };
        },
        quizPool: [
            {
                question: 'What does a single-pass replace("../", "") turn "....//" into?',
                options: [
                    'An empty string ""',
                    '"../" (the middle "../" is removed, joining the remaining ".." and "/")',
                    '"...."'
                ],
                correctIndex: 1,
                explanation: 'Correct! In "....//", indices 2..4 form "../". Removing those 3 characters leaves indices 0..1 ("..") + index 5 ("/") = "../".'
            },
            {
                question: 'Would "..././" also bypass a single-pass replace("../", "") filter?',
                options: [
                    'Yes — removing the inner "../" leaves ".." + "/" = "../"',
                    'No — dots cannot be separated by slashes',
                    'Only on Windows servers'
                ],
                correctIndex: 0,
                explanation: 'Correct! Both "....//" and "..././" collapse into "../" after a single non-recursive strip.'
            },
            {
                question: 'Why is mutating/sanitizing user input generally riskier than rejecting invalid input?',
                options: [
                    'String replacement uses too much CPU',
                    'Sanitization can inadvertently construct dangerous character sequences that were not present in the original input',
                    'PHP does not support string replacement'
                ],
                correctIndex: 1,
                explanation: 'Correct! Modifying input in place often creates new attack payloads once the stripped characters are removed.'
            },
            {
                question: 'What happens if a developer loops str_replace("../", "") until no "../" remains, instead of canonicalizing?',
                options: [
                    'It becomes 100% immune to all file inclusion bugs',
                    'It can still fail against alternate encodings or platform-specific separators like "..\\"',
                    'The loop will always run infinitely'
                ],
                correctIndex: 1,
                explanation: 'Correct! Even recursive stripping fails when alternate path separators or double-decoding flaws exist.'
            },
            {
                question: 'In the X-Ray trace, how can you tell your nested payload bypassed the single-pass sanitizer?',
                options: [
                    'Step 2 shows "../" re-emerging in the sanitized output string',
                    'Step 1 shows a 404 status',
                    'The backend filename changes to index.php'
                ],
                correctIndex: 0,
                explanation: 'Correct! Watching Step 2 confirm the collapsed "../" proves the sanitizer reconstructed the traversal token.'
            }
        ]
    },

    {
        id: 'lab-4',
        number: '04',
        level: 'PRACTITIONER',
        title: 'File path traversal, traversal sequences stripped with superfluous URL-decode',
        wsaUrl: 'https://portswigger.net/web-security/file-path-traversal/lab-sequences-stripped-with-superfluous-url-decode',
        filterBadge: 'DOUBLE DECODE',
        backendFile: 'gateway_filter.java',
        bullets: [
            'The web server URL-decodes the query parameter once before checking for <code>../</code>.',
            'After the security check passes, the application executes a <strong>second URL-decode</strong> before opening the file.',
            'Double-encoding special characters hides the payload during Pass 1 and restores <code>../</code> during Pass 2.'
        ],
        hint: 'The server decodes %25 into % on Pass 1. Double-encode dots (%252e) and slashes (%252f) so Pass 2 reveals "../".',
        probes: [
            { label: '218.png', value: '218.png' },
            { label: '%2e%2e%2fetc/hosts', value: '%2e%2e%2fetc/hosts' },
            { label: '%252e%252e%252f%252e%252e%252f%252e%252e%252fetc/hosts', value: '%252e%252e%252f%252e%252e%252f%252e%252e%252fetc/hosts' },
            { label: '⚡ %252e%252e%252f%252e%252e%252f%252e%252e%252fetc/passwd', value: '%252e%252e%252f%252e%252e%252f%252e%252e%252fetc/passwd', isExploit: true }
        ],
        codeLines: [
            { num: 1, code: 'String serverDecoded = webServer.urlDecode(rawParam); // Pass 1', active: true },
            { num: 2, code: 'if (serverDecoded.contains("../")) {', active: true },
            { num: 3, code: '    throw new SecurityException("403: Traversal blocked");', active: false },
            { num: 4, code: '}', active: true },
            { num: 5, code: '// Redundant second URL-decode after validation check', active: false, comment: true },
            { num: 6, code: 'String appDecoded = URLDecoder.decode(serverDecoded, "UTF-8"); // Pass 2', active: true },
            { num: 7, code: 'return Files.readString(Paths.get("/var/www/images/" + appDecoded));', active: true }
        ],
        simulate: (rawInput) => {
            const pass1 = safeUrlDecode(rawInput);
            if (pass1.includes('../') || pass1.includes('..\\')) {
                return {
                    steps: [
                        { label: '1. Server Decode (Pass 1)', value: pass1 },
                        { label: '2. WAF Traversal Check', value: 'BLOCKED: Pass 1 contains "../"', status: 'blocked' },
                        { label: '3. App Decode (Pass 2)', value: 'Execution halted at Line 3' },
                        { label: '4. Canonical OS Path', value: 'N/A (HTTP 403 Forbidden)' }
                    ],
                    filterSummary: 'BLOCKED AT PASS 1',
                    joinedPath: 'BLOCKED',
                    canonicalPath: null,
                    traversalSteps: [],
                    activeLines: [1, 2, 3],
                    blocked: true,
                    blockReason: 'HTTP 403 Forbidden: WAF detected "../" after initial web server URL-decoding.'
                };
            }

            const pass2 = safeUrlDecode(pass1);
            const joined = '/var/www/images/' + pass2;
            const { canonical, traversalSteps } = resolvePosixPath(joined);

            return {
                steps: [
                    { label: '1. Server Decode (Pass 1)', value: pass1, highlight: pass1 !== rawInput },
                    { label: '2. WAF Traversal Check', value: 'PASSED (No literal "../" yet)', status: pass2.includes('../') ? 'bypassed' : 'neutral' },
                    { label: '3. App Decode (Pass 2)', value: pass2, highlight: pass2 !== pass1 },
                    { label: '4. Canonical OS Path', value: canonical, isTarget: canonical === '/etc/passwd' }
                ],
                filterSummary: pass2 !== pass1 ? '2X URL DECODED' : 'PASSED',
                joinedPath: joined,
                canonicalPath: canonical,
                traversalSteps,
                activeLines: [1, 2, 4, 6, 7],
                blocked: false
            };
        },
        quizPool: [
            {
                question: 'Why does single-encoding (%2e%2e%2f) fail when the web server decodes inputs before the WAF?',
                options: [
                    '%2e is not valid hexadecimal',
                    'The web server decodes %2e%2e%2f into "../" BEFORE the WAF inspects it, triggering the block',
                    'URL decoding only works on POST parameters'
                ],
                correctIndex: 1,
                explanation: 'Correct! Because the web server performs Pass 1 decoding before the WAF runs, single-encoded payloads arrive at the WAF as plain "../".'
            },
            {
                question: 'What does "%252e" decode to after the FIRST URL-decode pass?',
                options: [
                    '"." (a literal dot)',
                    '"%2e" (because %25 decodes to "%", leaving "2e" intact for the second decode)',
                    '"25."'
                ],
                correctIndex: 1,
                explanation: 'Correct! %25 is the hex encoding for "%". Pass 1 turns "%252e" into "%2e", bypassing the WAF, and Pass 2 turns "%2e" into ".".'
            },
            {
                question: 'What architectural mismatch causes double-decoding vulnerabilities in production?',
                options: [
                    'A reverse proxy or web container decodes the URL once, and backend application code calls URLDecoder.decode() a second time',
                    'Using HTTPS instead of HTTP',
                    'Storing images in UTF-16 format'
                ],
                correctIndex: 0,
                explanation: 'Correct! Calling URL-decode manually inside application controllers when the framework already decoded query parameters causes double decoding.'
            },
            {
                question: 'At what point in the request lifecycle must security path validation occur?',
                options: [
                    'On the raw TCP packet before TLS decryption',
                    'Immediately before the filesystem syscall, after ALL decoding and path canonicalization has finished',
                    'Only inside client-side JavaScript'
                ],
                correctIndex: 1,
                explanation: 'Correct! Validation must always inspect the final canonical form right before the sensitive sink is invoked.'
            },
            {
                question: 'What is the hexadecimal URL encoding for a forward slash "/"?',
                options: [
                    '%2f (double-encoded as %252f)',
                    '%5c',
                    '%00'
                ],
                correctIndex: 0,
                explanation: 'Correct! ASCII 0x2F corresponds to "/", so single encoding is %2f and double encoding is %252f.'
            }
        ]
    },

    {
        id: 'lab-5',
        number: '05',
        level: 'PRACTITIONER',
        title: 'File path traversal, validation of start of path',
        wsaUrl: 'https://portswigger.net/web-security/file-path-traversal/lab-validate-start-of-path',
        filterBadge: 'PREFIX CHECK',
        backendFile: 'media_controller.go',
        bullets: [
            'The client transmits the full file path (e.g., <code>/var/www/images/218.png</code>).',
            'The backend verifies that the raw string begins with <code>/var/www/images/</code> before opening it.',
            'Checking prefix <em>before</em> resolving <code>../</code> lets you keep the required prefix and still climb up afterward.'
        ],
        hint: 'Keep the required prefix "/var/www/images/" at the start, then append "../" segments after it to escape.',
        probes: [
            { label: '/var/www/images/218.png', value: '/var/www/images/218.png' },
            { label: '../etc/passwd', value: '../etc/passwd' },
            { label: '/var/www/images/../html/index.php', value: '/var/www/images/../html/index.php' },
            { label: '⚡ /var/www/images/../../../etc/passwd', value: '/var/www/images/../../../etc/passwd', isExploit: true }
        ],
        codeLines: [
            { num: 1, code: 'func serveMedia(filename string) ([]byte, error) {', active: true },
            { num: 2, code: '    decoded := urlDecode(filename)', active: true },
            { num: 3, code: '    // Prefix validated on unnormalized input path', active: false, comment: true },
            { num: 4, code: '    if !strings.HasPrefix(decoded, "/var/www/images/") {', active: true },
            { num: 5, code: '        return nil, errors.New("403: Invalid base directory")', active: false },
            { num: 6, code: '    }', active: true },
            { num: 7, code: '    return os.ReadFile(decoded)', active: true }
        ],
        simulate: (rawInput) => {
            const decoded = safeUrlDecode(rawInput);
            const hasValidPrefix = decoded.startsWith('/var/www/images/');

            if (!hasValidPrefix) {
                return {
                    steps: [
                        { label: '1. Decoded Input', value: decoded },
                        { label: '2. Prefix Check', value: 'BLOCKED: Must start with "/var/www/images/"', status: 'blocked' },
                        { label: '3. Input Path', value: 'Execution halted at Line 5' },
                        { label: '4. Canonical OS Path', value: 'N/A (HTTP 403 Forbidden)' }
                    ],
                    filterSummary: 'PREFIX MISMATCH',
                    joinedPath: 'BLOCKED',
                    canonicalPath: null,
                    traversalSteps: [],
                    activeLines: [1, 2, 4, 5],
                    blocked: true,
                    blockReason: 'HTTP 403 Forbidden: Path must begin with "/var/www/images/".'
                };
            }

            const { canonical, traversalSteps } = resolvePosixPath(decoded);
            return {
                steps: [
                    { label: '1. Decoded Input', value: decoded },
                    { label: '2. Prefix Check', value: 'PASSED: Starts with "/var/www/images/"', status: canonical.startsWith('/var/www/images/') ? 'neutral' : 'bypassed' },
                    { label: '3. Raw Path', value: decoded },
                    { label: '4. Canonical OS Path', value: canonical, isTarget: canonical === '/etc/passwd' }
                ],
                filterSummary: 'PREFIX VALID',
                joinedPath: decoded,
                canonicalPath: canonical,
                traversalSteps,
                activeLines: [1, 2, 4, 6, 7],
                blocked: false
            };
        },
        quizPool: [
            {
                question: 'What is the fundamental flaw in checking strings.HasPrefix(input, "/var/www/images/") on unnormalized input?',
                options: [
                    'HasPrefix is case-insensitive on Linux',
                    'A path can start with "/var/www/images/" and still escape it using subsequent "../" segments',
                    'Attackers can overwrite the "/var/www/images/" constant in HTTP headers'
                ],
                correctIndex: 1,
                explanation: 'Correct! String prefix checks must always occur AFTER resolving the canonical absolute path (e.g., via filepath.Clean or realpath).'
            },
            {
                question: 'How does an attacker spot that an application expects a full base path prefix?',
                options: [
                    'Normal requests already pass a full path like ?filename=/var/www/images/218.png in the parameter',
                    'The server always returns HTTP 200 on empty requests',
                    'The TLS certificate reveals the folder name'
                ],
                correctIndex: 0,
                explanation: 'Correct! Observing full directory paths in baseline traffic tells you the backend likely validates the path prefix.'
            },
            {
                question: 'Even after canonicalizing, why should you check prefix with a trailing slash ("/var/www/images/") rather than "/var/www/images"?',
                options: [
                    'Without a trailing slash, "/var/www/images_secret/key" would falsely pass startsWith("/var/www/images")',
                    'Linux paths cannot end without a slash',
                    'Trailing slashes disable symlinks'
                ],
                correctIndex: 0,
                explanation: 'Correct! Omitting the trailing slash allows sibling-directory prefix collisions like "/var/www/images_private/".'
            },
            {
                question: 'In Go, what does filepath.Clean("/var/www/images/../../../etc/passwd") output?',
                options: [
                    '"/var/www/images/etc/passwd"',
                    '"/etc/passwd"',
                    'An empty string'
                ],
                correctIndex: 1,
                explanation: 'Correct! filepath.Clean resolves all lexical ".." elements, revealing the true target "/etc/passwd" so HasPrefix can block it.'
            },
            {
                question: 'Why does the OS kernel open /etc/passwd even though the string passed to os.ReadFile started with /var/www/images/?',
                options: [
                    'The OS VFS resolves each path component sequentially, stepping up directories whenever it encounters ".."',
                    'The OS ignores the first 16 characters of every filename',
                    'Go strips "/var/www/images/" automatically'
                ],
                correctIndex: 0,
                explanation: 'Correct! The kernel walks dentry nodes one by one, following ".." parent pointers back up to the root inode.'
            }
        ]
    },

    {
        id: 'lab-6',
        number: '06',
        level: 'PRACTITIONER',
        title: 'File path traversal, validation of file extension with null byte bypass',
        wsaUrl: 'https://portswigger.net/web-security/file-path-traversal/lab-validate-file-extension-null-byte-bypass',
        filterBadge: 'NULL BYTE %00',
        backendFile: 'legacy_image.c / php',
        bullets: [
            'Application code verifies that the decoded filename ends with an expected extension (<code>.png</code>).',
            'However, underlying C-based OS file calls treat a null byte (<code>0x00</code> / <code>%00</code>) as the end of the string.',
            'Adding a URL-encoded null byte before <code>.png</code> passes the extension check while truncating the file path at the kernel level.'
        ],
        hint: 'Traverse to the target file, then append a URL-encoded null byte (%00) followed by .png so the suffix check passes.',
        probes: [
            { label: '218.png', value: '218.png' },
            { label: '../etc/passwd', value: '../etc/passwd' },
            { label: '../../../etc/passwd.png', value: '../../../etc/passwd.png' },
            { label: '⚡ ../../../etc/passwd%00.png', value: '../../../etc/passwd%00.png', isExploit: true }
        ],
        codeLines: [
            { num: 1, code: '$filename = urldecode($_GET["filename"]); // %00 becomes \\0', active: true },
            { num: 2, code: 'if (!str_ends_with($filename, ".png")) {', active: true },
            { num: 3, code: '    die("403: Only .png files allowed");', active: false },
            { num: 4, code: '}', active: true },
            { num: 5, code: '// Legacy C-level filesystem call stops reading at first \\0 null byte', active: false, comment: true },
            { num: 6, code: 'FILE *fp = fopen(concat("/var/www/images/", filename), "r");', active: true }
        ],
        simulate: (rawInput) => {
            const decoded = safeUrlDecode(rawInput);
            const endsWithPng = decoded.endsWith('.png');

            if (!endsWithPng) {
                return {
                    steps: [
                        { label: '1. Decoded Input', value: decoded.replace(/\0/g, '\\0') },
                        { label: '2. Extension Check', value: 'BLOCKED: Does not end with ".png"', status: 'blocked' },
                        { label: '3. String Truncation', value: 'Execution halted at Line 3' },
                        { label: '4. Canonical OS Path', value: 'N/A (HTTP 403 Forbidden)' }
                    ],
                    filterSummary: 'EXT BLOCKED',
                    joinedPath: 'BLOCKED',
                    canonicalPath: null,
                    traversalSteps: [],
                    activeLines: [1, 2, 3],
                    blocked: true,
                    blockReason: 'HTTP 403 Forbidden: Requested file must end with the ".png" extension.'
                };
            }

            const nullIndex = decoded.indexOf('\0');
            const cStringInput = nullIndex !== -1 ? decoded.slice(0, nullIndex) : decoded;
            const joined = '/var/www/images/' + cStringInput;
            const { canonical, traversalSteps } = resolvePosixPath(joined);

            return {
                steps: [
                    { label: '1. Decoded Input', value: decoded.replace(/\0/g, '\\0') },
                    { label: '2. Extension Check', value: 'PASSED: Ends with ".png"', status: nullIndex !== -1 ? 'bypassed' : 'neutral' },
                    { label: '3. OS Syscall (Truncated)', value: joined, highlight: nullIndex !== -1 },
                    { label: '4. Canonical OS Path', value: canonical, isTarget: canonical === '/etc/passwd' }
                ],
                filterSummary: nullIndex !== -1 ? 'NULL TRUNCATED' : 'EXT VALID',
                joinedPath: joined,
                canonicalPath: canonical,
                traversalSteps,
                activeLines: [1, 2, 4, 6],
                blocked: false
            };
        },
        quizPool: [
            {
                question: 'Why does appending %00.png bypass a high-level endsWith(".png") check?',
                options: [
                    'Because %00 converts .png into a directory',
                    'High-level strings track explicit length (seeing ".png" at the end), whereas C syscalls stop at the null byte (0x00)',
                    'Linux ignores file extensions on files inside /etc/'
                ],
                correctIndex: 1,
                explanation: 'Correct! Length-prefixed strings (PHP/Java/Python) inspect all bytes up to string length, while null-terminated C strings terminate at 0x00.'
            },
            {
                question: 'How have modern runtimes (like PHP >= 5.3.4 and modern Java NIO) mitigated null byte injection?',
                options: [
                    'They automatically strip %00 from URLs',
                    'They explicitly reject paths containing null bytes (\\0) with an InvalidPathException / error before calling OS APIs',
                    'They encrypt all file paths in memory'
                ],
                correctIndex: 1,
                explanation: 'Correct! Modern standard libraries explicitly check for null bytes in file paths and throw an error before invoking C-level syscalls.'
            },
            {
                question: 'What happens if you append ".png" WITHOUT a null byte (e.g., ../../../etc/passwd.png)?',
                options: [
                    'The OS automatically strips ".png" if the file does not exist',
                    'The OS looks for a literal file named "passwd.png" in /etc/, returning 404 Not Found',
                    'It triggers a buffer overflow'
                ],
                correctIndex: 1,
                explanation: 'Correct! Without null-byte truncation, the kernel attempts to open "/etc/passwd.png", which does not exist.'
            },
            {
                question: 'Why must the null byte be sent as "%00" in an HTTP URL rather than typing a raw ASCII NUL character?',
                options: [
                    'Raw NUL bytes are illegal in HTTP request lines and would break HTTP parsing before reaching the backend',
                    '%00 is compressed faster over TLS',
                    'Browsers automatically convert spaces into %00'
                ],
                correctIndex: 0,
                explanation: 'Correct! URL-encoding the null byte as %00 transports it safely across HTTP until the backend calls urldecode().'
            },
            {
                question: 'Which term describes a vulnerability caused by two layers interpreting the same string boundary differently?',
                options: [
                    'Parser / Representation Differential (Impedance Mismatch)',
                    'Cross-Site Request Forgery',
                    'DNS Rebinding'
                ],
                correctIndex: 0,
                explanation: 'Correct! Impedance mismatches between length-prefixed application strings and null-terminated OS strings are classic parser differentials.'
            }
        ]
    }
];

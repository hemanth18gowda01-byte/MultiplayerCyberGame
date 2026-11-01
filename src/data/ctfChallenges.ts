import { CTFChallenge, ChallengeDifficulty, ChallengeCategory } from '../types/game';

export const BEGINNER_CHALLENGES: CTFChallenge[] = [
  {
    id: 'beg-1',
    category: 'CRYPTOGRAPHY',
    difficulty: 'BEGINNER',
    title: 'The Roman Emperor\'s Secret',
    story: 'Julius Caesar sent this encrypted battlefield transmission by shifting every letter forward by 3 positions (A becomes D, B becomes E). Decrypt the message to intercept his order!',
    artifact: 'FDHVDU_FLSKHU_GHFRGHG',
    hint: 'Shift every letter backwards by 3 (D -> A, E -> B, F -> C, H -> E, V -> S).',
    acceptedAnswers: ['CAESAR_CIPHER_DECODED', 'CAESAR CIPHER DECODED', 'CTF{CAESAR_CIPHER_DECODED}'],
    points: 500,
    explanation: 'The Caesar Cipher is an ancient substitution cipher with a shift key of 3. Shifting "FDHVDU" back 3 letters yields "CAESAR".'
  },
  {
    id: 'beg-2',
    category: 'CYBERSECURITY',
    difficulty: 'BEGINNER',
    title: 'The Default Port Gatekeeper',
    story: 'A cyber intruder is attempting to connect to a target server using an encrypted remote shell. What standard network port number does the secure SSH service listen on by default?',
    artifact: 'PROTOCOL: Secure Shell (SSH)\nTRANSPORT: TCP\nQUESTION: What standard port number must be opened?',
    hint: 'HTTP is 80, HTTPS is 443, Telnet is 23, and SSH is one less than Telnet.',
    acceptedAnswers: ['22', 'PORT 22', 'CTF{22}'],
    points: 500,
    explanation: 'TCP Port 22 is the standard IANA assigned port for the Secure Shell (SSH) cryptographic network protocol.'
  },
  {
    id: 'beg-3',
    category: 'MATHEMATICS',
    difficulty: 'BEGINNER',
    title: 'The Binary Countdown',
    story: 'The airlock console is locked with a binary countdown sequence. Convert this 8-bit binary byte into its decimal number to bypass the biometric seal!',
    artifact: '0 1 0 1 1 0 1 0 (base 2) = ? (base 10)',
    hint: 'Powers of 2: 64 + 16 + 8 + 2.',
    acceptedAnswers: ['90', 'CTF{90}'],
    points: 500,
    explanation: '01011010 in binary is: 0*(128) + 1*(64) + 0*(32) + 1*(16) + 1*(8) + 0*(4) + 1*(2) + 0*(1) = 64 + 16 + 8 + 2 = 90.'
  },
  {
    id: 'beg-4',
    category: 'DIGITAL_FORENSICS',
    difficulty: 'BEGINNER',
    title: 'The Magic Byte Mystery',
    story: 'A corrupted suspicious file was retrieved from a suspect\'s flash drive. Its file extension was erased, but its first 4 hexadecimal magic bytes read: "89 50 4E 47". What image file format is this?',
    artifact: 'HEX DUMP (Offset 0x00):\n89 50 4E 47 0D 0A 1A 0A ...\nASCII: . P N G . . . .',
    hint: 'Look closely at the ASCII representation right next to the hex bytes!',
    acceptedAnswers: ['PNG', '.PNG', 'IMAGE/PNG', 'CTF{PNG}'],
    points: 500,
    explanation: '89 50 4E 47 0D 0A 1A 0A is the universal file signature (magic bytes) identifying Portable Network Graphics (.png) images.'
  },
  {
    id: 'beg-5',
    category: 'CRYPTOGRAPHY',
    difficulty: 'BEGINNER',
    title: 'Base64 Intercept',
    story: 'Your network sniffer captured an authentication token encoded in standard RFC 4648 Base64. Decode the raw string to reveal the secret passkey!',
    artifact: 'Q1RGe0hBQ0tfVEhFX1BMQU5FVH0=',
    hint: 'Base64 ends with "=" padding. You can decode it with our built-in Cyber Toolkit or base64 decode!',
    acceptedAnswers: ['CTF{HACK_THE_PLANET}', 'HACK_THE_PLANET', 'HACK THE PLANET'],
    points: 500,
    explanation: 'Decoding the base64 string "Q1RGe0hBQ0tfVEhFX1BMQU5FVH0=" yields the classic cyber motto "CTF{HACK_THE_PLANET}".'
  },
  {
    id: 'beg-6',
    category: 'CYBERSECURITY',
    difficulty: 'BEGINNER',
    title: 'The Web Browser Sentinel',
    story: 'When browsing the web securely, web servers authenticate and encrypt communication using TLS over which standard TCP port?',
    artifact: 'PROTOCOL: Hypertext Transfer Protocol Secure (HTTPS)\nSTANDARD TCP PORT: ???',
    hint: 'HTTP is port 80. HTTPS is port 443.',
    acceptedAnswers: ['443', 'PORT 443', 'CTF{443}'],
    points: 500,
    explanation: 'TCP Port 443 is the universally standard port used for secure HTTPS web traffic.'
  },
  {
    id: 'beg-7',
    category: 'MATHEMATICS',
    difficulty: 'BEGINNER',
    title: 'Hexadecimal Handshake',
    story: 'Convert the hexadecimal memory byte 0xFF into its standard decimal number.',
    artifact: 'HEXADECIMAL: 0xFF\nDECIMAL EQUIVALENT: ?',
    hint: 'Each F equals 15. 15 * 16 + 15 = ?',
    acceptedAnswers: ['255', 'CTF{255}'],
    points: 500,
    explanation: '0xFF = (15 * 16^1) + (15 * 16^0) = 240 + 15 = 255 (the maximum value of an 8-bit unsigned integer).'
  },
  {
    id: 'beg-8',
    category: 'DIGITAL_FORENSICS',
    difficulty: 'BEGINNER',
    title: 'The Zip Archive Header',
    story: 'Which two ASCII letters appear as the magic signature bytes at the very beginning of all PKZIP and modern .zip files?',
    artifact: 'HEX BYTES: 50 4B 03 04\nASCII SIGNATURE: ??',
    hint: 'Initials of Phil Katz, creator of PKZIP: P and K.',
    acceptedAnswers: ['PK', 'CTF{PK}', '50 4B'],
    points: 500,
    explanation: 'PK (0x50 0x4B) represents the initials of Phil Katz, the developer of the ZIP format.'
  },
  {
    id: 'beg-9',
    category: 'CRYPTOGRAPHY',
    difficulty: 'BEGINNER',
    title: 'Atbash Mirror Cipher',
    story: 'In the ancient Atbash cipher, the alphabet is reversed: A becomes Z, B becomes Y, C becomes X. Decode this word: "SLIVMHRXH"',
    artifact: 'CIPHERTEXT: SLIVMHRXH\nREVERSED ALPHABET: Z Y X W V U T S R Q P O N M L K J I H G F E D C B A',
    hint: 'S -> H, L -> O, I -> R, V -> E, M -> N, H -> S, R -> I, X -> C, H -> S.',
    acceptedAnswers: ['FORENSICS', 'CTF{FORENSICS}'],
    points: 500,
    explanation: 'Atbash is a monoalphabetic substitution cipher formed by reversing the alphabet, translating SLIVMHRXH into FORENSICS.'
  },
  {
    id: 'beg-10',
    category: 'CYBERSECURITY',
    difficulty: 'BEGINNER',
    title: 'DNS Resolution Port',
    story: 'Which UDP/TCP port is queried whenever your device translates a human domain name like google.com into an IP address?',
    artifact: 'SERVICE: Domain Name System (DNS)\nPORT NUMBER: ??',
    hint: 'Between 50 and 60. Often used in UDP port scans.',
    acceptedAnswers: ['53', 'PORT 53', 'CTF{53}'],
    points: 500,
    explanation: 'Port 53 is the official standard network port for Domain Name System (DNS) queries.'
  }
];

export const INTERMEDIATE_CHALLENGES: CTFChallenge[] = [
  {
    id: 'int-1',
    category: 'CYBERSECURITY',
    difficulty: 'INTERMEDIATE',
    title: 'SQL Injection Tautology',
    story: 'A vulnerable login portal evaluates credentials with: SELECT * FROM users WHERE user=\'admin\' AND pass=\'INPUT\'. What 7-character canonical boolean tautology bypasses the password check completely?',
    artifact: 'SELECT * FROM users WHERE user = \'admin\' AND pass = \'\';\nPAYLOAD: \' OR 1=1 --',
    hint: 'The classic injection that makes any condition evaluate to TRUE: starts with single quote, OR, and two identical digits.',
    acceptedAnswers: ['\' OR 1=1 --', '\' OR 1=1', 'OR 1=1', 'CTF{\' OR 1=1 --}'],
    points: 1000,
    explanation: '\' OR 1=1 -- injects an unconditional true condition into the SQL query and comments out the remainder of the password verification.'
  },
  {
    id: 'int-2',
    category: 'MATHEMATICS',
    difficulty: 'INTERMEDIATE',
    title: 'Modular Clockwork Cipher',
    story: 'In public key cryptography, modular arithmetic is foundational. Solve the modular exponentiation riddle: What is the remainder when 7 raised to the power of 4 is divided by 11?',
    artifact: '7^4 mod 11 = ?\n\nStep 1: 7^2 = 49 = 5 mod 11\nStep 2: 7^4 = (7^2)^2 = ? mod 11',
    hint: '7^2 mod 11 = 5. So (5)^2 = 25. What is 25 divided by 11, and what is left over?',
    acceptedAnswers: ['3', 'CTF{3}'],
    points: 1000,
    explanation: '7^2 = 49 = 4*11 + 5, so 7^2 ≡ 5 (mod 11). Therefore 7^4 ≡ 5^2 = 25 = 2*11 + 3 ≡ 3 (mod 11).'
  },
  {
    id: 'int-3',
    category: 'CRYPTOGRAPHY',
    difficulty: 'INTERMEDIATE',
    title: 'The XOR Reversible Mask',
    story: 'A cyber operative encrypted a single character using a secret key byte. If Ciphertext byte is 0x7F and Key byte is 0x33, what ASCII character was the Plaintext? (Hint: Plaintext = Ciphertext XOR Key)',
    artifact: 'CIPHERTEXT: 0x7F (01111111 binary)\nKEY BYTE:   0x33 (00110011 binary)\nPLAINTEXT:  CIPHERTEXT ^ KEY = 0x4C = ? (ASCII Character)',
    hint: '0x7F XOR 0x33 = 0x4C in hex. Look up hex 0x4C in ASCII: 0x41 is "A", 0x42 is "B"... What is 0x4C?',
    acceptedAnswers: ['L', 'CTF{L}'],
    points: 1000,
    explanation: '0x7F ^ 0x33 = 01111111 ^ 00110011 = 01001100 = 0x4C in hex = decimal 76 = ASCII character "L".'
  },
  {
    id: 'int-4',
    category: 'DIGITAL_FORENSICS',
    difficulty: 'INTERMEDIATE',
    title: 'The Steganography Whisper',
    story: 'Forensic investigators extracted hidden EXIF metadata from a leaked photo. The Artist tag contained an encoded ROT13 message. Decrypt it to find the hacker\'s alias!',
    artifact: 'EXIF:Artist = "PELCGB_TNEQRA"',
    hint: 'Rotate each letter by 13 positions in the alphabet (P <-> C, E <-> R, L <-> Y, C <-> P).',
    acceptedAnswers: ['CRYPTO_GARDEN', 'CRYPTO GARDEN', 'CTF{CRYPTO_GARDEN}'],
    points: 1000,
    explanation: 'ROT13 is a symmetric substitution cipher. Decrypting "PELCGB_TNEQRA" gives "CRYPTO_GARDEN".'
  },
  {
    id: 'int-5',
    category: 'CYBERSECURITY',
    difficulty: 'INTERMEDIATE',
    title: 'The Hash Collision Trap',
    story: 'Which legacy 128-bit cryptographic hash function, originally created by Ronald Rivest in 1991, was officially broken in 2004 when flame and rainbow tables proved widespread collision vulnerabilities?',
    artifact: 'HASH LENGTH: 128 bits (32 hex characters)\nEXAMPLE: d41d8cd98f00b204e9800998ecf8427e\nFUNCTION NAME: ?',
    hint: 'MD followed by a single digit (one greater than MD4).',
    acceptedAnswers: ['MD5', 'MD-5', 'MESSAGE DIGEST 5', 'CTF{MD5}'],
    points: 1000,
    explanation: 'MD5 (Message Digest 5) produces a 128-bit hash and is now considered cryptographically broken due to fast collision attacks.'
  },
  {
    id: 'int-6',
    category: 'MATHEMATICS',
    difficulty: 'INTERMEDIATE',
    title: 'Coprime Coprocessor',
    story: 'Two integers are coprime if their greatest common divisor (GCD) equals 1. Which of these numbers is coprime to 28: 14, 21, 15, or 35?',
    artifact: 'FACTORS OF 28: 1, 2, 4, 7, 14, 28\nCANDIDATES: 14, 21, 15, 35\nWHICH HAS GCD(x, 28) = 1?',
    hint: '14, 21, and 35 all share 7 with 28. Which candidate does not share 2 or 7?',
    acceptedAnswers: ['15', 'CTF{15}'],
    points: 1000,
    explanation: '15 has prime factors 3 and 5, neither of which divide 28 (factors 2 and 7). Therefore GCD(15, 28) = 1.'
  },
  {
    id: 'int-7',
    category: 'CRYPTOGRAPHY',
    difficulty: 'INTERMEDIATE',
    title: 'The Vigenère Tableau Key',
    story: 'A Vigenère cipher was used with the repeating keyword "KEY". If the first letter of ciphertext is "R", and the keyword letter is "K" (index 10), what was the plaintext letter? (P = (C - K) mod 26)',
    artifact: 'CIPHERTEXT LETTER: R (Index 17)\nKEY LETTER:        K (Index 10)\nPLAINTEXT FORMULA: (17 - 10) mod 26 = 7 -> Character ?',
    hint: 'Index 0 is A, 1 is B, 2 is C, 3 is D, 4 is E, 5 is F, 6 is G, 7 is H.',
    acceptedAnswers: ['H', 'CTF{H}'],
    points: 1000,
    explanation: '17 - 10 = 7. Index 7 in the alphabet corresponds to letter "H".'
  },
  {
    id: 'int-8',
    category: 'DIGITAL_FORENSICS',
    difficulty: 'INTERMEDIATE',
    title: 'PDF File Trailer Marker',
    story: 'In digital document forensics, Adobe Portable Document Format (.pdf) files must conclude with an exact end-of-file marker string. What is this standard 5-character string?',
    artifact: 'OFFSET END OF FILE:\n... 25 25 45 4F 46 0A\nASCII: %%EOF',
    hint: 'Two percent signs followed by EOF.',
    acceptedAnswers: ['%%EOF', '%EOF', 'EOF', 'CTF{%%EOF}'],
    points: 1000,
    explanation: '%%EOF (0x25 0x25 0x45 0x4F 0x46) marks the end of a valid PDF document cross-reference trailer.'
  },
  {
    id: 'int-9',
    category: 'CYBERSECURITY',
    difficulty: 'INTERMEDIATE',
    title: 'Cross-Site Scripting Anchor',
    story: 'What HTML tag is most commonly injected by attackers in stored or reflected XSS attacks to execute arbitrary JavaScript in the victim\'s browser?',
    artifact: 'VULNERABILITY: Stored Cross-Site Scripting (XSS)\nPAYLOAD: <______>alert(document.cookie)</______>',
    hint: 'The standard tag for client-side JavaScript execution: s-c-r-i-p-t.',
    acceptedAnswers: ['SCRIPT', '<SCRIPT>', '<SCRIPT></SCRIPT>', 'CTF{SCRIPT}'],
    points: 1000,
    explanation: 'The <script> HTML tag causes browsers to parse and run script code in the context of the vulnerable origin.'
  },
  {
    id: 'int-10',
    category: 'DIGITAL_FORENSICS',
    difficulty: 'INTERMEDIATE',
    title: 'Unix Epoch Origin',
    story: 'Digital forensics timeline analysis measures time in seconds since the Unix Epoch. What year did the Unix Epoch begin on January 1st at 00:00:00 UTC?',
    artifact: 'TIMESTAMP: 0\nDATE: January 1, 00:00:00 UTC\nYEAR: 19??',
    hint: 'One year after Apollo 11 moon landing (1969).',
    acceptedAnswers: ['1970', 'CTF{1970}'],
    points: 1000,
    explanation: 'The Unix epoch begins at 1970-01-01T00:00:00Z.'
  }
];

export const ADVANCED_CHALLENGES: CTFChallenge[] = [
  {
    id: 'adv-1',
    category: 'CRYPTOGRAPHY',
    difficulty: 'ADVANCED',
    title: 'RSA Public Key Trapdoor',
    story: 'An RSA cryptosystem uses two prime numbers p = 61 and q = 53. Calculate Euler\'s Totient value φ(N), which is necessary to derive the private decryption exponent d.',
    artifact: 'PRIME p = 61\nPRIME q = 53\nMODULUS N = p * q = 3233\nFORMULA: φ(N) = (p - 1) * (q - 1)\nCALCULATE: φ(N) = ?',
    hint: '(61 - 1) = 60. (53 - 1) = 52. Multiply 60 by 52!',
    acceptedAnswers: ['3120', 'CTF{3120}'],
    points: 2000,
    explanation: 'Euler\'s totient for RSA is φ(N) = (p - 1)(q - 1) = 60 * 52 = 3120. This value allows computing the private key via modular inverse.'
  },
  {
    id: 'adv-2',
    category: 'DIGITAL_FORENSICS',
    difficulty: 'ADVANCED',
    title: 'PCAP Wireshark Decapitation',
    story: 'A packet capture shows an HTTP Basic Authentication request header: "Authorization: Basic YWRtaW46U3VwZXJTZWNyZXQxMjMh". What was the plaintext password submitted by the attacker?',
    artifact: 'FRAME 42 HTTP REQUEST:\nGET /admin/dashboard HTTP/1.1\nHost: target.internal\nAuthorization: Basic YWRtaW46U3VwZXJTZWNyZXQxMjMh',
    hint: 'HTTP Basic Auth is formatted as Base64("username:password"). Decode the base64 string to find username:password!',
    acceptedAnswers: ['SuperSecret123!', 'CTF{SuperSecret123!}', 'admin:SuperSecret123!'],
    points: 2000,
    explanation: 'Decoding "YWRtaW46U3VwZXJTZWNyZXQxMjMh" yields "admin:SuperSecret123!". The password is SuperSecret123!.'
  },
  {
    id: 'adv-3',
    category: 'CYBERSECURITY',
    difficulty: 'ADVANCED',
    title: 'The NOP Sled & Shellcode Exploitation',
    story: 'In classic x86 stack buffer overflow exploits, attackers pad memory before shellcode with a series of single-byte No-Operation instructions so the execution flow slides safely into payload. What is the hex opcode of the x86 NOP instruction?',
    artifact: 'ARCHITECTURE: x86 (IA-32)\nINSTRUCTION: NOP (No Operation)\nOPCODE HEX: 0x??',
    hint: 'It is a single byte between 0x85 and 0x95. Starts with 9, ends with 0.',
    acceptedAnswers: ['0x90', '90', 'CTF{0x90}', 'CTF{90}'],
    points: 2000,
    explanation: '0x90 is the famous opcode for x86 NOP (derived from XCHG EAX, EAX). A chain of 0x90 bytes forms a "NOP Sled".'
  },
  {
    id: 'adv-4',
    category: 'MATHEMATICS',
    difficulty: 'ADVANCED',
    title: 'Diffie-Hellman Shared Secret',
    story: 'Alice and Bob agree on public prime p = 23 and generator g = 5. Alice picks secret private key a = 6 and sends public value A = 5^6 mod 23 = 8. Bob sends public value B = 19. Compute the shared secret key K = B^a mod 23 = 19^6 mod 23!',
    artifact: 'PUBLIC PRIME p = 23\nALICE PRIVATE a = 6\nBOB PUBLIC B = 19\nCALCULATE: 19^6 mod 23 = ?\n(Note: 19 = -4 mod 23. (-4)^2 = 16 = -7. (-4)^3 = 28 = 2. (2)^2 = ?)',
    hint: '19 ≡ -4 (mod 23). 19^3 ≡ (-4)^3 = -64 ≡ 5 (mod 23). So 19^6 = (19^3)^2 ≡ 5^2 = 25 ≡ ? (mod 23)',
    acceptedAnswers: ['2', 'CTF{2}'],
    points: 2000,
    explanation: '19 ≡ -4 mod 23. (-4)^3 = -64 = -3*23 + 5 ≡ 5 mod 23. (19^3)^2 = 5^2 = 25 = 23 + 2 ≡ 2 mod 23. The shared secret is 2!'
  },
  {
    id: 'adv-5',
    category: 'CRYPTOGRAPHY',
    difficulty: 'ADVANCED',
    title: 'SHA-256 Output Length',
    story: 'The NSA-designed SHA-256 cryptographic hash function produces a fixed digest output. Exactly how many hexadecimal characters are in a standard formatted SHA-256 string?',
    artifact: 'HASH: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855\nHEX STRING LENGTH: ?',
    hint: '256 bits divided by 4 bits per hex character = ?',
    acceptedAnswers: ['64', 'CTF{64}'],
    points: 2000,
    explanation: '256 bits / 4 bits per hex digit = 64 hexadecimal characters.'
  },
  {
    id: 'adv-6',
    category: 'DIGITAL_FORENSICS',
    difficulty: 'ADVANCED',
    title: 'Windows Master File Table (MFT)',
    story: 'In Windows NTFS digital forensics, what is the 4-letter magic signature at offset 0x00 of every valid MFT record entry?',
    artifact: 'NTFS FILE RECORD:\n0x00: 46 49 4C 45\nASCII: F I L E',
    hint: 'The English word for a stored document: F-I-L-E.',
    acceptedAnswers: ['FILE', 'CTF{FILE}'],
    points: 2000,
    explanation: 'Every 1024-byte NTFS MFT record begins with the magic ASCII string "FILE" (or "BAAD" if corrupt).'
  },
  {
    id: 'adv-7',
    category: 'CYBERSECURITY',
    difficulty: 'ADVANCED',
    title: 'Metasploit Meterpreter Default Port',
    story: 'In penetration testing, what port number is commonly configured by default for multi/handler reverse TCP payloads in Metasploit?',
    artifact: 'PAYLOAD: windows/x64/meterpreter/reverse_tcp\nDEFAULT LPORT: 4444\nQUESTION: Enter the default LPORT',
    hint: 'Four identical digits, each being 4.',
    acceptedAnswers: ['4444', 'PORT 4444', 'CTF{4444}'],
    points: 2000,
    explanation: '4444 is the ubiquitous default listening port (LPORT) in Metasploit payload templates.'
  },
  {
    id: 'adv-8',
    category: 'MATHEMATICS',
    difficulty: 'ADVANCED',
    title: 'Hamming Distance Check',
    story: 'The Hamming distance between two binary codewords is the number of bit positions where the corresponding bits differ. Calculate the Hamming distance between 1011101 and 1001001.',
    artifact: 'A: 1 0 1 1 1 0 1\nB: 1 0 0 1 0 0 1\nHAMMING DISTANCE = ?',
    hint: 'Compare bit by bit: bits at index 2 (from left) and index 4 differ. How many total differences?',
    acceptedAnswers: ['2', 'CTF{2}'],
    points: 2000,
    explanation: 'Positions 3 and 5 differ (1 vs 0). All other 5 bits match, so Hamming distance = 2.'
  },
  {
    id: 'adv-9',
    category: 'CRYPTOGRAPHY',
    difficulty: 'ADVANCED',
    title: 'Elliptic Curve Secp256k1 Equation',
    story: 'Bitcoin and Ethereum use the Koblitz elliptic curve secp256k1: y^2 = x^3 + ax + b (mod p). What is the integer constant value of parameter "b" in this curve equation?',
    artifact: 'CURVE: secp256k1\nEQUATION: y^2 = x^3 + 7 (mod p)\na = 0, b = ?',
    hint: 'A lucky prime digit under 10.',
    acceptedAnswers: ['7', 'CTF{7}'],
    points: 2000,
    explanation: 'secp256k1 is defined by y^2 = x^3 + 7 over F_p, so b = 7.'
  },
  {
    id: 'adv-10',
    category: 'DIGITAL_FORENSICS',
    difficulty: 'ADVANCED',
    title: 'ELF Binary Magic Header',
    story: 'On Linux systems, executable binaries use the Executable and Linkable Format (ELF). What 4 hex bytes identify an ELF binary?',
    artifact: 'LINUX EXECUTABLE:\n7F 45 4C 46\nASCII: . E L F',
    hint: '0x7F followed by the 3 ASCII letters E, L, F.',
    acceptedAnswers: ['7F 45 4C 46', '7F454C46', '0x7F454C46', 'ELF', 'CTF{7F454C46}'],
    points: 2000,
    explanation: '0x7F 0x45 0x4C 0x4F (0x7F \'E\' \'L\' \'F\') is the standard magic byte header of Unix/Linux ELF binaries.'
  }
];

export const ALL_CHALLENGES = [
  ...BEGINNER_CHALLENGES,
  ...INTERMEDIATE_CHALLENGES,
  ...ADVANCED_CHALLENGES
];

export const BOT_HACKER_NAMES = [
  'ZeroCool', 'AcidBurn', 'CipherPhantom', 'Ne0nKnight', 'ByteBandit', 'BinaryGhost', 'HexValkyrie', 'KernelPanic'
];

export const CYBER_AVATARS = ['💻', '🛡️', '⚡', '🕵️', '👾', '🔐', '🎯', '🚀', '🔥', '🤖', '💀', '🧠'];

/**
 * Returns a randomized deck of distinct challenges for the selected tier.
 * Filters by custom selected categories if specified.
 * Shuffles on every match so questions are always different!
 */
export function getRandomizedTierDeck(
  tier: ChallengeDifficulty,
  count = 5,
  categories?: ChallengeCategory[]
): CTFChallenge[] {
  let pool: CTFChallenge[] = [];
  switch (tier) {
    case 'BEGINNER': pool = [...BEGINNER_CHALLENGES]; break;
    case 'INTERMEDIATE': pool = [...INTERMEDIATE_CHALLENGES]; break;
    case 'ADVANCED': pool = [...ADVANCED_CHALLENGES]; break;
  }

  // Filter by requested categories if provided
  if (categories && categories.length > 0) {
    const filtered = pool.filter(c => categories.includes(c.category));
    if (filtered.length >= count) {
      pool = filtered;
    } else if (filtered.length > 0) {
      const remaining = pool.filter(c => !categories.includes(c.category));
      pool = [...filtered, ...remaining];
    }
  }

  // Fisher-Yates shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, Math.min(count, pool.length));
}

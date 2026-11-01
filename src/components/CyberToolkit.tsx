import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Key,
  Binary,
  Hash,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  ArrowRightLeft,
  Download,
  Flag,
  ListFilter,
  Code
} from 'lucide-react';
import { sounds } from '../utils/sound';

interface CyberToolkitProps {
  onInsertFlag?: (flag: string) => void;
  activeArtifact?: string;
}

type ToolTab = 'BASE64' | 'CAESAR' | 'HEX' | 'BINARY' | 'HASH' | 'HELPERS';

// Simple pure-JS MD5 implementation for client-side CTF verification
function md5(string: string): string {
  function rotateLeft(lValue: number, iShiftBits: number) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }
  function addUnsigned(lX: number, lY: number) {
    const lX4 = lX & 0x40000000;
    const lY4 = lY & 0x40000000;
    const lX8 = lX & 0x80000000;
    const lY8 = lY & 0x80000000;
    const lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff);
    if (lX4 & lY4) return lResult ^ 0x80000000 ^ lX8 ^ lY8;
    if (lX4 | lY4) {
      if (lResult & 0x40000000) return lResult ^ 0xc0000000 ^ lX8 ^ lY8;
      return lResult ^ 0x40000000 ^ lX8 ^ lY8;
    }
    return lResult ^ lX8 ^ lY8;
  }
  function F(x: number, y: number, z: number) { return (x & y) | (~x & z); }
  function G(x: number, y: number, z: number) { return (x & z) | (y & ~z); }
  function H(x: number, y: number, z: number) { return x ^ y ^ z; }
  function I(x: number, y: number, z: number) { return y ^ (x | ~z); }

  function FF(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function GG(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function HH(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function II(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function convertToWordArray(string: string) {
    let lWordCount;
    const lMessageLength = string.length;
    const lNumberOfWords_temp1 = lMessageLength + 8;
    const lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
    const lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
    const lWordArray = new Array(lNumberOfWords - 1);
    let lBytePosition = 0;
    let lByteCount = 0;
    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
      lByteCount++;
    }
    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
  }

  function wordToHex(lValue: number) {
    let wordToHexValue = '', wordToHexValue_temp = '', lByte, lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      wordToHexValue_temp = '0' + lByte.toString(16);
      wordToHexValue = wordToHexValue + wordToHexValue_temp.substr(wordToHexValue_temp.length - 2, 2);
    }
    return wordToHexValue;
  }

  let x = convertToWordArray(string);
  let a = 0x67452301;
  let b = 0xefcdab89;
  let c = 0x98badcfe;
  let d = 0x10325476;

  for (let k = 0; k < x.length; k += 16) {
    const AA = a; const BB = b; const CC = c; const DD = d;
    a = FF(a, b, c, d, x[k + 0], 7, 0xd76aa478);
    d = FF(d, a, b, c, x[k + 1], 12, 0xe8c7b756);
    c = FF(c, d, a, b, x[k + 2], 17, 0x242070db);
    b = FF(b, c, d, a, x[k + 3], 22, 0xc1bdceee);
    a = FF(a, b, c, d, x[k + 4], 7, 0xf57c0faf);
    d = FF(d, a, b, c, x[k + 5], 12, 0x4787c62a);
    c = FF(c, d, a, b, x[k + 6], 17, 0xa8304613);
    b = FF(b, c, d, a, x[k + 7], 22, 0xfd469501);
    a = FF(a, b, c, d, x[k + 8], 7, 0x698098d8);
    d = FF(d, a, b, c, x[k + 9], 12, 0x8b44f7af);
    c = FF(c, d, a, b, x[k + 10], 17, 0xffff5bb1);
    b = FF(b, c, d, a, x[k + 11], 22, 0x895cd7be);
    a = FF(a, b, c, d, x[k + 12], 7, 0x6b901122);
    d = FF(d, a, b, c, x[k + 13], 12, 0xfd987193);
    c = FF(c, d, a, b, x[k + 14], 17, 0xa679438e);
    b = FF(b, c, d, a, x[k + 15], 22, 0x49b40821);

    a = GG(a, b, c, d, x[k + 1], 5, 0xf61e2562);
    d = GG(d, a, b, c, x[k + 6], 9, 0xc040b340);
    c = GG(c, d, a, b, x[k + 11], 14, 0x265e5a51);
    b = GG(b, c, d, a, x[k + 0], 20, 0xe9b6c7aa);
    a = GG(a, b, c, d, x[k + 5], 5, 0xd62f105d);
    d = GG(d, a, b, c, x[k + 10], 9, 0x2441453);
    c = GG(c, d, a, b, x[k + 15], 14, 0xd8a1e681);
    b = GG(b, c, d, a, x[k + 4], 20, 0xe7d3fbc8);
    a = GG(a, b, c, d, x[k + 9], 5, 0x21e1cde6);
    d = GG(d, a, b, c, x[k + 14], 9, 0xc33707d6);
    c = GG(c, d, a, b, x[k + 3], 14, 0xf4d50d87);
    b = GG(b, c, d, a, x[k + 8], 20, 0x455a14ed);
    a = GG(a, b, c, d, x[k + 13], 5, 0xa9e3e905);
    d = GG(d, a, b, c, x[k + 2], 9, 0xfcefa3f8);
    c = GG(c, d, a, b, x[k + 7], 14, 0x676f02d9);
    b = GG(b, c, d, a, x[k + 12], 20, 0x8d2a4c8a);

    a = HH(a, b, c, d, x[k + 5], 4, 0xfffa3942);
    d = HH(d, a, b, c, x[k + 8], 11, 0x8771f681);
    c = HH(c, d, a, b, x[k + 11], 16, 0x6d9d6122);
    b = HH(b, c, d, a, x[k + 14], 23, 0xfde5380c);
    a = HH(a, b, c, d, x[k + 1], 4, 0xa4beea44);
    d = HH(d, a, b, c, x[k + 4], 11, 0x4bdecfa9);
    c = HH(c, d, a, b, x[k + 7], 16, 0xf6bb4b60);
    b = HH(b, c, d, a, x[k + 10], 23, 0xbebfbc70);
    a = HH(a, b, c, d, x[k + 13], 4, 0x289b7ec6);
    d = HH(d, a, b, c, x[k + 0], 11, 0xeaa127fa);
    c = HH(c, d, a, b, x[k + 3], 16, 0xd4ef3085);
    b = HH(b, c, d, a, x[k + 6], 23, 0x4881d05);
    a = HH(a, b, c, d, x[k + 9], 4, 0xd9d4d039);
    d = HH(d, a, b, c, x[k + 12], 11, 0xe6db99e5);
    c = HH(c, d, a, b, x[k + 15], 16, 0x1fa27cf8);
    b = HH(b, c, d, a, x[k + 2], 23, 0xc4ac5665);

    a = II(a, b, c, d, x[k + 0], 6, 0xf4292244);
    d = II(d, a, b, c, x[k + 7], 10, 0x432aff97);
    c = II(c, d, a, b, x[k + 14], 15, 0xab9423a7);
    b = II(b, c, d, a, x[k + 5], 21, 0xfc93a039);
    a = II(a, b, c, d, x[k + 12], 6, 0x655b59c3);
    d = II(d, a, b, c, x[k + 3], 10, 0x8f0ccc92);
    c = II(c, d, a, b, x[k + 10], 15, 0xffeff47d);
    b = II(b, c, d, a, x[k + 1], 21, 0x85845dd1);
    a = II(a, b, c, d, x[k + 8], 6, 0x6fa87e4f);
    d = II(d, a, b, c, x[k + 15], 10, 0xfe2ce6e0);
    c = II(c, d, a, b, x[k + 6], 15, 0xa3014314);
    b = II(b, c, d, a, x[k + 13], 21, 0x4e0811a1);
    a = II(a, b, c, d, x[k + 4], 6, 0xf7537e82);
    d = II(d, a, b, c, x[k + 11], 10, 0xbd3af235);
    c = II(c, d, a, b, x[k + 2], 15, 0x2ad7d2bb);
    b = II(b, c, d, a, x[k + 9], 21, 0xeb86d391);

    a = addUnsigned(a, AA);
    b = addUnsigned(b, BB);
    c = addUnsigned(c, CC);
    d = addUnsigned(d, DD);
  }
  return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase();
}

export const CyberToolkit: React.FC<CyberToolkitProps> = ({ onInsertFlag, activeArtifact }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<ToolTab>('BASE64');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // TAB 1: Base64
  const [b64Input, setB64Input] = useState('');
  const [b64Mode, setB64Mode] = useState<'DECODE' | 'ENCODE'>('DECODE');
  const [b64Output, setB64Output] = useState('');

  // TAB 2: Caesar / ROT
  const [caesarInput, setCaesarInput] = useState('');
  const [caesarShift, setCaesarShift] = useState(3);
  const [caesarDirection, setCaesarDirection] = useState<'DECRYPT' | 'ENCRYPT'>('DECRYPT');
  const [caesarOutput, setCaesarOutput] = useState('');
  const [showAllShifts, setShowAllShifts] = useState(false);

  // TAB 3: Hex Converter
  const [hexInput, setHexInput] = useState('');
  const [hexMode, setHexMode] = useState<'HEX_TO_TEXT' | 'TEXT_TO_HEX'>('HEX_TO_TEXT');
  const [hexOutput, setHexOutput] = useState('');

  // TAB 4: Binary Converter
  const [binInput, setBinInput] = useState('');
  const [binMode, setBinMode] = useState<'BIN_TO_TEXT' | 'TEXT_TO_BIN' | 'BIN_TO_DEC'>('BIN_TO_TEXT');
  const [binOutput, setBinOutput] = useState('');

  // TAB 5: Hashes
  const [hashInput, setHashInput] = useState('');
  const [sha256Result, setSha256Result] = useState('');
  const [sha1Result, setSha1Result] = useState('');
  const [md5Result, setMd5Result] = useState('');

  // TAB 6: Helpers (URL, XOR, Reverse)
  const [helperInput, setHelperInput] = useState('');
  const [xorKey, setXorKey] = useState('k');
  const [urlDecoded, setUrlDecoded] = useState('');
  const [reversedText, setReversedText] = useState('');
  const [xorResult, setXorResult] = useState('');

  // Base64 processing with UTF-8 support
  useEffect(() => {
    if (!b64Input) {
      setB64Output('');
      return;
    }
    if (b64Mode === 'DECODE') {
      try {
        const clean = b64Input.trim().replace(/\s+/g, '');
        // Fix missing padding if needed
        const padLen = (4 - (clean.length % 4)) % 4;
        const padded = clean + '='.repeat(padLen);
        const binary = atob(padded);
        const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
        setB64Output(new TextDecoder().decode(bytes));
      } catch {
        // Fallback to standard atob
        try {
          setB64Output(atob(b64Input.trim()));
        } catch {
          setB64Output('Invalid Base64 string (check padding/characters)');
        }
      }
    } else {
      try {
        const bytes = new TextEncoder().encode(b64Input);
        const binString = Array.from(bytes, b => String.fromCharCode(b)).join('');
        setB64Output(btoa(binString));
      } catch {
        setB64Output('Error encoding to Base64');
      }
    }
  }, [b64Input, b64Mode]);

  // Caesar cipher processing preserving letter case and punctuation
  useEffect(() => {
    if (!caesarInput) {
      setCaesarOutput('');
      return;
    }
    const effectiveShift = caesarDirection === 'DECRYPT' ? (26 - (caesarShift % 26)) % 26 : caesarShift % 26;
    const res = caesarInput.split('').map(char => {
      const code = char.charCodeAt(0);
      // Uppercase A-Z (65 - 90)
      if (code >= 65 && code <= 90) {
        return String.fromCharCode(((code - 65 + effectiveShift) % 26) + 65);
      }
      // Lowercase a-z (97 - 122)
      if (code >= 97 && code <= 122) {
        return String.fromCharCode(((code - 97 + effectiveShift) % 26) + 97);
      }
      return char;
    }).join('');
    setCaesarOutput(res);
  }, [caesarInput, caesarShift, caesarDirection]);

  // Hex processing
  useEffect(() => {
    if (!hexInput) {
      setHexOutput('');
      return;
    }
    if (hexMode === 'HEX_TO_TEXT') {
      try {
        // Clean out 0x, \x, spaces, colons, commas
        const clean = hexInput.replace(/0x|\\x|[\s,:]+/gi, '');
        if (clean.length === 0) {
          setHexOutput('');
          return;
        }
        let str = '';
        for (let i = 0; i < clean.length; i += 2) {
          const byteHex = clean.substr(i, 2);
          if (byteHex.length === 2) {
            str += String.fromCharCode(parseInt(byteHex, 16));
          }
        }
        setHexOutput(str);
      } catch {
        setHexOutput('Error parsing hex bytes');
      }
    } else {
      try {
        const bytes = new TextEncoder().encode(hexInput);
        const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join(' ');
        setHexOutput(hex.toUpperCase());
      } catch {
        setHexOutput('Error converting text to hex');
      }
    }
  }, [hexInput, hexMode]);

  // Binary processing
  useEffect(() => {
    if (!binInput) {
      setBinOutput('');
      return;
    }
    if (binMode === 'BIN_TO_TEXT') {
      try {
        // Remove spaces and format into 8-bit chunks
        const clean = binInput.replace(/[^01]/g, '');
        let str = '';
        for (let i = 0; i < clean.length; i += 8) {
          const byte = clean.substr(i, 8);
          if (byte.length === 8) {
            str += String.fromCharCode(parseInt(byte, 2));
          }
        }
        setBinOutput(str || 'Enter 8-bit binary bytes (e.g. 01000011 01010100 01000110)');
      } catch {
        setBinOutput('Invalid binary format');
      }
    } else if (binMode === 'TEXT_TO_BIN') {
      try {
        const bytes = new TextEncoder().encode(binInput);
        const bin = Array.from(bytes, b => b.toString(2).padStart(8, '0')).join(' ');
        setBinOutput(bin);
      } catch {
        setBinOutput('Error converting text to binary');
      }
    } else {
      // Binary to Decimal
      const clean = binInput.replace(/[^01]/g, '');
      if (clean) {
        setBinOutput(parseInt(clean, 2).toString(10));
      } else {
        setBinOutput('Enter binary digits (0 or 1)');
      }
    }
  }, [binInput, binMode]);

  // Hashes processing
  useEffect(() => {
    if (!hashInput) {
      setSha256Result('');
      setSha1Result('');
      setMd5Result('');
      return;
    }

    setMd5Result(md5(hashInput));

    // Web Crypto for SHA-256 and SHA-1
    if (window.crypto && window.crypto.subtle) {
      const data = new TextEncoder().encode(hashInput);
      window.crypto.subtle.digest('SHA-256', data).then(buf => {
        const hex = Array.from(new Uint8Array(buf), b => b.toString(16).padStart(2, '0')).join('');
        setSha256Result(hex);
      }).catch(() => {});

      window.crypto.subtle.digest('SHA-1', data).then(buf => {
        const hex = Array.from(new Uint8Array(buf), b => b.toString(16).padStart(2, '0')).join('');
        setSha1Result(hex);
      }).catch(() => {});
    }
  }, [hashInput]);

  // Helpers processing (URL, XOR, Reverse)
  useEffect(() => {
    if (!helperInput) {
      setUrlDecoded('');
      setReversedText('');
      setXorResult('');
      return;
    }
    // URL Decode
    try {
      setUrlDecoded(decodeURIComponent(helperInput));
    } catch {
      setUrlDecoded('Invalid URL encoding');
    }
    // Reverse string
    setReversedText(helperInput.split('').reverse().join(''));

    // XOR
    if (xorKey) {
      const keyCodes = xorKey.split('').map(c => c.charCodeAt(0));
      const res = helperInput.split('').map((c, i) => {
        const k = keyCodes[i % keyCodes.length];
        return String.fromCharCode(c.charCodeAt(0) ^ k);
      }).join('');
      setXorResult(res);
    }
  }, [helperInput, xorKey]);

  const copyResult = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    sounds.playDing();
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleInsertFlag = (text: string) => {
    if (!text || !onInsertFlag) return;
    onInsertFlag(text);
    sounds.playCorrect();
  };

  const handleLoadArtifact = () => {
    if (!activeArtifact) return;
    // Auto populate active tab's input
    if (activeTab === 'BASE64') setB64Input(activeArtifact);
    else if (activeTab === 'CAESAR') setCaesarInput(activeArtifact);
    else if (activeTab === 'HEX') setHexInput(activeArtifact);
    else if (activeTab === 'BINARY') setBinInput(activeArtifact);
    else if (activeTab === 'HASH') setHashInput(activeArtifact);
    else setHelperInput(activeArtifact);
    sounds.playDing();
  };

  return (
    <div className="rounded-2xl border-2 border-cyan-500/40 bg-slate-950 shadow-2xl overflow-hidden">
      {/* Header Bar */}
      <div className="w-full px-4 py-3 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/60 flex items-center justify-between border-b border-cyan-500/20">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 text-xs font-black text-cyan-400 hover:text-cyan-300 cursor-pointer transition-colors"
        >
          <Terminal className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="tracking-wider uppercase font-mono">CYBER TOOLKIT & CIPHER CRACKER</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700">
            Live Tools
          </span>
        </button>

        <div className="flex items-center gap-2">
          {activeArtifact && (
            <button
              onClick={handleLoadArtifact}
              className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[11px] font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
              title="Auto-fill active riddle artifact into this tool"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Load Riddle Artifact</span>
            </button>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer transition-colors"
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="p-4 sm:p-5 space-y-4">
          {/* Tool Navigation Tabs */}
          <div className="flex items-center gap-1.5 border-b border-slate-800 pb-3 overflow-x-auto text-xs font-mono">
            {[
              { id: 'BASE64', label: 'Base64', icon: Code },
              { id: 'CAESAR', label: 'Caesar / ROT', icon: Key },
              { id: 'HEX', label: 'Hex Converter', icon: Terminal },
              { id: 'BINARY', label: 'Binary / Bits', icon: Binary },
              { id: 'HASH', label: 'Hash (MD5/SHA)', icon: Hash },
              { id: 'HELPERS', label: 'URL / XOR / Rev', icon: ArrowRightLeft }
            ].map(tab => {
              const active = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ToolTab)}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer transition-all shrink-0 ${
                    active
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* ======================================================== */}
          {/* TAB 1: BASE64 (ENCODE & DECODE) */}
          {/* ======================================================== */}
          {activeTab === 'BASE64' && (
            <div className="space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono">Mode:</span>
                <div className="flex rounded-lg bg-slate-900 border border-slate-800 p-0.5 font-mono text-[11px]">
                  <button
                    onClick={() => setB64Mode('DECODE')}
                    className={`px-3 py-1 rounded-md font-bold cursor-pointer transition-colors ${
                      b64Mode === 'DECODE' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Decode (Base64 → Text)
                  </button>
                  <button
                    onClick={() => setB64Mode('ENCODE')}
                    className={`px-3 py-1 rounded-md font-bold cursor-pointer transition-colors ${
                      b64Mode === 'ENCODE' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Encode (Text → Base64)
                  </button>
                </div>
              </div>

              <textarea
                value={b64Input}
                onChange={(e) => setB64Input(e.target.value)}
                placeholder={b64Mode === 'DECODE' ? 'Paste Base64 payload (e.g. Q1RGe0hBQ0tfVEhFX1BMQU5FVH0=)...' : 'Type plaintext to encode...'}
                rows={2}
                className="w-full bg-slate-900/90 border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none placeholder:text-slate-600 resize-none shadow-inner"
              />

              {b64Output && (
                <div className="p-3.5 rounded-xl bg-slate-900 border border-cyan-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                  <div className="min-w-0 flex-1">
                    <span className="text-slate-400 block sm:inline">Output: </span>
                    <strong className="text-cyan-300 font-bold break-all">{b64Output}</strong>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                    {onInsertFlag && (
                      <button
                        onClick={() => handleInsertFlag(b64Output)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        title="Submit directly into flag input"
                      >
                        <Flag className="w-3 h-3" />
                        <span>Insert Flag</span>
                      </button>
                    )}
                    <button
                      onClick={() => copyResult(b64Output, 'b64')}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                      title="Copy result"
                    >
                      {copiedId === 'b64' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: CAESAR / ROT */}
          {/* ======================================================== */}
          {activeTab === 'CAESAR' && (
            <div className="space-y-3 animate-in fade-in">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <div className="flex rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-[11px]">
                  <button
                    onClick={() => setCaesarDirection('DECRYPT')}
                    className={`px-2.5 py-1 rounded-md font-bold cursor-pointer transition-colors ${
                      caesarDirection === 'DECRYPT' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Decrypt (-Shift)
                  </button>
                  <button
                    onClick={() => setCaesarDirection('ENCRYPT')}
                    className={`px-2.5 py-1 rounded-md font-bold cursor-pointer transition-colors ${
                      caesarDirection === 'ENCRYPT' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Encrypt (+Shift)
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCaesarShift(13)}
                    className="px-2 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 font-bold text-[11px] cursor-pointer"
                  >
                    ROT13
                  </button>
                  <button
                    onClick={() => setShowAllShifts(!showAllShifts)}
                    className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <ListFilter className="w-3 h-3" />
                    <span>{showAllShifts ? 'Hide All 25' : 'Brute Force 25'}</span>
                  </button>
                </div>
              </div>

              <textarea
                value={caesarInput}
                onChange={(e) => setCaesarInput(e.target.value)}
                placeholder="Paste ciphertext (e.g. FDHVDU_FLSKHU_GHFRGHG)..."
                rows={2}
                className="w-full bg-slate-900/90 border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none placeholder:text-slate-600 resize-none shadow-inner"
              />

              {/* Shift Slider */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3 text-xs font-mono">
                <span className="text-slate-400 shrink-0">
                  Shift: <strong className="text-cyan-400">{caesarShift}</strong>
                </span>
                <input
                  type="range"
                  min={1}
                  max={25}
                  value={caesarShift}
                  onChange={(e) => setCaesarShift(parseInt(e.target.value, 10))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 shrink-0 font-mono">(A ↔ {String.fromCharCode(65 + caesarShift)})</span>
              </div>

              {caesarOutput && (
                <div className="p-3.5 rounded-xl bg-slate-900 border border-cyan-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                  <div className="min-w-0 flex-1">
                    <span className="text-slate-400 block sm:inline">Deciphered: </span>
                    <strong className="text-cyan-300 font-bold break-all">{caesarOutput}</strong>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                    {onInsertFlag && (
                      <button
                        onClick={() => handleInsertFlag(caesarOutput)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Flag className="w-3 h-3" />
                        <span>Insert Flag</span>
                      </button>
                    )}
                    <button
                      onClick={() => copyResult(caesarOutput, 'caesar')}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                      title="Copy result"
                    >
                      {copiedId === 'caesar' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              )}

              {/* All 25 Shifts Drawer */}
              {showAllShifts && caesarInput && (
                <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/30 space-y-2 max-h-48 overflow-y-auto">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-mono sticky top-0 bg-slate-950 pb-1">
                    All 25 Shift Results (Click to Use):
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs font-mono">
                    {Array.from({ length: 25 }, (_, i) => i + 1).map(shift => {
                      const text = caesarInput.split('').map(c => {
                        const code = c.charCodeAt(0);
                        if (code >= 65 && code <= 90) return String.fromCharCode(((code - 65 + (26 - shift)) % 26) + 65);
                        if (code >= 97 && code <= 122) return String.fromCharCode(((code - 97 + (26 - shift)) % 26) + 97);
                        return c;
                      }).join('');
                      return (
                        <div
                          key={shift}
                          onClick={() => { setCaesarShift(shift); setCaesarDirection('DECRYPT'); }}
                          className={`p-1.5 rounded border text-[11px] flex items-center justify-between cursor-pointer hover:bg-slate-800 ${
                            shift === caesarShift ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200' : 'border-slate-800 text-slate-300'
                          }`}
                        >
                          <span className="text-slate-500">ROT-{shift}:</span>
                          <span className="font-bold truncate max-w-[140px] text-white">{text}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleInsertFlag(text); }}
                            className="text-[10px] text-emerald-400 hover:underline"
                          >
                            Flag
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: HEX CONVERTER */}
          {/* ======================================================== */}
          {activeTab === 'HEX' && (
            <div className="space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono">Conversion:</span>
                <div className="flex rounded-lg bg-slate-900 border border-slate-800 p-0.5 font-mono text-[11px]">
                  <button
                    onClick={() => setHexMode('HEX_TO_TEXT')}
                    className={`px-3 py-1 rounded-md font-bold cursor-pointer transition-colors ${
                      hexMode === 'HEX_TO_TEXT' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Hex → ASCII Text
                  </button>
                  <button
                    onClick={() => setHexMode('TEXT_TO_HEX')}
                    className={`px-3 py-1 rounded-md font-bold cursor-pointer transition-colors ${
                      hexMode === 'TEXT_TO_HEX' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    ASCII Text → Hex
                  </button>
                </div>
              </div>

              <textarea
                value={hexInput}
                onChange={(e) => setHexInput(e.target.value)}
                placeholder={hexMode === 'HEX_TO_TEXT' ? 'Enter hex bytes (e.g. 50 4E 47 or 0x43 0x54 0x46)...' : 'Enter text to convert to hex bytes...'}
                rows={2}
                className="w-full bg-slate-900/90 border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none placeholder:text-slate-600 resize-none shadow-inner"
              />

              {hexOutput && (
                <div className="p-3.5 rounded-xl bg-slate-900 border border-cyan-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                  <div className="min-w-0 flex-1">
                    <span className="text-slate-400 block sm:inline">Result: </span>
                    <strong className="text-cyan-300 font-bold break-all">{hexOutput}</strong>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                    {onInsertFlag && (
                      <button
                        onClick={() => handleInsertFlag(hexOutput)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Flag className="w-3 h-3" />
                        <span>Insert Flag</span>
                      </button>
                    )}
                    <button
                      onClick={() => copyResult(hexOutput, 'hex')}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                      title="Copy result"
                    >
                      {copiedId === 'hex' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: BINARY CONVERTER */}
          {/* ======================================================== */}
          {activeTab === 'BINARY' && (
            <div className="space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono">Conversion:</span>
                <div className="flex rounded-lg bg-slate-900 border border-slate-800 p-0.5 font-mono text-[11px]">
                  <button
                    onClick={() => setBinMode('BIN_TO_TEXT')}
                    className={`px-2.5 py-1 rounded-md font-bold cursor-pointer transition-colors ${
                      binMode === 'BIN_TO_TEXT' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Binary → Text
                  </button>
                  <button
                    onClick={() => setBinMode('TEXT_TO_BIN')}
                    className={`px-2.5 py-1 rounded-md font-bold cursor-pointer transition-colors ${
                      binMode === 'TEXT_TO_BIN' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Text → Binary
                  </button>
                  <button
                    onClick={() => setBinMode('BIN_TO_DEC')}
                    className={`px-2.5 py-1 rounded-md font-bold cursor-pointer transition-colors ${
                      binMode === 'BIN_TO_DEC' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Binary → Decimal
                  </button>
                </div>
              </div>

              <textarea
                value={binInput}
                onChange={(e) => setBinInput(e.target.value)}
                placeholder={
                  binMode === 'BIN_TO_TEXT'
                    ? 'Enter 8-bit binary bytes (e.g. 01000011 01010100 01000110)...'
                    : binMode === 'BIN_TO_DEC'
                    ? 'Enter binary number (e.g. 01011010)...'
                    : 'Enter text to convert to binary...'
                }
                rows={2}
                className="w-full bg-slate-900/90 border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none placeholder:text-slate-600 resize-none shadow-inner"
              />

              {binOutput && (
                <div className="p-3.5 rounded-xl bg-slate-900 border border-cyan-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                  <div className="min-w-0 flex-1">
                    <span className="text-slate-400 block sm:inline">Result: </span>
                    <strong className="text-cyan-300 font-bold break-all">{binOutput}</strong>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                    {onInsertFlag && (
                      <button
                        onClick={() => handleInsertFlag(binOutput)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Flag className="w-3 h-3" />
                        <span>Insert Flag</span>
                      </button>
                    )}
                    <button
                      onClick={() => copyResult(binOutput, 'bin')}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                      title="Copy result"
                    >
                      {copiedId === 'bin' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: HASH GENERATOR (MD5 / SHA-1 / SHA-256) */}
          {/* ======================================================== */}
          {activeTab === 'HASH' && (
            <div className="space-y-3 animate-in fade-in">
              <input
                type="text"
                value={hashInput}
                onChange={(e) => setHashInput(e.target.value)}
                placeholder="Type text to compute hashes (e.g. password, admin, flag)..."
                className="w-full bg-slate-900/90 border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none placeholder:text-slate-600 shadow-inner"
              />

              <div className="space-y-2 text-xs font-mono">
                {/* MD5 */}
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1 truncate">
                    <span className="text-amber-400 font-bold mr-2">MD5:</span>
                    <span className="text-slate-300 select-all">{md5Result || '...'}</span>
                  </div>
                  {md5Result && (
                    <button
                      onClick={() => copyResult(md5Result, 'md5')}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                    >
                      {copiedId === 'md5' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                </div>

                {/* SHA-1 */}
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1 truncate">
                    <span className="text-blue-400 font-bold mr-2">SHA-1:</span>
                    <span className="text-slate-300 select-all">{sha1Result || '...'}</span>
                  </div>
                  {sha1Result && (
                    <button
                      onClick={() => copyResult(sha1Result, 'sha1')}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                    >
                      {copiedId === 'sha1' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                </div>

                {/* SHA-256 */}
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1 truncate">
                    <span className="text-emerald-400 font-bold mr-2">SHA-256:</span>
                    <span className="text-slate-300 select-all">{sha256Result || '...'}</span>
                  </div>
                  {sha256Result && (
                    <button
                      onClick={() => copyResult(sha256Result, 'sha256')}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                    >
                      {copiedId === 'sha256' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 6: HELPERS (URL, XOR, REVERSE) */}
          {/* ======================================================== */}
          {activeTab === 'HELPERS' && (
            <div className="space-y-3 animate-in fade-in">
              <input
                type="text"
                value={helperInput}
                onChange={(e) => setHelperInput(e.target.value)}
                placeholder="Enter string for URL decode, reversal, or XOR..."
                className="w-full bg-slate-900/90 border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none placeholder:text-slate-600 shadow-inner"
              />

              <div className="space-y-2 text-xs font-mono">
                {/* URL Decoded */}
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1 truncate">
                    <span className="text-cyan-400 font-bold mr-2">URL Decode:</span>
                    <span className="text-slate-300 select-all">{urlDecoded || '...'}</span>
                  </div>
                  {urlDecoded && (
                    <div className="flex items-center gap-1">
                      {onInsertFlag && (
                        <button
                          onClick={() => handleInsertFlag(urlDecoded)}
                          className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]"
                        >
                          Flag
                        </button>
                      )}
                      <button
                        onClick={() => copyResult(urlDecoded, 'url')}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                      >
                        {copiedId === 'url' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  )}
                </div>

                {/* Reversed */}
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1 truncate">
                    <span className="text-amber-400 font-bold mr-2">Reversed:</span>
                    <span className="text-slate-300 select-all">{reversedText || '...'}</span>
                  </div>
                  {reversedText && (
                    <div className="flex items-center gap-1">
                      {onInsertFlag && (
                        <button
                          onClick={() => handleInsertFlag(reversedText)}
                          className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]"
                        >
                          Flag
                        </button>
                      )}
                      <button
                        onClick={() => copyResult(reversedText, 'rev')}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                      >
                        {copiedId === 'rev' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  )}
                </div>

                {/* XOR */}
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-purple-400 font-bold">XOR with Key:</span>
                      <input
                        type="text"
                        value={xorKey}
                        onChange={(e) => setXorKey(e.target.value)}
                        placeholder="key"
                        className="w-16 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-white"
                      />
                    </div>
                    {xorResult && (
                      <div className="flex items-center gap-1">
                        {onInsertFlag && (
                          <button
                            onClick={() => handleInsertFlag(xorResult)}
                            className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]"
                          >
                            Flag
                          </button>
                        )}
                        <button
                          onClick={() => copyResult(xorResult, 'xor')}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                        >
                          {copiedId === 'xor' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="text-slate-300 select-all truncate">{xorResult || '...'}</div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

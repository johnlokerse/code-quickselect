const BICEP_PATTERNS = [
  /^[ \t]*(resource|module|func|type)\s+[\w-]+\b/gm
];

const POWERSHELL_PATTERNS = [
  /^[ \t]*function\s+[\w-]+\b/gm,
  /^[ \t]*class\s+\w+\b/gm,
  /^[ \t]*enum\s+\w+\b/gm
];

const CSHARP_PATTERNS = [
  /^[ \t]*(?:public|private|protected|internal|static|sealed|abstract|partial)?[ \t]*class\s+\w+\b/gm,
  /^[ \t]*(?:public|private|protected|internal|static|sealed|abstract|partial)?[ \t]*enum\s+\w+\b/gm,
  /^[ \t]*(?:public|private|protected|internal|static|virtual|override|abstract|async|sealed|partial|extern|unsafe|new)?[ \t]*[\w<>\[\],]+[ \t]+[A-Za-z_]\w*\s*\(/gm
];

export function getBicepPatterns(): RegExp[] {
  return BICEP_PATTERNS;
}

export function getPowerShellPatterns(): RegExp[] {
  return POWERSHELL_PATTERNS;
}

export function getCSharpPatterns(): RegExp[] {
  return CSHARP_PATTERNS;
}

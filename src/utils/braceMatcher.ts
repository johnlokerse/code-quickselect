import * as vscode from 'vscode';

interface CommentTokens {
  line: string[];
  block: Array<{ start: string; end: string }>;
}

function getCommentTokens(languageId: string): CommentTokens {
  if (languageId === 'powershell') {
    return {
      line: ['#'],
      block: [{ start: '<#', end: '#>' }]
    };
  }

  if (languageId === 'bicep') {
    return {
      line: ['//'],
      block: [{ start: '/*', end: '*/' }]
    };
  }

  return {
    line: ['//'],
    block: [{ start: '/*', end: '*/' }]
  };
}

function isEscaped(line: string, index: number): boolean {
  if (index <= 0) {
    return false;
  }

  if (line[index - 1] === '`') {
    return true;
  }

  let backslashCount = 0;
  for (let i = index - 1; i >= 0 && line[i] === '\\'; i--) {
    backslashCount++;
  }

  return backslashCount % 2 === 1;
}

function isDoubledQuote(line: string, index: number, quote: string): boolean {
  return line[index] === quote && line[index + 1] === quote;
}

function findTokenAt(line: string, index: number, tokens: string[]): string | null {
  for (const token of tokens) {
    if (line.startsWith(token, index)) {
      return token;
    }
  }

  return null;
}

function findBlockTokenAt(
  line: string,
  index: number,
  tokens: Array<{ start: string; end: string }>
): { start: string; end: string } | null {
  for (const token of tokens) {
    if (line.startsWith(token.start, index)) {
      return token;
    }
  }

  return null;
}

export function findMatchingBrace(
  document: vscode.TextDocument,
  startLine: number,
  languageId: string = document.languageId
): number | null {
  const tokens = getCommentTokens(languageId);
  let braceDepth = 0;
  let foundOpening = false;
  let inString = false;
  let stringChar = '';
  let inBlockComment = false;
  let blockCommentEnd = '';

  for (let lineNumber = startLine; lineNumber < document.lineCount; lineNumber++) {
    const line = document.lineAt(lineNumber).text;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (inBlockComment) {
        if (line.startsWith(blockCommentEnd, i)) {
          inBlockComment = false;
          i += blockCommentEnd.length - 1;
        }
        continue;
      }

      if (!inString) {
        const lineCommentToken = findTokenAt(line, i, tokens.line);
        if (lineCommentToken) {
          break;
        }

        const blockToken = findBlockTokenAt(line, i, tokens.block);
        if (blockToken) {
          inBlockComment = true;
          blockCommentEnd = blockToken.end;
          i += blockToken.start.length - 1;
          continue;
        }
      }

      if (!inString && (char === '"' || char === '\'')) {
        inString = true;
        stringChar = char;
        continue;
      }

      if (inString) {
        if (char === stringChar) {
          if (isDoubledQuote(line, i, stringChar)) {
            i += 1;
            continue;
          }

          if (!isEscaped(line, i)) {
            inString = false;
            stringChar = '';
          }
        }
        continue;
      }

      if (char === '{') {
        braceDepth++;
        foundOpening = true;
        continue;
      }

      if (char === '}') {
        if (foundOpening) {
          braceDepth--;
          if (braceDepth === 0) {
            return lineNumber;
          }
        }
      }
    }
  }

  return null;
}

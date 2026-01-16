import * as vscode from "vscode";

const PARAM_REGEX = /^[ \t]*param\s+\w+\b/;
const OUTPUT_REGEX = /^[ \t]*output\s+\w+\b/;
const DECORATOR_REGEX = /^[ \t]*@\w+/;
const LINE_COMMENT = "//";
const BLOCK_COMMENT_START = "/*";
const BLOCK_COMMENT_END = "*/";
const TRIPLE_QUOTE = "'''";

function isEscaped(line: string, index: number): boolean {
	if (index <= 0) {
		return false;
	}

	if (line[index - 1] === "`") {
		return true;
	}

	let backslashCount = 0;
	for (let i = index - 1; i >= 0 && line[i] === "\\"; i--) {
		backslashCount++;
	}

	return backslashCount % 2 === 1;
}

function isDoubledQuote(line: string, index: number, quote: string): boolean {
	return line[index] === quote && line[index + 1] === quote;
}

function isLineCommentStart(line: string, index: number): boolean {
	return line.startsWith(LINE_COMMENT, index);
}

function isBlockCommentStart(line: string, index: number): boolean {
	return line.startsWith(BLOCK_COMMENT_START, index);
}

function isBlockCommentEnd(line: string, index: number): boolean {
	return line.startsWith(BLOCK_COMMENT_END, index);
}

function isTripleQuote(line: string, index: number): boolean {
	return line.startsWith(TRIPLE_QUOTE, index);
}

export function isBicepParamLine(text: string): boolean {
	return PARAM_REGEX.test(text);
}

export function isBicepOutputLine(text: string): boolean {
	return OUTPUT_REGEX.test(text);
}

export function findBicepDeclarationRanges(
	document: vscode.TextDocument,
	kind: "param" | "output"
): Array<{ startLine: number; endLine: number }> {
	const ranges: Array<{ startLine: number; endLine: number }> = [];
	const isKindLine = kind === "param" ? isBicepParamLine : isBicepOutputLine;

	for (let lineNumber = 0; lineNumber < document.lineCount; lineNumber++) {
		const text = document.lineAt(lineNumber).text;

		if (!isKindLine(text)) {
			continue;
		}

		const startLine = findDecoratorStart(document, lineNumber);
		const endLine = findBicepDeclarationEnd(document, lineNumber);
		ranges.push({ startLine, endLine });
	}

	return ranges;
}

/**
 * Finds the start line of decorators preceding a param/output declaration.
 * Handles multi-line decorators like @allowed([...]) by tracking bracket depth.
 */
function findDecoratorStart(
	document: vscode.TextDocument,
	declarationLine: number
): number {
	let startLine = declarationLine;
	let bracketDepth = 0;
	let parenDepth = 0;
	let braceDepth = 0;
	let inMultiLineDecorator = false;

	for (let line = declarationLine - 1; line >= 0; line--) {
		const lineText = document.lineAt(line).text;
		const trimmed = lineText.trim();

		// Empty line breaks the decorator chain (unless we're inside a multi-line decorator)
		if (trimmed.length === 0) {
			if (inMultiLineDecorator) {
				continue;
			}
			break;
		}

		// Count brackets/parens/braces from right to left to track if we're inside a multi-line construct
		for (let i = lineText.length - 1; i >= 0; i--) {
			const char = lineText[i];
			if (char === "]") {
				bracketDepth++;
			} else if (char === "[") {
				bracketDepth--;
			} else if (char === ")") {
				parenDepth++;
			} else if (char === "(") {
				parenDepth--;
			} else if (char === "}") {
				braceDepth++;
			} else if (char === "{") {
				braceDepth--;
			}
		}

		// Check if we're inside a multi-line decorator (unclosed brackets/parens/braces)
		inMultiLineDecorator = bracketDepth > 0 || parenDepth > 0 || braceDepth > 0;

		// If this line starts a decorator, include it
		if (DECORATOR_REGEX.test(lineText)) {
			startLine = line;
			// Reset depths when we find a decorator start (we're now balanced for this decorator)
			if (bracketDepth <= 0 && parenDepth <= 0 && braceDepth <= 0) {
				inMultiLineDecorator = false;
			}
			continue;
		}

		// If we're inside a multi-line decorator, continue searching upward
		if (inMultiLineDecorator) {
			startLine = line;
			continue;
		}

		// Not a decorator and not inside multi-line decorator, stop
		break;
	}

	return startLine;
}

function findBicepDeclarationEnd(
	document: vscode.TextDocument,
	startLine: number
): number {
	let inString = false;
	let stringChar = "";
	let inMultiLineString = false;
	let inBlockComment = false;
	let braceDepth = 0;
	let bracketDepth = 0;
	let parenDepth = 0;
	let hasOpening = false;

	for (
		let lineNumber = startLine;
		lineNumber < document.lineCount;
		lineNumber++
	) {
		const line = document.lineAt(lineNumber).text;

		for (let i = 0; i < line.length; i++) {
			const char = line[i];

			// Handle multi-line string (triple-quoted)
			if (inMultiLineString) {
				if (isTripleQuote(line, i)) {
					inMultiLineString = false;
					i += TRIPLE_QUOTE.length - 1;
				}
				continue;
			}

			if (inBlockComment) {
				if (isBlockCommentEnd(line, i)) {
					inBlockComment = false;
					i += BLOCK_COMMENT_END.length - 1;
				}
				continue;
			}

			if (!inString) {
				if (isLineCommentStart(line, i)) {
					break;
				}

				if (isBlockCommentStart(line, i)) {
					inBlockComment = true;
					i += BLOCK_COMMENT_START.length - 1;
					continue;
				}

				// Check for triple-quoted multi-line string start
				if (isTripleQuote(line, i)) {
					inMultiLineString = true;
					i += TRIPLE_QUOTE.length - 1;
					continue;
				}
			}

			if (!inString && (char === '"' || char === "'")) {
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
						stringChar = "";
					}
				}
				continue;
			}

			if (char === "{") {
				braceDepth++;
				hasOpening = true;
				continue;
			}

			if (char === "}") {
				if (hasOpening) {
					braceDepth = Math.max(0, braceDepth - 1);
				}
				continue;
			}

			if (char === "[") {
				bracketDepth++;
				hasOpening = true;
				continue;
			}

			if (char === "]") {
				if (hasOpening) {
					bracketDepth = Math.max(0, bracketDepth - 1);
				}
				continue;
			}

			if (char === "(") {
				parenDepth++;
				hasOpening = true;
				continue;
			}

			if (char === ")") {
				if (hasOpening) {
					parenDepth = Math.max(0, parenDepth - 1);
				}
			}
		}

		if (
			hasOpening &&
			braceDepth === 0 &&
			bracketDepth === 0 &&
			parenDepth === 0
		) {
			return lineNumber;
		}

		if (!hasOpening && lineNumber === startLine) {
			return startLine;
		}
	}

	return startLine;
}

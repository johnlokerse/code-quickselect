import * as vscode from "vscode";

const PARAM_REGEX = /^[ \t]*param\s+\w+\b/;
const OUTPUT_REGEX = /^[ \t]*output\s+\w+\b/;
const DECORATOR_REGEX = /^[ \t]*@\w+/;
const LINE_COMMENT = "//";
const BLOCK_COMMENT_START = "/*";
const BLOCK_COMMENT_END = "*/";

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

		let startLine = lineNumber;
		for (
			let decoratorLine = lineNumber - 1;
			decoratorLine >= 0;
			decoratorLine--
		) {
			const decoratorText = document.lineAt(decoratorLine).text;
			if (DECORATOR_REGEX.test(decoratorText)) {
				startLine = decoratorLine;
				continue;
			}

			if (decoratorText.trim().length === 0) {
				break;
			}

			break;
		}

		const endLine = findBicepDeclarationEnd(document, lineNumber);
		ranges.push({ startLine, endLine });
	}

	return ranges;
}

function findBicepDeclarationEnd(
	document: vscode.TextDocument,
	startLine: number
): number {
	let inString = false;
	let stringChar = "";
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

import * as vscode from "vscode";

const HEADER_REGEX = /^\s*(#{1,6})\s+/;
const FENCE_REGEX = /^\s*(```|~~~)/;

export function findMarkdownSectionEnd(
	document: vscode.TextDocument,
	startLine: number
): number | null {
	const startText = document.lineAt(startLine).text;
	const startMatch = HEADER_REGEX.exec(startText);

	if (!startMatch) {
		return null;
	}

	const startLevel = startMatch[1].length;
	let inFence = false;
	let fenceMarker = "";

	for (let lineNumber = startLine + 1; lineNumber < document.lineCount; lineNumber++) {
		const text = document.lineAt(lineNumber).text;
		const fenceMatch = FENCE_REGEX.exec(text);

		if (fenceMatch) {
			const marker = fenceMatch[1];
			if (!inFence) {
				inFence = true;
				fenceMarker = marker;
			} else if (marker === fenceMarker) {
				inFence = false;
				fenceMarker = "";
			}
			continue;
		}

		if (inFence) {
			continue;
		}

		const headerMatch = HEADER_REGEX.exec(text);
		if (headerMatch) {
			const nextLevel = headerMatch[1].length;
			if (nextLevel <= startLevel) {
				return lineNumber - 1;
			}
		}
	}

	return document.lineCount - 1;
}

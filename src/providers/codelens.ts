import * as vscode from "vscode";
import {
	getBicepPatterns,
	getCSharpPatterns,
	getMarkdownPatterns,
	getPowerShellPatterns,
} from "./languagePatterns";
import {
	isBicepOutputLine,
	isBicepParamLine,
} from "../utils/bicepDeclarations";
import { logger } from "../utils/logger";

export class QuickSelectCodeLensProvider implements vscode.CodeLensProvider {
	provideCodeLenses(
		document: vscode.TextDocument,
		token: vscode.CancellationToken
	): vscode.CodeLens[] {
		const languageId = document.languageId;
		const patterns = this.getPatterns(languageId);

		if (patterns.length === 0) {
			return [];
		}

		const text = document.getText();
		const codelenses: vscode.CodeLens[] = [];
		const firstBicepParamLine =
			languageId === "bicep"
				? findFirstBicepDeclarationLine(document, isBicepParamLine)
				: null;
		const firstBicepOutputLine =
			languageId === "bicep"
				? findFirstBicepDeclarationLine(document, isBicepOutputLine)
				: null;

		for (const pattern of patterns) {
			const flags = pattern.flags.includes("g")
				? pattern.flags
				: `${pattern.flags}g`;
			const regex = new RegExp(pattern.source, flags);
			let match: RegExpExecArray | null;

			while ((match = regex.exec(text)) !== null) {
				if (token.isCancellationRequested) {
					return codelenses;
				}

				const position = document.positionAt(match.index);
				const line = document.lineAt(position.line);

				if (languageId === "bicep") {
					const lineText = line.text;
					if (isBicepParamLine(lineText)) {
						if (firstBicepParamLine === null) {
							continue;
						}
						if (position.line !== firstBicepParamLine) {
							continue;
						}
					}

					if (isBicepOutputLine(lineText)) {
						if (firstBicepOutputLine === null) {
							continue;
						}
						if (position.line !== firstBicepOutputLine) {
							continue;
						}
					}
				}

				codelenses.push(
					new vscode.CodeLens(line.range, {
						title: "Quick Select",
						command: "codequickselect.selectBlock",
						arguments: [document, position.line],
					})
				);
			}
		}

		return codelenses;
	}

	private getPatterns(languageId: string): RegExp[] {
		if (languageId === "bicep") {
			return getBicepPatterns();
		}

		if (languageId === "powershell") {
			return getPowerShellPatterns();
		}

		if (languageId === "csharp") {
			return getCSharpPatterns();
		}

		if (languageId === "markdown") {
			return getMarkdownPatterns();
		}

		logger.info(`Unsupported language: ${languageId}`);
		return [];
	}
}

function findFirstBicepDeclarationLine(
	document: vscode.TextDocument,
	matcher: (text: string) => boolean
): number | null {
	for (let lineNumber = 0; lineNumber < document.lineCount; lineNumber++) {
		if (matcher(document.lineAt(lineNumber).text)) {
			return lineNumber;
		}
	}

	return null;
}

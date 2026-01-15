import * as vscode from "vscode";
import {
	getBicepPatterns,
	getCSharpPatterns,
	getMarkdownPatterns,
	getPowerShellPatterns,
} from "./languagePatterns";
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

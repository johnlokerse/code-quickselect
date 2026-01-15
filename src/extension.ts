import * as vscode from "vscode";
import { QuickSelectCodeLensProvider } from "./providers/codelens";
import { findMatchingBrace } from "./utils/braceMatcher";
import { logger } from "./utils/logger";

export function activate(context: vscode.ExtensionContext): void {
	const codelensProvider = new QuickSelectCodeLensProvider();

	context.subscriptions.push(
		vscode.languages.registerCodeLensProvider("bicep", codelensProvider),
		vscode.languages.registerCodeLensProvider("powershell", codelensProvider),
		vscode.languages.registerCodeLensProvider("csharp", codelensProvider),
		vscode.commands.registerCommand(
			"codequickselect.selectBlock",
			(document: vscode.TextDocument, lineNumber: number) =>
				selectCodeBlock(document, lineNumber)
		)
	);

	logger.info("CodeQuickSelect extension activated");
}

async function selectCodeBlock(
	document: vscode.TextDocument,
	lineNumber: number
): Promise<void> {
	const editor = vscode.window.activeTextEditor;

	if (!editor || editor.document !== document) {
		vscode.window.showErrorMessage(
			"No active editor for the selected document"
		);
		return;
	}

	if (lineNumber < 0 || lineNumber >= document.lineCount) {
		vscode.window.showErrorMessage("Invalid line number for selection");
		return;
	}

	try {
		const endLine = findMatchingBrace(
			document,
			lineNumber,
			document.languageId
		);

		if (endLine === null) {
			vscode.window.showErrorMessage("No matching closing brace found");
			return;
		}

		const selection = new vscode.Selection(
			new vscode.Position(lineNumber, 0),
			new vscode.Position(endLine, document.lineAt(endLine).text.length)
		);

		editor.selection = selection;
		editor.revealRange(selection, vscode.TextEditorRevealType.InCenter);
	} catch (error) {
		vscode.window.showErrorMessage(`Error selecting block: ${String(error)}`);
	}
}

export function deactivate(): void {}

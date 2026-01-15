import * as vscode from 'vscode';

export function getLineText(document: vscode.TextDocument, lineNumber: number): string {
  return document.lineAt(lineNumber).text;
}

export function isLineEmptyOrWhitespace(text: string): boolean {
  return text.trim().length === 0;
}

export function lineHasOpeningBrace(text: string): boolean {
  return text.includes('{');
}

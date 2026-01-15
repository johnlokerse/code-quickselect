# CodeQuickSelect

CodeQuickSelect adds a quick-select CodeLens above common block declarations so you can select entire blocks with one click.

## Features

- CodeLens above Bicep and PowerShell block declarations
- One-click selection of the full code block
- Handles nested braces and skips strings/comments

## Supported Languages

- Bicep: resource, module, func, type
- PowerShell: function, class, enum

## Usage

1. Open a `.bicep` or `.ps1` file.
2. Click the `quick select` CodeLens above a declaration.
3. The full block is selected.

## Commands

- `codequickselect.selectBlock`: Select the code block for a declaration

## Development

- Build: `npm run esbuild`
- Watch: `npm run esbuild-watch`
- Tests: `npm test`

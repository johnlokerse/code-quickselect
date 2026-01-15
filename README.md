# Code QuickSelect

Code QuickSelect adds a quick-select CodeLens above common block declarations so you can select entire blocks with one click.

## Features

- CodeLens above Bicep, PowerShell, and C# block declarations
- One-click selection of the full code block
- Handles nested braces and skips strings/comments

## Supported Languages

- Bicep: resource, module, func, type
- PowerShell: function, class, enum
- C#: class, enum, method

## Usage

1. Open a `.bicep`, `.ps1`, or `.cs` file.
2. Click the `Quick Select` CodeLens above a declaration.
3. The full block is selected.

## Commands

- `codequickselect.selectBlock`: Select the code block for a declaration

# Code QuickSelect

Code QuickSelect adds a quick-select CodeLens above common block declarations so you can select entire blocks with one click.

![Code QuickSelect in action](InAction.gif)


## Features

- CodeLens above Bicep, PowerShell, C#, and Markdown headers
- One-click selection of the full code block
- Bicep param/output selection highlights all declarations at once
- Handles nested braces and skips strings/comments

## Supported Languages

- Bicep: resource, module, func, type, param, output
- PowerShell: function, class, enum
- C#: class, enum, method
- Markdown: headers (ATX `#` style)

## Usage

1. Open a `.bicep`, `.ps1`, `.cs`, or `.md` file.
2. Click the `Quick Select` CodeLens above a declaration or header.
3. The full block or section is selected.

## Commands

- `codequickselect.selectBlock`: Select the code block for a declaration

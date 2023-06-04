import * as vscode from 'vscode'
import * as path from 'path'
import * as fs from 'fs'

export function parseJsonPath(
  filePath: string,
  line: string,
  character: number
) {
  const name = path.basename(filePath)

  if (name === 'plugin.json') {
    const dir = path.dirname(filePath)

    const matches = line.match(
      /"(logo|main|preload|icon)": *"([a-zA-Z0-9/. -_]+)",*/
    )
    if (matches) {
      const key = matches[1]
      const value = matches[2]
      const offset = (matches.index ?? 0) + key.length + 4
      if (character >= offset) {
        return path.resolve(dir, value)
      }
    }
  }
}

function getDestPath(document: vscode.TextDocument, position: vscode.Position) {
  return parseJsonPath(
    document.fileName,
    document.lineAt(position).text,
    position.character
  )
}

function getPathDefinitionProvider() {
  return vscode.languages.registerDefinitionProvider(['json'], {
    provideDefinition(document, position, token) {
      const destPath = getDestPath(document, position)
      if (destPath && fs.existsSync(destPath)) {
        return new vscode.Location(
          vscode.Uri.file(destPath),
          new vscode.Position(0, 0)
        )
      }
    }
  })
}

function getPathCompletionItemProvider() {
  return vscode.languages.registerCompletionItemProvider(
    ['json'],
    {
      provideCompletionItems(document, position, token, context) {
        const linePrefix = document
          .lineAt(position)
          .text.substring(0, position.character)

        if (/"(logo|main|preload|icon)":/.test(linePrefix)) {
          const startPos = linePrefix.lastIndexOf('"')
          const endPos = linePrefix.lastIndexOf('/')

          const subdirname =
            startPos !== -1 && endPos !== -1
              ? linePrefix.substring(startPos + 1, endPos)
              : ''

          const dir = path.dirname(document.fileName)
          const name = path.basename(document.fileName)
          const subdir = path.resolve(dir, subdirname)
          const items = fs.readdirSync(subdir)
          return items
            .filter((item) => item !== name)
            .map((item) => {
              const stat = fs.statSync(path.join(subdir, item))
              return new vscode.CompletionItem(
                item,
                stat.isFile()
                  ? vscode.CompletionItemKind.File
                  : vscode.CompletionItemKind.Folder
              )
            })
        }
      }
    },
    ...['/', '"']
  )
}

function getFileSize(size: number) {
  if (size > 1000_000) return (size / 1000_000).toFixed(2) + ' MB'
  if (size > 1000) return (size / 1000).toFixed(2) + ' KB'
  return size + ' B'
}

function getFileType(filePath: string) {
  const ext = path.extname(filePath)
  if (/[mc]?js/.test(ext)) return 'JavaScript'
  if (/ts/.test(ext)) return 'TypeScript'
  if (/html/.test(ext)) return 'HTML'
  if (/png/.test(ext)) return 'PNG'
  if (/(jpg|jpeg)/.test(ext)) return 'JPEG'
  if (/svg/.test(ext)) return 'SVG'
  return ''
}

function getPathHoverProvider() {
  return vscode.languages.registerHoverProvider(['json'], {
    provideHover(document, position, token) {
      const destPath = getDestPath(document, position)
      if (destPath && fs.existsSync(destPath)) {
        const stat = fs.statSync(destPath)
        const lines = [`大小：${getFileSize(stat.size)}`]
        const fileType = getFileType(destPath)
        if (fileType) {
          lines.push(`类型：${fileType}`)
        }
        return new vscode.Hover(lines.join('\n\n'))
      }
    }
  })
}

export const providers = [
  getPathDefinitionProvider(),
  getPathCompletionItemProvider(),
  getPathHoverProvider()
]

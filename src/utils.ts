import * as vscode from 'vscode'

export async function openAndShowFile(file: string) {
  const doc = await vscode.workspace.openTextDocument(file)
  await vscode.window.showTextDocument(doc)
}

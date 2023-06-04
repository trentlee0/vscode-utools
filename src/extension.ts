import * as vscode from 'vscode'
import * as path from 'path'
import { providers } from './providers'
import { SharedState } from './type'
import { getCreateConfigCommand, getOpenConfigCommand } from './commands'

function setConfigStatusBar(
  state: SharedState,
  item: vscode.StatusBarItem,
  editor: vscode.TextEditor | undefined
) {
  if (
    editor === undefined ||
    state.pluginConfigFile === undefined ||
    path.basename(editor.document.fileName) === 'plugin.json'
  ) {
    item.hide()
  } else {
    const { fileName } = editor.document
    const exts = ['.js', '.jsx', '.ts', '.tsx', '.vue', '.html']
    if (
      exts.includes(path.extname(fileName)) &&
      fileName.lastIndexOf('.config') === -1
    ) {
      item.show()
    }
  }
}

function createConfigStatusBar(state: SharedState) {
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right
  )
  statusBarItem.tooltip = '打开插件配置文件'
  statusBarItem.text = 'uTools Plugin'
  statusBarItem.command = 'utools.openConfig'

  vscode.window.onDidChangeActiveTextEditor((e) => {
    setConfigStatusBar(state, statusBarItem, e)
  })

  return statusBarItem
}

export function activate(context: vscode.ExtensionContext) {
  const state: SharedState = {}
  const configStatusBar = createConfigStatusBar(state)

  vscode.workspace.findFiles('**/plugin.json', 'dist/**', 1).then((files) => {
    state.pluginConfigFile = files[0]
    setConfigStatusBar(state, configStatusBar, vscode.window.activeTextEditor)
  })

  context.subscriptions.push(
    getCreateConfigCommand(state),
    getOpenConfigCommand(state),
    configStatusBar,
    ...providers
  )
}

export function deactivate() {}

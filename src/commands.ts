import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'
import { openAndShowFile } from './utils'
import { SharedState } from './type'

export function getCreateConfigCommand(state: SharedState) {
  return vscode.commands.registerCommand('utools.createConfig', async () => {
    if (state.pluginConfigFile && fs.existsSync(state.pluginConfigFile.path)) {
      vscode.window.showInformationMessage('uTools 插件配置文件已存在！')
    } else {
      const { workspaceFolders } = vscode.workspace
      if (workspaceFolders) {
        const workspaceDir = workspaceFolders[0].uri.path
        const dirs: vscode.QuickPickItem[] = [
          { label: '/' },
          { label: '/src' },
          { label: '/public' }
        ].filter((item) => fs.existsSync(path.join(workspaceDir, item.label)))
        const res = await vscode.window.showQuickPick(dirs, {
          placeHolder: '新建到'
        })
        if (res) {
          const targetDir = path.join(workspaceDir, res.label)
          const filePath = path.join(targetDir, 'plugin.json')
          const configText =
            '{\n  "main": "index.html",\n  "logo": "logo.png",\n  "features": [\n    {\n      "code": "hello",\n      "explain": "hello world",\n      "cmds": ["hello", "你好"]\n    }\n  ]\n}'
          fs.writeFileSync(filePath, configText)
          await openAndShowFile(filePath)
          state.pluginConfigFile = vscode.Uri.file(filePath)
        } else {
          state.pluginConfigFile = undefined
        }
      }
    }
  })
}

export function getOpenConfigCommand(state: SharedState) {
  return vscode.commands.registerCommand('utools.openConfig', async () => {
    if (state.pluginConfigFile) {
      await openAndShowFile(state.pluginConfigFile.path)
    }
  })
}

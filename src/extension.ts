import * as vscode from 'vscode'
import { emojify, initialiseDecorations } from './emojify'

export function activate(context: vscode.ExtensionContext) {
  console.log('Emojification enabled!')

  let emojis = initialiseDecorations()

  vscode.extensions.onDidChange(() =>
    vscode.window.visibleTextEditors.forEach((editor) =>
      emojify(editor, emojis)
    )
  )

  context.subscriptions.push(
    vscode.window.onDidChangeVisibleTextEditors((editor) => {
      editor.forEach((editor) => emojify(editor, emojis))
    })
  )

  vscode.window.visibleTextEditors.forEach((editor) => emojify(editor, emojis))
}

export function deactivate() {}

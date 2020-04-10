import * as vscode from 'vscode'
import { emojify, initialiseDecorations } from './emojify'

export function activate(context: vscode.ExtensionContext) {
  console.log('Emojification enabled!')

  let emojis = initialiseDecorations()
  let lastUsed: { [editor: string]: string[] } = {}

  vscode.extensions.onDidChange(() =>
    vscode.window.visibleTextEditors.forEach(
      (editor) => (lastUsed[editor.toString()] = emojify(editor, emojis))
    )
  )

  context.subscriptions.push(
    vscode.window.onDidChangeVisibleTextEditors((editor) => {
      lastUsed = {}
      editor.forEach(
        (editor) => (lastUsed[editor.toString()] = emojify(editor, emojis))
      )
    }),

    vscode.workspace.onDidChangeTextDocument((event) => {
      if (event.contentChanges.length > 0) {
        vscode.window.visibleTextEditors.forEach((editor) => {
          if (editor.document.uri === event.document.uri) {
            lastUsed[editor.toString()] = emojify(
              editor,
              emojis,
              lastUsed[editor.toString()]
            )
          }
        })
      }
    })
  )

  vscode.window.visibleTextEditors.forEach(
    (editor) => (lastUsed[editor.toString()] = emojify(editor, emojis))
  )
}

export function deactivate() {}

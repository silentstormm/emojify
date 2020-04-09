import * as vscode from 'vscode'
const emojilib = require('emojilib')

export function initialiseDecorations() {
  let decorations: { [emoji: string]: vscode.TextEditorDecorationType } = {}

  for (const keyword in emojilib.lib) {
    if (emojilib.lib.hasOwnProperty(keyword)) {
      decorations[
        emojilib.lib[keyword].char
      ] = vscode.window.createTextEditorDecorationType({
        before: { contentText: emojilib.lib[keyword].char },
      })
      // console.log(
      //   `Creating decoration: ${emojilib.lib[keyword].char}`,
      //   decorations[emojilib.lib[keyword].char]
      // )
    }
  }

  return decorations
}

function getEmoji(word: string) {
  console.log(`Emojifying: ${word}`)

  word = word.trim().toLowerCase()

  if (!word || word === '' || word === 'it') return null

  // Maybe this is a plural word but the keyword is the singular?
  var maybeSingular = ''
  if (word[word.length - 1] == 's')
    maybeSingular = word.slice(0, word.length - 1)

  // Maybe this is a singular word but the keyword is the plural?
  // Don't do this for single letter since that will pluralize crazy things.
  var maybePlural = word.length == 1 ? '' : word + 's'

  // Go through all the things and find the first one that matches.
  for (var emoji in emojilib.lib) {
    var keywords = emojilib.lib[emoji].keywords
    if (
      emoji == word ||
      emoji == maybeSingular ||
      emoji == maybePlural ||
      (keywords && keywords.indexOf(word) >= 0) ||
      (keywords && keywords.indexOf(maybeSingular) >= 0) ||
      (keywords && keywords.indexOf(maybePlural) >= 0)
    ) {
      console.log(`Got emoji: ${emojilib.lib[emoji].char}`)
      return emojilib.lib[emoji].char
    }
  }
  return null
}

export function emojify(
  target: vscode.TextEditor,
  decorations: { [emoji: string]: vscode.TextEditorDecorationType }
) {
  console.log('Decorating...')

  let sourceCode = target.document.getText()
  let decorationArray: { [emoji: string]: vscode.DecorationOptions[] } = {}

  console.log(`Source code: ${sourceCode}`)

  let sourceLines = sourceCode.split('\n')

  sourceLines.forEach((line, lineindex) => {
    console.log(`line ${lineindex}: ${line}`)

    let words = line.split(/[^\w]/)

    let index = 0
    words.forEach((word) => {
      console.log(`word at column ${index + 1}: ${word}`)

      let emoji = getEmoji(word)
      if (emoji) {
        if (!decorationArray[emoji]) {
          decorationArray[emoji] = []
        }

        let range = new vscode.Range(
          new vscode.Position(lineindex, index),
          new vscode.Position(lineindex, index + word.length)
        )
        decorationArray[emoji].push({ range })
      }

      index += word.length
      index++
    })
  })

  console.log(decorationArray)

  const editors = vscode.window.visibleTextEditors.filter(
    (editor) => target.document.uri === editor.document.uri
  )

  for (const decoration in decorationArray) {
    if (decorations.hasOwnProperty(decoration)) {
      editors.forEach((editor) =>
        editor.setDecorations(
          decorations[decoration],
          decorationArray[decoration]
        )
      )
    }
  }
}

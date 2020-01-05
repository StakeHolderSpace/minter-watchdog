import telegram from '@/api/telegram'
import { errHandler } from '@/assets/utils'
import { CONFIG } from '@/assets/variables'

let telegramMessageId = null

const shutdownMessage = '\ud83d\uded1 *Выключаю валидатор*'
const errorMessage = '\u203c\ufe0f Пропущен блок *\ud83d\udd51 {{date}}*\n*{{moniker}}*'
const statusMessage =
        'Unsigned {{missedBlocks}} of {{maxErrorRate}}\n' +
        '`{{diagram}}`\n\n' +
        '*{{moniker}}* \ud83d\udd51 {{date}}'

function filterMarkdown (string) {
  return string
    .replace(/\n/g, ' ')
    .replace(/\*/g, '')
    .replace(/`/g, '')
}

function updateLastMessageId (id) {
  if (id > telegramMessageId || 0) {
    telegramMessageId = id
  }
}

function resetLastMessageid (id) {
  if (id > telegramMessageId || 0) {
    telegramMessageId = null
  }
}

function formatDate (time) {
  const date = new Date(time)
  return date.toLocaleTimeString('ru', {
    weekday: 'short',
    hour   : '2-digit',
    minute : '2-digit',
    second : '2-digit'
  })
}

export default {
  updateStatus: (() => {
    let lastMessageTime = new Date(),
        lastMissedCount = 0

    return function ({ missedCount, missedDiagram }) {

      const text = statusMessage
        .replace('{{moniker}}', CONFIG.telegram.msgTitle)
        .replace('{{missedBlocks}}', missedCount)
        .replace('{{maxErrorRate}}', CONFIG.errMaxNum.toString())
        .replace('{{diagram}}', missedDiagram)
        .replace('{{date}}', formatDate(new Date()))

      // Если есть пропущенные блоки, обновляем статус каждую итерацию,
      // иначе - раз в 10 сек, чтобы не насиловать бот апи.
      const shouldUpdateMessage = (missedCount > lastMissedCount) || (new Date() - lastMessageTime.getTime()) / 1000 > 0

      if (telegramMessageId) {
        if (shouldUpdateMessage) {
          telegram.editMessageText({ text, message_id: telegramMessageId }).catch(errHandler)
          lastMessageTime = new Date()
        }
      } else {
        telegram.sendMessage({ text }).then(({ data: { result: { message_id } } }) => {

          updateLastMessageId(message_id)
          lastMessageTime = new Date()

        }).catch(errHandler)

      }

      console.log(filterMarkdown(text))

      lastMissedCount = missedCount

    }
  })(),

  reportMissingBlock () {
    const params = {
      disable_notification: false,
      text                : errorMessage
        .replace('{{date}}', formatDate(new Date()))
        .replace('{{moniker}}', CONFIG.telegram.msgTitle)
    }

    telegram.sendMessage(params).then(({ data: { result: { message_id } } }) => {
      resetLastMessageid(message_id)
    }).catch(errHandler)

    console.error(filterMarkdown(params.text))
  },

  reportValidatorShutdown () {
    const params = {
      text                : shutdownMessage,
      disable_notification: false
    }

    telegram.sendMessage(params).then(({ data: { result: { message_id } } }) => {
      resetLastMessageid(message_id)
    }).catch(errHandler)

    console.error(filterMarkdown(params.text))
  }
}

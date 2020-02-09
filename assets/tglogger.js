import telegram from '../api/telegram'
import { errHandler } from './utils'
import { CONFIG } from './variables'

let telegramMessageId = null

const shutdownMessage = '\ud83d\uded1 *Выключаю валидатор* \n *\ud83d\udd51 {{date}}* {{moniker}}'
const missedBlockMessage = '\u203c\ufe0f Пропущен блок \n *\ud83d\udd51 {{date}}* {{moniker}}*'
const statusMessage =
        'Пропущено *{{missedBlocks}}* из {{maxMissed}} блоков \n' +
        '{{diagram}} \n\n' +
        '*\ud83d\udd51 {{date}}* {{moniker}}*'

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

function resetLastMessageId (id) {
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
  /**
   *
   */
  updateStatus: (() => {
    let lastMessageTime = new Date()

    return function ({ missedCount, maxMissed, missedDiagram }) {

      const text = statusMessage
        .replace('{{missedBlocks}}', missedCount)
        .replace('{{maxMissed}}', maxMissed.toString())
        .replace('{{diagram}}', missedDiagram)
        .replace('{{date}}', formatDate(new Date()))
        .replace('{{moniker}}', CONFIG.telegram.botMsgSign)

      // Если есть пропущенные блоки, обновляем статус каждую итерацию,
      // иначе - раз в 5 сек, чтобы не насиловать бот апи.
      const canUpdateMessage = (new Date().getTime() - lastMessageTime.getTime()) / 1000 > 3

      // если ранее сообщение отправляли , то меняем в нем текст
      if (telegramMessageId) {
        if (canUpdateMessage) {
          telegram
            .editMessageText({ text, message_id: telegramMessageId })
            .catch(err => {console.log(`Telegram err:`, err.message)})
            .finally(() => { lastMessageTime = new Date() })
        }
      }
      // Если это первое сообщение, то просто его отправляем
      else {
        telegram
          .sendMessage({ text })
          .then(({ data: { result: { message_id } } }) => updateLastMessageId(message_id))
          .catch(err => {console.log(`Telegram err:`, err.message)})
          .finally(() => { lastMessageTime = new Date() })
      }

    }
  })(),

  /**
   *
   */
  reportMissingBlock () {
    const params = {
      disable_notification: false,
      text                : missedBlockMessage
        .replace('{{date}}', formatDate(new Date()))
        .replace('{{moniker}}', CONFIG.telegram.botMsgSign)
    }

    telegram
      .sendMessage(params)
      .then(({ data: { result: { message_id } } }) => updateLastMessageId(message_id))
      .catch(err => {console.log(`Telegram err:`, err.message)})
  },

  reportValidatorShutdown () {
    const params = {
      disable_notification: false,
      text                : shutdownMessage
        .replace('{{date}}', formatDate(new Date()))
        .replace('{{moniker}}', CONFIG.telegram.botMsgSign)
    }

    telegram
      .sendMessage(params)
      .then(({ data: { result: { message_id } } }) => resetLastMessageId(message_id))
      .catch(err => {console.log(`Telegram err:`, err.message)})
  }
}

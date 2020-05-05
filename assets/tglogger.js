import telegram from '../api/telegram'
import { errHandler } from './utils'
import { CONFIG } from './variables'

let telegramMessageId = null

const successCmdMsg = '\ud83d\uded1 *Команда отправлена:* \n\n' +
  'txHash: {{tx_hash}} \n\n' +
  '*{{moniker}}* \ud83d\udd51 {{date}}'
const missedBlockMessage = '\u203c\ufe0f Пропущен блок \n *{{moniker}}* \ud83d\udd51 {{date}}'
const statusMessage =
        'Пропущено *{{missedBlocks}}* из {{maxMissed}} блоков \n\n' +
        '{{diagram}} \n\n' +
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
    /**
     *
     */
    return async ({ missedCount, maxMissed, missedDiagram })=> {

      const text = statusMessage
        .replace('{{missedBlocks}}', missedCount)
        .replace('{{maxMissed}}', maxMissed.toString())
        .replace('{{diagram}}', missedDiagram.replace(/_/gi,'- ').replace(/x/gi,'# '))
        .replace('{{date}}', formatDate(new Date()))
        .replace('{{moniker}}', CONFIG.telegram.botMsgSign)

      // обновляем статус раз в 10 сек, чтобы не насиловать бот апи.
      const canUpdateMessage = (new Date().getTime() - lastMessageTime.getTime()) / 1000 >= 10

      // если ранее сообщение отправляли , то меняем в нем текст
      if (telegramMessageId) {
        if (canUpdateMessage) {
          return telegram
            .editMessageText({ text, message_id: telegramMessageId })
            .catch(err => {console.log(`Telegram err:`, err.description || err.message)})
            .finally(() => { lastMessageTime = new Date() })
        }
        return  Promise.resolve()
      }
      // Если это первое сообщение, то просто его отправляем
      else {
        return telegram
          .sendMessage({ text })
          .then(({ data: { result: { message_id } } }) => updateLastMessageId(message_id))
          .catch(err => {console.log(`Telegram err:`, err.description || err.message)})
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

    return telegram
      .sendMessage(params)
      .then(({ data: { result: { message_id } } }) => updateLastMessageId(message_id))
      .catch(err => {console.log(`Telegram err:`, err.description || err.message)})
  },


  reportSuccessCmd({txHash}) {
    const params = {
      disable_notification: false,
      text                : successCmdMsg
        .replace('{{tx_hash}}', txHash.toString())
        .replace('{{date}}', formatDate(new Date()))
        .replace('{{moniker}}', CONFIG.telegram.botMsgSign)
    }

    return telegram
      .sendMessage(params)
      .then(({ data: { result: { message_id } } }) => resetLastMessageId(message_id))
      .catch(err => {console.log(`Telegram err:`, err.description || err.message)})
  }
}

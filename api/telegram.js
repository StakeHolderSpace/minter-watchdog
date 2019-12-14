import axios from 'axios'
import { errHandler } from '@/assets/utils'
import { CONFIG } from '@/assets/variables'

const http = axios.create({
  baseURL: `https://api.telegram.org/bot${CONFIG.telegram.botKey}`
})

http.interceptors.response.use((response) => {
    return response
  },
  function (error) {
    if ('ECONNRESET' !== error.code && error.response) {
      // Do something with response error
      if (error.response.status === 401) {
        console.error(error.response.data)
      }
      return Promise.reject(error.response.data)

    }
    else {
      console.error('The connection was reset!')
      return Promise.reject(error)
    }
  })

function getRequestParams (args) {
  return Object.assign({
    chat_id             : CONFIG.telegram.chatId,
    disable_notification: true,
    parse_mode          : 'Markdown'
  }, args)
}

export default {
  getMe () {
    return http.get('getMe')
  },

  sendMessage ({ ...args }) {
    return http.get('sendMessage', {
      params: getRequestParams(args)
    }).catch(errHandler)
  },

  editMessageText ({ ...args }) {
    return http.get('editMessageText', {
      params: getRequestParams(args)
    }).catch(errHandler)
  },

  deleteMessage ({ ...args }) {
    return http.get('deleteMessage', {
      params: getRequestParams(args)
    }).catch(errHandler)
  }
}

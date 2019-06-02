import axios from 'axios'
import config from '../config'
import { handleError } from '../assets/utils'

const http = axios.create({
  baseURL: `https://api.telegram.org/bot${config.telegram.bot_key}`
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

    } else {
      console.error('The connection was reset!')
      return Promise.reject(error)
    }
  })

function getRequestParams (args) {
  return Object.assign({
    chat_id             : config.telegram.chat_id,
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
    }).catch(handleError)
  },

  editMessageText ({ ...args }) {
    return http.get('editMessageText', {
      params: getRequestParams(args)
    }).catch(handleError)
  },

  deleteMessage ({ ...args }) {
    return http.get('deleteMessage', {
      params: getRequestParams(args)
    }).catch(handleError)
  }
}

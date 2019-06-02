import axios from 'axios'
import config from '../config'
import { handleError } from '../assets/utils'

const http = axios.create({
  baseURL          : config.api.endpoint,
  transformResponse: [
    function (response) {
      if (!response.startsWith('{')) {
        return response
      }
      const data = JSON.parse(response)
      return ('result' in data)
        ? data.result
        : data
    }]
})

http.interceptors.response.use((response) => {
  return response
}, function (error) {
  if ('ECONNRESET' !== error.code && error.response) {
    // Do something with response error
    if (error.response.status === 401) {
      console.error(error.response.data)
    }
    return Promise.reject(error.response.data)
  } else {
    console.error('The connection was reset!')
    return Promise.reject('ECONNRESET')
  }
})

export default {
  getStatus () {
    return http.get('/status').catch(handleError)

  },

  getBlock (height) {
    return http.get('/block', {
      params: { height }
    }).catch(handleError)

  },
  getValidators () {
    return http.get('/validators').catch(handleError)

  }
}

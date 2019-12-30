import MinterApi from 'minter-js-sdk/dist/cjs/api'
import PostTx from 'minter-js-sdk/dist/cjs/api/post-tx'
import GetNonce from 'minter-js-sdk/dist/cjs/api/get-nonce'

import { CHAIN_ID, NODE_API_URL, NODE_API_PJ_ID, NODE_API_PJ_SECRET } from '@/assets/variables'

const http = new MinterApi({
  apiType: 'node',
  baseURL: NODE_API_URL,
  chainId: CHAIN_ID,
  timeout: 5000,
  headers: {
    'Content-Type'    : 'application/json',
    'X-Project-Id'    : NODE_API_PJ_ID || '',
    'X-Project-Secret': NODE_API_PJ_SECRET || ''
  }
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

/**
 *
 * @type {Function<Promise>}
 */
export const postTx = new PostTx(http)

/**
 *
 * @type {function(*): Promise<number>}
 */
export const getNonce = new GetNonce(http)

export const getStatus = () => {
  return http.get('/status')
    .then(response => {
      return response.data.result
    })

}

export const getBlock = (height, params = {}) => {
  return http.get('/block', { params: { height, ...params } })
    .then(response => {
      return response.data.result
    })
}

export const getValidators = (height, params = {}) => {
  return http.get('/validators', { params: { height, ...params } })
    .then(response => {
      return response.data.result
    })
}

/**
 *
 * @param pubKey
 * @param params
 * @returns {PromiseLike<any> | Promise<any>}
 */
export const getCandidate = (pubKey, params = {}) => {
  return http.get(`/candidate`, { params: { pub_key: pubKey, ...params } })
    .then(response => {
      return response.data.result
    })
}

/**
 *
 * @param address
 * @param params
 * @returns {Promise<AxiosResponse<any> | never>}
 */
export const getBalance = (address, params = {}) => {

  return http.get(`/address`, { params: { address: address, ...params } })
    .then(response => {
      return response.data.result.balance
    })
}

/**
 *
 * @param pubKey
 * @param params
 * @returns {Promise<SpeechRecognitionEvent | SVGAnimatedString | string | ArrayBuffer>}
 */
export const getMissedBlocks = (pubKey, params = {}) => {

  return http.get(`/missed_blocks`, { params: { pub_key: pubKey, ...params } })
    .then(response => {
      return response.data.result
    })
}

export default {
  postTx,
  getNonce,
  getStatus,
  getValidators,
  getBlock,
  getBalance,
  getCandidate,
  getMissedBlocks
}

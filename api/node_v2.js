import MinterApi from 'minter-js-sdk/dist/cjs/api'
import PostTx from 'minter-js-sdk/dist/cjs/api/post-tx'
import GetNonce from 'minter-js-sdk/dist/cjs/api/get-nonce'

import { CHAIN_ID, NODE_API_URL, NODE_API_PJ_ID, NODE_API_PJ_SECRET } from '../assets/variables'

const httpClient = new MinterApi({
  apiType: 'node',
  baseURL: NODE_API_URL,
  chainId: CHAIN_ID,
  timeout: 3000,
  headers: {
    'Content-Type'    : 'application/json',
    'X-Project-Id'    : NODE_API_PJ_ID || '',
    'X-Project-Secret': NODE_API_PJ_SECRET || ''
  }
})

httpClient.interceptors.response.use((response) => {
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
export const postTx = new PostTx(httpClient)

/**
 *
 * @type {function(*): Promise<number>}
 */
export const getNonce = new GetNonce(httpClient)

/**
 *
 * @param pubKey
 * @param params
 * @returns {Promise<SpeechRecognitionEvent | SVGAnimatedString | string | ArrayBuffer>}
 */
export const getMissedBlocks = (pubKey, params = {}) => {

  return httpClient.get(`/missed_blocks/`.concat(pubKey), { params: {  ...params } })
    .then(response => {
      return response.data
    })
}

export default {
  postTx,
  getNonce,
  getMissedBlocks
}

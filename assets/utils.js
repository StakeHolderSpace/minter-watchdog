import log from '@/assets/winston'

/**
 *
 * @param obj
 */
export const removeEmptyKeys = (obj) => {
  let result = {}
  Object.keys(obj).forEach((key) => {
    if (obj[key]) {
      result[key] = obj[key]
    }
  })

  return result
}

export const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

/**
 *
 * @param promise
 * @returns {Promise<T | {payload: any, resolved: boolean}>}
 */
export function dfdReflect (promise) {
  return promise
    .then(result => ({ payload: result, resolved: true }))
    .catch(error => ({ payload: error.message, resolved: false }))
}

export function errHandler (error) {
  // Error
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx

    log.error(error.response.status)

    //log.error(error.response.headers)
    error.response.data ? log.error(error.response.data) : null

  }
  else if (error.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    log.error(error.request)
  }
  else if (error.message) {
    log.error(error.message)
  }
  else {
    // Something happened in setting up the request that triggered an Error
   console.error(error)
  }

  //error.config ? log.error(error.config) : null
}

export  function randomInteger(min, max) {
  let rand = min - 0.5 + Math.random() * (max - min + 1)
  rand = Math.round(rand);
  return rand;
}

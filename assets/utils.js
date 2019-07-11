export const handleError = function (err) {
  if (err.hasOwnProperty('response') && err.response) {
    if (!err.response.hasOwnProperty('status')) {
      console.log({ 'Network error': err.message })
    } else {
      if (err.response.data.error.hasOwnProperty('tx_result')) {
        console.log({ err: err.response.data.error.tx_result.log })
      } else {
        console.log({ err: err.response.data.error.message })
      }
    }
  } else if (err.hasOwnProperty('config') && err.config) {
    console.log({
      code  : err.code,
      config: err.config
    })
  } else if (err.hasOwnProperty('error') && err.error) {
    console.log({ err: err.error })
  } else {
    console.log({ err: err })
  }
}

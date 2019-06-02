export function handleError (error) {

  if (error.code && !error.response) {
    return console.error({
      error : error.code,
      url   : error.config.url,
      params: error.config.params

    })
  } else if (error.response && error.data) {
    return console.error(error.data)
  }

}

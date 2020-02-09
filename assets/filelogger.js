import log from './winston'
import node from '../api/node'
import {  errHandler } from './utils'
import {
  VALIDATOR_PUB_KEY
} from './variables'


const handleBlock = async (blockId) => {
  return node.getBlock(blockId)
    .then(({ validators }) => {

      const candidate = validators.find((validator) => {
        return validator.pub_key === VALIDATOR_PUB_KEY
      })

      log.debug(`getBlock validators: ${JSON.stringify(validators)} `)

      if (!candidate) {
        return Promise.reject(new Error(`PubKey ${VALIDATOR_PUB_KEY} is not validator for block ${blockId}`))
      }

      if (candidate.hasOwnProperty('signed') && !candidate.signed){
        // TODO: Записываем в файл
      }
    })
}

/**
 *
 * @param count
 * @returns {Promise<PromiseLike<*> | Promise<*>>}
 */
const findMissed = async (count) => {

  return node.getStatus()
    .then(({ latest_block_height, latest_block_time }) => {

      log.debug(`Status latest_block_height: ${latest_block_height}`)

      for (let i = latest_block_height; i >= latest_block_height - count; i--) {
        handleBlock(i).catch(errHandler)
      }

    })
    .catch(errHandler)
}

export default {
  findAndLogMissed: findMissed
}

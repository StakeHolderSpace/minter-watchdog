import SetCandidateOffTxParams from 'minter-js-sdk/dist/cjs/tx-params/candidate-set-off'

import log from './assets/winston'
import tglog from './assets/tglogger'
import fslog from './assets/filelogger'
import node from './api/node'
import { wait, errHandler } from './assets/utils'
import {
  CHAIN_ID,
  COIN_NAME,
  CONFIG,
  VALIDATOR_PUB_KEY,
  VALIDATOR_WALL_PRIV_KEY
} from './assets/variables'

let dogTimer = null
const watchingInterval = 3
const tarpitOnSetOffTimeout = 10

/**
 *
 * @returns {Promise<*|Promise<void>>}
 */
const watchMissingBlocks = async () => {
  let { missedCount, missedDiagram } = await node.getMissedBlocks(VALIDATOR_PUB_KEY)
    .then(result => {
      return {
        missedCount  : parseInt(result.missed_blocks_count),
        missedDiagram: result.missed_blocks
      }
    })
    .catch(err => {
      if (err.error && err.error.code && parseInt(err.error.code) === 404) {
        return {
          missedCount  : 0,
          missedDiagram: err.error.message ? err.error.message.toUpperCase() : '-- Unknown error --'
        }
      }
      throw err
    })

  if (missedCount >= CONFIG.maxMissed) {
    return switchValidatorOff()
      .then((txHash) => logValidatorShutdown(txHash))
      .then(() => wait(tarpitOnSetOffTimeout * 1000))
      .catch(err => {
        if (err.error && err.error.data && 0 <= err.error.data.indexOf('already exists')) {
          return wait(tarpitOnSetOffTimeout * 1.5 * 1000)
        }
        throw err
      })
  }

  return logMissedBlockStatus({ missedCount, missedDiagram })
}

/**
 *
 * @returns {Promise<*>}
 */
const switchValidatorOff = async () => {

  const oTx = new SetCandidateOffTxParams({
    chainId   : CHAIN_ID,
    privateKey: VALIDATOR_WALL_PRIV_KEY,

    publicKey : VALIDATOR_PUB_KEY,
    coinSymbol: COIN_NAME
  })

  log.debug(`SetOff Tx: ${JSON.stringify(oTx)}`)

  return node.postTx(oTx)
}

/**
 *
 * @returns {Promise<T>}
 */
const startWatching = async () => {
  log.info('Watchdog starting...')
  return wait(10)
    .then(() => {

      dogTimer = setTimeout(function watch () {
        return watchMissingBlocks()
          .catch(errHandler)
          .finally(() => {
            clearTimeout(dogTimer)
            dogTimer = setTimeout(watch, watchingInterval * 1000)
          })
      }, watchingInterval * 1000)

      return dogTimer
    })
    .then((dogTimer) => logStartedWatchdog())
}

/**
 *
 */
const logStartedWatchdog = () => {
  log.info('Watchdog started!')

  tglog.updateStatus({ missedCount: 0, missedDiagram: 'Watchdog started', maxMissed: CONFIG.maxMissed })
}

/**
 *
 * @type {Function}
 */
const logMissedBlockStatus = (() => {
  let lastMissedCount = 0

  return async ({ missedCount, missedDiagram }) => {

    let isMissedGrown = (lastMissedCount < missedCount)

    log.info(`Missed ${missedCount} of ${CONFIG.maxMissed} (${missedDiagram})`)

    // Telegram log
    isMissedGrown
      ? tglog.reportMissingBlock()
      : tglog.updateStatus({ missedCount, missedDiagram, maxMissed: CONFIG.maxMissed })

    lastMissedCount = missedCount
  }
})()

/**
 *
 */
const logValidatorShutdown = (txHash) => {
  log.info(`TxOFF Hash: ${txHash}`)

  tglog.reportValidatorShutdown()

}

startWatching().catch(errHandler)

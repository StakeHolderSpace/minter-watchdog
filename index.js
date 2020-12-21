import { TX_TYPE } from 'minter-js-sdk'

import log from './assets/winston'
import tglog from './assets/tglogger'
import { node_v2 } from './api/'
import { errHandler, wait } from './assets/utils'
import { BASE_COIN_NAME, CHAIN_ID, CONFIG, TX_TIMEOUT, VALIDATOR_PUB_KEY, WALLET } from './assets/variables'

let dogTimer = null
const txWaitTimeout = TX_TIMEOUT

/**
 *
 * @returns {Promise<*|Promise<void>>}
 */
const getMissedBlocks = async (validatorPubKey) => {
  return node_v2.getMissedBlocks(validatorPubKey)
    .then(result => {
      return {
        missedCount  : parseInt(result.missed_blocks_count)/*Math.floor(Math.random() * Math.floor(12))*/,
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
}

/**
 *
 * @returns {Promise<*>}
 */
const sendCmdTx = async () => {

  const txOptions = {
    chainId      : CHAIN_ID,
    privateKey   : WALLET.getPrivateKeyString(),
    feeCoinSymbol: BASE_COIN_NAME,
    gasRetryLimit: 5,
  }

  const txParams = {
    type    : TX_TYPE.SET_CANDIDATE_OFF,
    gasPrice: 5,
    data    : {
      publicKey: VALIDATOR_PUB_KEY
    }
  }
  /*'======= TX HASH ========='*/
  return node_v2.postTx(txParams, { ...txOptions }, { baseURL: '' }).then(resData => resData.hash)
}

/**
 *
 * @returns {Promise<T>}
 */
const Run = async () => {
  const watchingInterval = txWaitTimeout

  return wait(10)
    .then(() => {
      let startMsg = `
===== Watchdog starting... =================================
Owner Address    :   ${WALLET.getAddressString()}
PubKey           :   ${VALIDATOR_PUB_KEY}
Threshold Missed :   ${CONFIG.maxMissed}
============================================================`
      startMsg.split('\n').forEach(log.info)

      dogTimer = setTimeout(function watch () {
        let pubKey = VALIDATOR_PUB_KEY.toString()
        let shortName = pubKey.substr(0, 8) + '...' + pubKey.substr(-8)
        let preMsg = `[${shortName}]:`
        log.info(`Watching for: ${preMsg}`)
        return getMissedBlocks(pubKey)
          .then(({ missedCount, missedDiagram }) => {

            logMissedBlockStatus({ missedCount, missedDiagram, preMsg }).catch(errHandler)

            if (missedCount >= CONFIG.maxMissed) {
              // НЕ ставим await т.к. транзакция критичная. Лучше пусть будет дубль транщзакции из-за того что не
              // ждали ответа, чем штраф
              return sendCmdTx()
                .then((txHash) => logCmdSuccess({ txHash, preMsg }))
                .catch(err => {
                  if (err.error && err.error.data && 0 <= err.error.data.indexOf('already exists')) {
                    log.info('SetOff FAILED : Tx already exists')
                    return
                  }
                  if (err.error && err.error.tx_result && err.error.tx_result.log) {
                    log.error('SetOff FAILED : ' + err.error.tx_result.log)
                    return
                  }

                  throw err
                })
            }
          })
          .catch(errHandler)
          .finally(() => {
            clearTimeout(dogTimer)
            dogTimer = setTimeout(watch, watchingInterval * 1000)
          })
      }, watchingInterval * 1000)

      return Promise.resolve()
    })
    .then(logWatchdogStarted)
}

/*-------------------------------------------------------*/
/**
 *
 * @returns {Promise<*|void>}
 */
const logWatchdogStarted = () => {
  log.info('Watchdog started!')

  return tglog.updateStatus({
    missedCount  : 0,
    missedDiagram: 'Watchdog started',
    maxMissed    : CONFIG.maxMissed
  }).catch(errHandler)
}

/**
 *
 */
const logMissedBlockStatus = (() => {
  let lastMissedCount = 0

  return async ({ missedCount, missedDiagram, preMsg = '' }) => {

    let isMissedGrown = (lastMissedCount < missedCount)
    lastMissedCount = missedCount

    log.info(`${preMsg} Missed ${missedCount} of ${CONFIG.maxMissed} (${missedDiagram})`)

    // Telegram log
    return isMissedGrown
      ? tglog.reportMissingBlock()
      : tglog.updateStatus({ missedCount, missedDiagram: `${preMsg}\n ${missedDiagram}`, maxMissed: CONFIG.maxMissed })
  }
})()

/**
 *
 */
const logCmdSuccess = ({ txHash, preMsg = '' }) => {
  log.warn(`${preMsg} SET OFF Command sent | Hash: ${txHash}`)

  return tglog.reportSuccessCmd({ txHash }).catch(errHandler)
}

Run().catch(errHandler)

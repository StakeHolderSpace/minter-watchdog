import SetCandidateOffTxParams from 'minter-js-sdk/dist/cjs/tx-params/candidate-set-off'

import log from '@/assets/winston'
import tglog from './assets/tglogger'
import node from '@/api/node'
import { wait, errHandler } from '@/assets/utils'
import {
  CHAIN_ID,
  COIN_NAME,
  CONFIG,
  VALIDATOR_PUB_KEY,
  VALIDATOR_WALL_PRIV_KEY
} from '@/assets/variables'

let monitorTimerPtr = null

const stack = []

/**
 *
 * @param height
 * @param time
 * @param signed
 */
function stackBlock ({ height, time, signed }) {
  stack.push({ height, time, signed })

  if (stack.length > CONFIG.errWindow) {
    stack.shift()
  }

  log.debug(`Stack values: ${JSON.stringify(stack)}`)
}

/**
 *
 */
function handleMissingBlocks () {
  const signedBlocks = stack.reduce((count, { signed }) => count + signed, 0)
  const missedBlocks = stack.length - signedBlocks

  const lastKnownBlock = stack.slice(-1)[0]

  log.info(`Missed blocks ${missedBlocks} of ${CONFIG.errMaxNum}`)

  if (missedBlocks >= CONFIG.errMaxNum) {
    switchValidatorOff()
      .then((txHash) => {

        log.info(`TxOFF Hash: ${txHash}`)

        tglog.reportValidatorShutdown()

        return wait(20 * 1000)
      })
      .then(() => startMonitoring())
      .catch(errHandler)
  }

  lastKnownBlock.signed
    ? tglog.updateStatus({ stack, missedBlocks, lastKnownBlock })
    : tglog.reportMissingBlock({ missedBlock: lastKnownBlock })
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
function checkNextBlock () {
  return node.getStatus()
    .then(({ latest_block_height, latest_block_time }) => {

      log.debug(`Status latest_block_height: ${latest_block_height}`)

      if (stack.length && latest_block_height === stack.slice(-1)[0].height) {
        return Promise.reject(new Error(`Block ${latest_block_height} has been checked`))
      }

      return node.getBlock(latest_block_height)
        .then(({ validators }) => {
          const candidate = validators.find((validator) => {
            return validator.pub_key === VALIDATOR_PUB_KEY
          })

          log.debug(`getBlock validators: ${JSON.stringify(validators)} `)

          if (!candidate) {
            return Promise.reject(new Error(`PubKey ${VALIDATOR_PUB_KEY} is not validator`))
          }

          stackBlock({
            height: latest_block_height,
            time  : latest_block_time,
            signed: candidate.signed
          })

          handleMissingBlocks()
        })
    })
    .catch(errHandler)
}

/**
 *
 */
function startMonitoring () {
  log.info('Watchdog starting...')
  stack.length = 0
  clearInterval(monitorTimerPtr)
  monitorTimerPtr = setInterval(checkNextBlock, 2 * 1000)
}

startMonitoring()

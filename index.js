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
let lastMissedCount = 0

const handleMissingBlocks = async () => {

  let
    { missedCount, missedDiagram } = await node.getMissedBlocks(VALIDATOR_PUB_KEY)
      .then(result => {
        return {
          missedCount  : parseInt(result.missed_blocks_count),
          missedDiagram: result.missed_blocks
        }
      })

  log.info(`Missed ${missedCount} of ${CONFIG.errMaxNum}`)

  if (missedCount >= CONFIG.errMaxNum) {
    await switchValidatorOff()
      .then((txHash) => {
        log.info(`TxOFF Hash: ${txHash}`)

        stopMonitoringTimer()

        tglog.reportValidatorShutdown()

        return wait(20 * 1000)
      })
      .then(() => startMonitoring())
      .catch(errHandler)
  }

  (missedCount <= lastMissedCount)
    ? tglog.updateStatus({ missedCount, missedDiagram })
    : tglog.reportMissingBlock()

  lastMissedCount = missedCount
}

/**
 *
 */
const stopMonitoringTimer = () => {
  return clearInterval(monitorTimerPtr)
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
 */
function startMonitoring () {
  log.info('Watchdog starting...')
  stopMonitoringTimer()
  monitorTimerPtr = setInterval(() => handleMissingBlocks().catch(errHandler), 2 * 1000)
}

startMonitoring()

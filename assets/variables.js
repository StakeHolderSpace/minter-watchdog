import { privateToAddressString } from 'minterjs-util'
import Wallet from 'minterjs-wallet'

let privateKeyBuffer = typeof process.env.APP_WALLET_PRIV_KEY === 'string'
  ? Buffer.from(process.env.APP_WALLET_PRIV_KEY, 'hex')
  : process.env.APP_WALLET_PRIV_KEY

let sMnemonic = process.env.APP_WALLET_MNEMONIC

let oWallet = null
try {
  if (sMnemonic.length) {
    oWallet = new Wallet(null, sMnemonic)
  } else {
    oWallet = new Wallet(privateKeyBuffer)
  }
}
catch (e) {
  console.error(`Wallet got Error: ${e.message}`)
  process.exit(1)
}

export const WALLET = oWallet

export const MAINNET = 'mainnet'
export const TESTNET = 'testnet'

export const IS_DEV = process.env.NODE_ENV === 'development'
export const NETWORK = process.env.APP_NETWORK === MAINNET ? MAINNET : TESTNET
export const BASE_COIN_NAME = NETWORK === MAINNET ? 'BIP' : 'MNT'
export const CHAIN_ID = NETWORK === MAINNET ? 1 : 2

export const NODE_API_URL = process.env.APP_NODE_API_URL || 'https://test.mnt.funfasy.dev/v0'
export const NODE_API_PJ_ID = process.env.APP_FUNFASY_API_PJ_ID || ''
export const NODE_API_PJ_SECRET = process.env.APP_FUNFASY_API_PJ_SECRET || ''

export const TG_BOT_KEY = process.env.APP_TG_BOT_KEY || ''
export const TG_CHAT_ID = process.env.APP_TG_CHAT_ID || ''
export const TG_MSG_TITLE = process.env.APP_TG_MSG_TITLE || 'coin-keeper'

export const MISSED_MAX = process.env.APP_MISSED_MAX || 5

export const TX_TIMEOUT = 5

export const VALIDATOR_PUB_KEY = process.env.APP_VALIDATOR_PUB_KEY


export const CONFIG = {
  node     : {
    baseURL: NODE_API_URL
  },
  maxMissed: parseInt(MISSED_MAX),
  telegram : {
    botMsgSign: TG_MSG_TITLE,
    botKey    : TG_BOT_KEY,
    chatId    : parseInt(TG_CHAT_ID)
  }
}

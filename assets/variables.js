import { privateToAddressString, isValidPublicKeyString } from 'minterjs-util'

const privateKeyBuffer = typeof process.env.APP_VALIDATOR_WALL_PRIV_KEY === 'string'
  ? Buffer.from(process.env.APP_VALIDATOR_WALL_PRIV_KEY, 'hex')
  : process.env.APP_VALIDATOR_WALL_PRIV_KEY

try {
  privateToAddressString(privateKeyBuffer)
}
catch (e) {
  console.error(`privateToAddressString got Error: ${e.message}`)
  process.exit(1)
}

export const MAINNET = 'mainnet'
export const TESTNET = 'testnet'

export const IS_DEV = process.env.NODE_ENV === 'development'
export const NETWORK = process.env.APP_ENV === MAINNET ? MAINNET : TESTNET
export const COIN_NAME = NETWORK === MAINNET ? 'BIP' : 'MNT'
export const CHAIN_ID = NETWORK === MAINNET ? 1 : 2

export const VALIDATOR_PUB_KEY = process.env.APP_VALIDATOR_PUB_KEY || ''
export const VALIDATOR_WALL_PRIV_KEY = process.env.APP_VALIDATOR_WALL_PRIV_KEY || ''
export const VALIDATOR_WALL_ADDRESS = privateToAddressString(privateKeyBuffer)

export const NODE_API_URL = process.env.APP_NODE_API_URL || 'https://mnt.funfasy.dev/v0'
export const NODE_API_PJ_ID = process.env.APP_NODE_API_PJ_ID || ''
export const NODE_API_PJ_SECRET = process.env.APP_NODE_API_PJ_SECRET || ''

export const TG_BOT_KEY = process.env.APP_TG_BOT_KEY || ''
export const TG_CHAT_ID = process.env.APP_TG_CHAT_ID || ''
export const TG_MSG_TITLE = process.env.APP_TG_MSG_TITLE || 'watchdog'

export const ERRORS_MAX = process.env.APP_ERRORS_MAX || 6
export const ERRORS_WINDOW = process.env.APP_ERRORS_WINDOW || 24

export const TX_TIMEOUT = 8

export const CONFIG = {
  node     : {
    baseURL: NODE_API_URL
  },
  errWindow: parseInt(ERRORS_WINDOW),
  errMaxNum: parseInt(ERRORS_MAX),
  validator: {
    privateKey: VALIDATOR_WALL_PRIV_KEY,
    publicKey : VALIDATOR_PUB_KEY
  },
  telegram : {
    msgTitle: TG_MSG_TITLE,
    botKey  : TG_BOT_KEY,
    chatId  : parseInt(TG_CHAT_ID)
  }
}

import { writable, get } from 'svelte/store'
import {
  getAccount,
  watchAccount,
  disconnect,
  connect,
  type GetAccountReturnType,
  type Config,
  type Connector,
} from '@wagmi/core'
import { type Chain } from '@wagmi/core/chains'
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi'
import { safe } from '@wagmi/connectors'

type Web3Modal = ReturnType<typeof createWeb3Modal>

export const connected = writable<boolean>(false)
export const wagmiLoaded = writable<boolean>(false)
export const chainId = writable<number | null | undefined>(null)
export const signerAddress = writable<string | null>(null)
export const configuredConnectors = writable<Connector[]>([])
export const loading = writable<boolean>(true)
export const web3Modal = writable<Web3Modal>()
export const wagmiConfig = writable<Config>()

type DefaultConfigProps = {
  chains: readonly [Chain]
  walletConnectProjectId: string
}

export const defaultConfig = ({ chains, walletConnectProjectId }: DefaultConfigProps) => {
  const metadata = {
    name: 'Louper',
    description: 'The Ethereum Diamond Inspector',
    url: 'https://louper.dev', // origin must match your domain & subdomain
    icons: ['https://louper.dev/img/louper-logo.png'],
  }

  const config = defaultWagmiConfig({
    chains, // required
    projectId: walletConnectProjectId, // required
    metadata, // required
    enableWalletConnect: true, // Optional - true by default
    enableInjected: true, // Optional - true by default
    enableEIP6963: true, // Optional - true by default
    enableCoinbase: true, // Optional - true by default
    connectors: [safe()],
  })

  wagmiConfig.set(config)

  const modal = createWeb3Modal({
    wagmiConfig: config,
    projectId: walletConnectProjectId,
  })

  web3Modal.set(modal)
  wagmiLoaded.set(true)

  return { init }
}

export const init = async () => {
  try {
    setupListeners()
    const account = await waitForConnection()
    if (account.address) {
      if (account.chain) chainId.set(account.chain.id)
      connected.set(true)
      signerAddress.set(account.address)
    }
    loading.set(false)
  } catch (err) {
    loading.set(false)
  }
}

const setupListeners = () => {
  watchAccount(get(wagmiConfig) as Config, { onChange: handleAccountChange })
}

const handleAccountChange = async (account: GetAccountReturnType) => {
  if (get(wagmiLoaded) && account.address) {
    const chain: Chain = account.chain as Chain
    chainId.set(chain.id)
    connected.set(true)
    loading.set(false)
    signerAddress.set(account.address)
  } else if (account.isDisconnected && get(connected)) {
    loading.set(false)
    await disconnectWagmi()
  }
}

export const connection = async () => {
  try {
    const connector = getConnectorbyID('injected')
    if (connector !== null) {
      await connect(get(wagmiConfig) as Config, {
        connector,
      })
    }
    return { success: true }
  } catch (err) {
    return { success: false }
  }
}

export const WC = async () => {
  try {
    get(web3Modal).open()
    // await waitForAccount();

    return { succcess: true }
  } catch (err) {
    return { success: false }
  }
}

export const disconnectWagmi = async () => {
  await disconnect(get(wagmiConfig) as Config)
  connected.set(false)
  chainId.set(null)
  signerAddress.set(null)
  loading.set(false)
}

const waitForConnection = (): Promise<GetAccountReturnType> =>
  new Promise((resolve, reject) => {
    const attemptToGetAccount = () => {
      const account = getAccount(get(wagmiConfig) as Config)
      if (account.isDisconnected) reject('account is disconnected')
      if (account.isConnecting) {
        setTimeout(attemptToGetAccount, 250)
      } else {
        resolve(account)
      }
    }

    attemptToGetAccount()
  })

export function getConnectorbyID(id: string): Connector | null {
  for (const obj of get(configuredConnectors)) {
    if (obj.id === id) {
      return obj
    }
  }
  return null
}

import { GameFLP } from 'ao-js-sdk/dist/src/clients/pi/fair-launch-process/flps'
import { HyperBeamTokenClient } from 'ao-js-sdk/dist/src/clients/ao/token/implementations/hyperbeam-token-client/HyperBeamTokenClient'
import { PROCESS_IDS } from 'ao-js-sdk/dist/src/constants/processIds'
import BigNumber from 'bignumber.js'

export interface WithdrawableAmounts {
  ao: BigNumber
  pi: BigNumber
}

export async function fetchWithdrawableAmounts(): Promise<WithdrawableAmounts> {
  const [aoAmount, piAmount] = await Promise.all([
    GameFLP.getWithdrawableAo(),
    GameFLP.getWithdrawablePi()
  ])

  return {
    ao: new BigNumber(aoAmount),
    pi: new BigNumber(piAmount)
  }
}

export async function fetchWithdrawableAo(): Promise<BigNumber> {
  const aoAmount = await GameFLP.getWithdrawableAo()
  return new BigNumber(aoAmount)
}

export async function fetchWithdrawablePi(): Promise<BigNumber> {
  const piAmount = await GameFLP.getWithdrawablePi()
  return new BigNumber(piAmount)
}

export async function fetchAOBalance(address: string): Promise<BigNumber> {
  const aoTokenClient = new HyperBeamTokenClient({ processId: PROCESS_IDS.AO })
  const balance = await aoTokenClient.balance(address)
  return new BigNumber(balance)
}

export async function fetchPIBalance(address: string): Promise<BigNumber> {
  const piTokenClient = new HyperBeamTokenClient({ processId: PROCESS_IDS.AUTONOMOUS_FINANCE.PI_TOKEN_PROCESS_ID })
  const balance = await piTokenClient.balance(address)
  return new BigNumber(balance)
}

export async function performWithdrawAo(): Promise<void> {
  await GameFLP.withdrawAo()
}

export async function performWithdrawPi(): Promise<void> {
  await GameFLP.withdrawPi()
}

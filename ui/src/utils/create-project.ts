import { initialMain as mainFungible } from "../code-text/contract/fungible/main"
import { initialTypes as typesFungible } from "../code-text/contract/fungible/types"
import { initialMain as mainNft } from "../code-text/contract/nft/main"
import { initialTypes as typesNft } from "../code-text/contract/nft/types"
import { DEV_MOLDS } from "../types/Molds"

export const getInitialContractText = (options: { [key: string]: string }) => {
  return {
    contract_main: options.token === 'nft' ? mainNft : mainFungible,
    contract_types: options.token === 'nft' ? typesNft : typesFungible,
    // contract_tests: initialTests,
    // gall_app: initialApp,
    // gall_sur: initialSur,
    // gall_lib: initialLib,
  }
}

export const getInitialMolds = (options: { [key: string]: string }) => {
  if (options.token === 'nft') {
    // TODO: get molds for nft
    return DEV_MOLDS
  }

  return DEV_MOLDS
}

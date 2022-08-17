import { TestData } from "../../types/TestData";
import { TestGrain } from "../../types/TestGrain";
import { UqbarType } from "../../types/UqbarType";

export const BLANK_METADATA = { name: '', symbol: '', decimals: '', supply: '', cap: '', mintable: '', minters: '', deployer: '', salt: '' }

export interface RawMetadata {
  name: string
  symbol: string
  decimals: string
  supply: string
  cap: string
  mintable: string
  minters: string
  deployer: string
  salt: string
}

export const DEFAULT_TOWN_ID = '0x0'

export const genFungibleMetadata = (id: string, { name, symbol, decimals, supply, cap, mintable, minters, deployer, salt }: RawMetadata) : TestGrain => {
  return {
    id,
    lord: id, // should be coming from the contract, when compiled
    holder: id, // should be the same as the lord
    'town-id': DEFAULT_TOWN_ID,
    label: "token-metadata",
    salt: parseInt(id, 16),
    data: {
      name: { type: '@t', value: name },
      symbol: { type: '@t', value: symbol },
      decimals: { type: '@ud', value: decimals },
      supply: { type: '@ud', value: supply },
      cap: { type: '@ud', value: cap },
      mintable: { type: '?', value: mintable ? 'true' : 'false' },
      minters: { type: '@t', value: minters.split(',').map(m => m.trim()).join(',') },
      deployer: { type: '@ux', value: deployer },
    }
  }
}

export const fungibleTokenTestData : TestData = {
  tests: [
    {
      id: '83754647655676576576',
      input: { type: '@t', value: '[%give 0xbeef 30 0x1.dead ~]' }
      // input: {
      //   action: 'give',
      //   formValues: {
      //     to: {
      //       type: '@ux',
      //       value: '0xbeef',
      //     },
      //     amount: {
      //       type: '@ux',
      //       value: '100',
      //     },
      //     "from-account": {
      //       type: '@ux',
      //       value: '0x1.dead',
      //     },
      //     "to-account": {
      //       type: '@ux',
      //       value: '',
      //     },
      //   }
      // }
    }
  ],
  grains: [

    // {
    //   id: "0x7367697a",
    //   lord: "0x7367697a",
    //   holder: "0x7367697a",
    //   'town-id': "0x0",
    //   label: "token-metadata",
    //   salt: 1936157050,
    //   data: {
    //     name: { type: '@t', value: "Zigs: UQ| Tokens" },
    //     symbol: { type: '@t', value: "ZIG" },
    //     decimals: { type: '@ud', value: "18" },
    //     supply: { type: '@ud', value: "1000000" },
    //     cap: { type: '@ud', value: "" },
    //     mintable: { type: '?', value: "false" },
    //     minters: { type: '@t', value: "[0xbeef]" },
    //     deployer: { type: '@ux', value: "0x0" },
    //   }
    // },
    {
      id: "0x1.fade",
      lord: "0x7367697a",
      holder: "0xbeef",
      'town-id': "0x0",
      label: "account",
      salt: 1936157050,
      data: {
        balance: { type: '@ud' as UqbarType, value:  "50" },
        allowances: { type: '@t' as UqbarType, value: "~" },
        'metadata-id': { type: '%id' as UqbarType, value: "0x7367697a" },
        nonce: { type: '@ud', value: '0' }
      }
    },
    {
      id: "0x1.dead",
      lord: "0x7367697a",
      holder: "0xdead",
      'town-id': "0x0",
      label: "account",
      salt: 1936157050,
      data: {
        balance: { type: '@ud' as UqbarType, value:  "30" },
        allowances: { type: '@t' as UqbarType, value: "~" },
        'metadata-id': { type: '%id' as UqbarType, value: "0x7367697a" },
        nonce: { type: '@ud', value: '0' }
      }
    },
    {
      id: "0x1.cafe",
      lord: "0x7367697a",
      holder: "0xcafe",
      'town-id': "0x0",
      label: "account",
      salt: 1936157050,
      data: {
        balance: { type: '@ud' as UqbarType, value:  "20" },
        allowances: { type: '@t' as UqbarType, value: "~" },
        'metadata-id': { type: '%id' as UqbarType, value: "0x7367697a" },
        nonce: { type: '@ud', value: '0' }
      }
    },
    {
      id: "0x1.face",
      lord: "0x656c.6269.676e.7566",
      holder: "0xface",
      'town-id': "0x0",
      label: "account",
      salt: 1717987684,
      data: {
        balance: { type: '@ud' as UqbarType, value:  "20" },
        allowances: { type: '@t' as UqbarType, value: "~" },
        'metadata-id': { type: '%id' as UqbarType, value: "0x2174.6e65.7265.6666.6964" },
        nonce: { type: '@ud', value: '0' }
      }
    }
  ]
}

export const genFungibleTokenTestData = (metadataGrain: TestGrain, contractId: string) => ({
  // TODO: need the ID from genFungibleMetadata
  ...fungibleTokenTestData,
  grains: [
    metadataGrain,
    ...fungibleTokenTestData.grains
      .map(g => ({
        ...g,
        lord: contractId,
        salt: Number(metadataGrain.data.salt?.value || metadataGrain.salt),
        data: { ...g.data, 'metadata-id': { type: '%id', value: contractId } } 
      } as TestGrain))
  ]
})
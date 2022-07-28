import { TestData } from "../../types/TestData";
import { TestGrain } from "../../types/TestGrain";

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

export const genFungibleMetadata = ({ name, symbol, decimals, supply, cap, mintable, minters, deployer, salt }: RawMetadata) : TestGrain => {
  const id = symbol.split('').map((_s, i) => symbol.charCodeAt(i).toString(16)).join('')

  return {
    id,
    lord: id,
    holder: id,
    'town-id': "0x1",
    type: "token-metadata",
    rice: {
      name,
      symbol,
      decimals,
      supply,
      cap,
      mintable: mintable ? 'true' : 'false',
      minters: minters.split(',').map(m => m.trim()),
      deployer,
      salt
    }
  }
}

export const fungibleTokenTestData : TestData = {
  tests: [
    {
      id: '83754647655676576576',
      input: {
        cart: {
          me:  "0xcafe",
          from: "0xcafe",
          batch: 0,
          "town-id": "0x1",
          grains: []
        },
        action: {
          type: "give",
          budget: "10",
          to: "0xbeef",
          amount: "100",
          "from-account": [],
          "to-account": []
        }
      }
    }
  ],
  grains: [
    // {
    //   id: "0x7367697a",
    //   lord: "0x7367697a",
    //   holder: "0x7367697a",
    //   'town-id': "0x1",
    //   type: "token-metadata",
    //   rice: {
    //     name: "Zigs: UQ| Tokens",
    //     symbol: "ZIG",
    //     decimals: "18",
    //     supply: "1000000",
    //     cap: "",
    //     mintable: "false",
    //     minters: "[0xbeef]",
    //     deployer: "0x0",
    //     salt: "1936157050"
    //   }
    // },
    {
      id: "0x1.beef",
      lord: "0x7367697a",
      holder: "0xbeef",
      'town-id': "0x1",
      type: "account",
      rice: {
        salt: "1936157050",
        'metadata-id': "0x7367697a",
        balance: "50",
        allowances: "{ '0xdead': 1000 }"
      }
    },
    {
      id: "0x1.dead",
      lord: "0x7367697a",
      holder: "0xdead",
      'town-id': "0x1",
      type: "account",
      rice: {
        salt: "1936157050",
        'metadata-id': "0x7367697a",
        balance: "30",
        allowances: "{ '0xbeef': 10 }"
      }
    },
    {
      id: "0x1.cafe",
      lord: "0x7367697a",
      holder: "0xcafe",
      'town-id': "0x1",
      type: "account",
      rice: {
        salt: "1936157050",
        'metadata-id': "0x7367697a",
        balance: "20",
        allowances: "{ '0xbeef': 10, '0xdead': 20 }"
      }
    },
    {
      id: "0x1.face",
      lord: "0x656c.6269.676e.7566",
      holder: "0xface",
      'town-id': "0x1",
      type: "account",
      rice: {
        salt: "1717987684",
        'metadata-id': "0x2174.6e65.7265.6666.6964",
        balance: "20",
        allowances: "{ '0xbeef': 10 }"
      }
    }
  ]
}

export const genFungibleTokenTestData = (metadataGrain: TestGrain) => ({
  ...fungibleTokenTestData,
  grains: [metadataGrain, ...fungibleTokenTestData.grains]
})
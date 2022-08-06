import { TestAction } from "./TestAction"
import { TestGrain } from "./TestGrain"

export interface Test {
  id: string
  focus?: boolean
  exclude?: boolean
  input: {
    cart: {
      me: string
      from: string
      batch: number
      'town-id': string
      grains: string[]
    }
    action: TestAction
    actionInvalid?: boolean
    obsolete?: boolean
  }
  output?: {
    [key: string]: any
  } | undefined
}

export interface TestData {
  tests: Test[]
  grains: TestGrain[]
}

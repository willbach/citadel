// import { FormValues } from "./FormValues"
import { FormField } from "./FormValues"
import { TestGrain } from "./TestGrain"

export interface Test {
  id: string
  focus?: boolean
  exclude?: boolean
  input: FormField
  // input: {
  //   action: string
  //   formValues: FormValues
  //   obsolete?: boolean
  //   actionInvalid?: boolean
  // }
  output?: {
    [key: string]: any
  } | undefined
}

export interface TestData {
  tests: Test[]
  grains: TestGrain[]
}

export interface TestOutput {
  project: string
  id: string
  status: number
}

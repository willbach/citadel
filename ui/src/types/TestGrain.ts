import { FormValues } from "./FormValues"

export type TestRiceValue = string | TestRiceValue[] | { [key: string]: string | TestRiceValue }

export interface TestRice {
  // %& (?)
  [key: string]: TestRiceValue
}

export interface TestGrain {
  //       :*  id=0x1.beef
  //           lord=zigs-wheat-id
  //           holder=holder-1
  //           town-id
  //           rice=[%& salt [50 (malt ~[[holder-2 1.000]]) zigs-wheat-id]]
  id: string
  lord: string
  holder: string
  'town-id': string
  label: string
  salt: number
  data: FormValues

  // UI-specific fields
  obsolete?: boolean
  riceInvalid?: boolean
}

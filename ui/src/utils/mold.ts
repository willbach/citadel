import { Molds } from "../types/Molds"
import { Test } from "../types/TestData"
import { TestGrain } from "../types/TestGrain"

export const isActionValid = (newMolds: Molds, oldMolds: Molds, test: Test) : Test => {
  // if action type does not exist in newMolds, set obsolete: true
  if (!test.input.action.type || !newMolds.actions[test.input.action.type as string]) {
    return { ...test, input: { ...test.input, obsolete: true, actionInvalid: true } }
  }

  const actionType = test.input.action.type as string
  const newMold = newMolds.actions[actionType]
  const oldMold = oldMolds.actions[actionType]

  return Object.keys(newMold).reduce(
    (acc: Test, key: string) => ({ ...acc, input: { ...test.input, actionInvalid: acc.input.actionInvalid || newMold[key] !== oldMold[key]  } })
  , test)
}

export const isRiceValid = (newMolds: Molds, oldMolds: Molds, grain: TestGrain) : TestGrain => {
  // if rice type does not exist in newMolds, set obsolete: true
  if (!grain.type || !newMolds.rice[grain.type]) {
    return { ...grain, obsolete: true, riceInvalid: true }
  }

  const newMold = newMolds.rice[grain.type]
  const oldMold = oldMolds.rice[grain.type]

  return Object.keys(newMold).reduce(
    (acc: TestGrain, key: string) => ({ ...acc, riceInvalid: acc.riceInvalid || newMold[key] !== oldMold[key] })
  , grain)
}

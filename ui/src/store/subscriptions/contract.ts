import { GetState, SetState } from "zustand";
import { Molds } from "../../types/Molds";
import { isActionValid, isRiceValid } from "../../utils/mold";
import { sortGrain, sortTest } from "../../utils/sort";
import { ContractStore } from "../contractStore";

export const handleMoldsUpdate = (get: GetState<ContractStore>, set: SetState<ContractStore>) => (newMolds: Molds) => {
  console.log('MOLD SUBSCRIPTION:', JSON.stringify(newMolds))
  const { projects, currentProject } = get()
  const oldMolds = (projects.find(({ title }) => title === currentProject) || {}).molds

  if (oldMolds) {
    const newProjects = projects.map((p) => {
      if (p.title !== currentProject) {
        return p
      }

      const { tests, grains } = p.testData

      return {
        ...p,
        molds: newMolds,
        testData: {
          tests: tests.map(t => isActionValid(newMolds, oldMolds, t)).sort(sortTest),
          grains: grains.map(g => isRiceValid(newMolds, oldMolds, g)).sort(sortGrain),
        }
      }
    })

    set({ projects: newProjects })
  }
}

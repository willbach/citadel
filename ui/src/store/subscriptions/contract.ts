import { GetState, SetState } from "zustand";
import { Molds } from "../../types/Molds";
import { ContractStore } from "../contractStore";

export const handleMoldsUpdate = (get: GetState<ContractStore>, set: SetState<ContractStore>) => (molds: Molds) => {
  console.log('MOLD SUBSCRIPTION:', JSON.stringify(molds))
  // BLOCKED: need the project that matches this mold so that I can update it
  // TODO: check the mold against the current mold,
  // develop list of actions and grains that have a new shape
  // mark all effected actions and grains as "outdated: true"
  // set the molds for the relevant project along with the grains
  // get().setMolds(molds)
}

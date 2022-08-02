import create from "zustand"
import { persist } from "zustand/middleware"
import api from "../api";
import { initialMain } from "../code-text/contract/fungible/main";
import { initialTests } from "../code-text/contract/fungible/tests";
import { initialTypes } from "../code-text/contract/fungible/types";
import { initialApp } from "../code-text/gall/app";
import { initialLib } from "../code-text/gall/lib";
import { initialSur } from "../code-text/gall/sur";
import { fungibleTokenTestData, genFungibleMetadata, genFungibleTokenTestData, RawMetadata } from "../code-text/test-data/fungible";
import { DEV_MOLDS, Molds } from "../types/Molds";
import { EditorTextState, Project } from "../types/Project";
import { Route } from "../types/Route";
import { Test } from "../types/TestData";
import { TestGrain } from "../types/TestGrain";
import { handleMoldsUpdate } from "./subscriptions/contract";
import { createSubscription } from "./subscriptions/createSubscription";

const getCurrentProject = (curP: string, ps: Project[]) : Project | undefined => ps.find(p => p.title === curP)

export interface ContractStore {
  loading: boolean
  currentProject: string
  projects: Project[]
  openApps: string[]
  currentApp: string
  route: Route
  setRoute: (route: Route) => void
  setLoading: (loading: boolean) => void
  init: () => Promise<void>
  createProject: (options: { [key: string]: string }, rawMetadata?: RawMetadata) => Promise<void>
  setCurrentProject: (currentProject: string) => void
  addApp: (app: string) => void
  setCurrentApp: (currentApp: string) => void
  removeApp: (app: string) => void
  setMolds: (molds: Molds) => void
  setTextState: (text: EditorTextState) => void
  saveFiles: (project?: Project) => Promise<void>
  deleteProject: () => Promise<void>
  runTests: () => Promise<void>
  addTest: (test: Test) => void
  updateTest: (test: Test) => void
  removeTest: (index: number) => void
  addGrain: (grain: TestGrain) => void
  updateGrain: (grain: TestGrain) => void
  setGrains: (grains: TestGrain[]) => void
  removeGrain: (grain: number | TestGrain) => void
}

const useContractStore = create<ContractStore>(persist<ContractStore>(
  (set, get) => ({
    loading: true,
    currentProject: '',
    projects: [],
    openApps: [],
    currentApp: '',
    route: { route: 'project', subRoute: 'new' },
    setRoute: (route: Route) => set({ route }),
    setLoading: (loading: boolean) => set({ loading }),
    init: async () => {
      api.subscribe(createSubscription('citadel', '/citadel/types', handleMoldsUpdate(get, set)))

      const rawProjects = await api.scry({ app: 'citadel', path: '/projects-json' })

      const parseRawProject = (rawProject: any): Project => {
        const formattedProject = Array.isArray(rawProject[0]) ? rawProject.flat(1) : rawProject
        const [title] = formattedProject
        const text = formattedProject.slice(1)
          .reduce((acc:  { [key: string]: string }, cur:any) => {
            const file = cur.flat(Infinity)
            acc[`contract_${file[1].path[0]}`] = file[1].text
            return acc
          }, {})

        return {
          title,
          text,
          molds: {
            actions: {},
            rice: {}
          },
          testData: JSON.parse(text.contract_tests || '{"tests": [], "grains": []}')
        }
      }

      if (rawProjects && rawProjects.length) {
        const projects = rawProjects.filter((rp: any) => rp).map(parseRawProject)
        set({ currentProject: projects[0].title, projects, route: { route: 'contract', subRoute: 'main' } })
      }

      set({ loading: false })
    },
    createProject: async (options: { [key: string]: string }, rawMetadata?: RawMetadata) => {
      const metadataGrain = rawMetadata && genFungibleMetadata(rawMetadata)
      const { projects } = get()
      
      // TODO: base the values off of the selections
      // type CreationStep = 'project' | 'token' |  'template'
      // export type CreationOption = 'contract' | 'gall' | 'fungible' | 'nft' | 'issue' | 'wrapper'
      const newProject = {
        title: options.title,
        testData: metadataGrain ? genFungibleTokenTestData(metadataGrain) : fungibleTokenTestData,
        molds: DEV_MOLDS,
        text: {
          contract_main: initialMain,
          contract_types: initialTypes,
          // contract_tests: initialTests,
          // gall_app: initialApp,
          // gall_sur: initialSur,
          // gall_lib: initialLib,
        }
      }

      await get().saveFiles(newProject)
      set({ projects: projects.concat([newProject]), currentProject: options.title })
    },
    setCurrentProject: (currentProject: string) => set({ currentProject }),
    addApp: (app: string) => set({ openApps: get().openApps.concat([app]), currentApp: app }),
    setCurrentApp: (currentApp: string) => set({ currentApp }),
    removeApp: (app: string) => {
      const { openApps, currentApp } = get()
      set({ openApps: openApps.filter(a => a !== app), currentApp: currentApp === app ? openApps[0] || '' : currentApp })
    },
    setMolds: (molds: Molds) => {
      const { projects, currentProject } = get()
      set({ projects: projects.map(p => p.title === currentProject ? { ...p, molds } : p) })
    },
    setTextState: (text: EditorTextState) => set({ projects: get().projects.map((p) => p.title === get().currentProject ? { ...p, text } : p) }),
    saveFiles: async (project?: Project) => {
      const { currentProject, projects } = get()
      const projectTitle = project?.title || currentProject
      console.log(1, 'saving', projectTitle)
      const targetProject = getCurrentProject(projectTitle, projects)
      console.log(2, targetProject?.text)
      if (targetProject) {
        const { text, testData } = targetProject

        await api.poke({
          app: 'citadel',
          mark: 'citadel-action',
          json: {
            save: {
              arena: 'contract',
              deeds: [
                {
                  dir: 'lib',
                  scroll: { text: text.contract_main, project: projectTitle, path: '/main/hoon' }
                },
                {
                  dir: 'lib',
                  scroll: { text: text.contract_types, project: projectTitle, path: '/types/hoon' }
                },
                {
                  dir: 'lib',
                  scroll: { text: JSON.stringify(testData), project: projectTitle, path: '/tests/json' }
                },
              ],
              charter: text.contract_main
            }
          }
        })
        console.log(3, 'success')
      }
    },
    runTests: async () => {
      const { currentProject, projects } = get()
      const project = getCurrentProject(currentProject, projects)

      if (project) {
        const invalidTests = project.testData.tests.filter(t => t.input.obsolete || t.input.actionInvalid)
        const invalidGrains = project.testData.grains.filter(g => g.obsolete || g.riceInvalid)

        if (invalidTests.length) {
          return window.alert('Please update any obsolete or invalid tests and grains')
        } else if (invalidGrains.length) {
          return window.alert('Please update any obsolete or invalid grains')
        }

        // const { text: { contract, contractTest, gall, gallTest } } = get()
        
        // if (isContract && (!contract || !contractTest)) {
        //   return alert('Contract and Test sections cannot be empty')
        // } else if (!isContract && (!gall || !gallTest)) {
        //   return alert('Gall and Test sections cannot be empty')
        // }
  
        // const json: any = {}
        // if (isContract) {
        //   json.contract = {
        //     code: contract,
        //     test: contractTest
        //   }
        // } else {
        //   json.gall = {
        //     code: gall,
        //     test: gallTest
        //   }
        // }
  
        // so the `json` will look like:
        // { contract: { code, test } } or
        // { gall: { code, test } }
  
        // the `mark` needs to be updated
        await api.poke({ app: 'citadel', mark: 'citadel-poke', json: {} })
      }
    },
    deleteProject: async () => {
      const { currentProject, projects, route } = get()
      await api.poke({ app: 'citadel', mark: 'citadel-action', json: { delete: currentProject } })
      const newProjects = projects.filter(p => p.title !== currentProject)
      set({ projects: newProjects, currentProject: newProjects[0]?.title || '', route: newProjects.length < 1 ? { route: 'project', subRoute: 'new' } : route })
    },
    addTest: (test: Test) => {
      const { projects, currentProject } = get()
      set({ projects: projects.map(p => p.title === currentProject ? { ...p, testData: { ...p.testData, tests: p.testData.tests.concat([test]) } } : p) })
    },
    updateTest: (newTest: Test) => {
      const { projects, currentProject } = get()
      set({ projects: projects.map(p => p.title === currentProject ? { ...p, testData: { ...p.testData, tests: p.testData.tests.map((test) => test.id === newTest.id ? newTest : test) } } : p) })
    },
    removeTest: (index: number) => {
      const { projects, currentProject } = get()
      set({ projects: projects.map(p => p.title === currentProject ? { ...p, testData: { ...p.testData, tests: p.testData.tests.filter((_, i) => i !== index) } } : p) })
    },
    addGrain: (grain: TestGrain) => {
      const { projects, currentProject } = get()
      set({ projects: projects.map(p => p.title === currentProject ? { ...p, testData: { ...p.testData, grains: p.testData.grains.concat([grain]) } } : p) })
    },
    updateGrain: (newGrain: TestGrain) => {
      const { projects, currentProject } = get()
      set({ projects: projects.map(p => p.title === currentProject ? { ...p, testData: { ...p.testData, grains: p.testData.grains.map((g) => g.id === newGrain.id ? newGrain : g) } } : p) })
    },
    setGrains: (grains: TestGrain[]) => {
      const { projects, currentProject } = get()
      set({ projects: projects.map(p => p.title === currentProject ? { ...p, testData: { ...p.testData, grains } } : p) })
    },
    removeGrain: (grain: number | TestGrain) => {
      const { projects, currentProject } = get()
      if (typeof grain === 'number') {
        set({ projects: projects.map(p => p.title === currentProject ? { ...p, testData: { ...p.testData, grains: p.testData.grains.filter((_, i) => i !== grain) } } : p) })
      } else {
        set({ projects: projects.map(p => p.title === currentProject ? { ...p, testData: { ...p.testData, grains: p.testData.grains.filter((g) => g.id !== grain.id) } } : p) })
      }
    },
  }),
  {
    name: 'contractStore'
  }
));

export default useContractStore;

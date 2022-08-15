import create from "zustand"
import { persist } from "zustand/middleware"
import api from "../api";
import { fungibleTokenTestData, genFungibleMetadata, genFungibleTokenTestData, RawMetadata } from "../code-text/test-data/fungible";
import { Molds } from "../types/Molds";
import { EditorTextState, Project } from "../types/Project";
import { Route } from "../types/Route";
import { Test, TestData } from "../types/TestData";
import { TestGrain } from "../types/TestGrain";
import { getInitialContractText, getInitialMolds } from "../utils/create-project";
import { parseRawGrains, parseRawProject } from "../utils/project";
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
  getGranary: (currentProject: string) => Promise<void>
  setCurrentProject: (currentProject: string) => void
  addApp: (app: string) => void
  setCurrentApp: (currentApp: string) => void
  removeApp: (app: string) => void
  setMolds: (molds: Molds) => void
  setTextState: (text: EditorTextState) => void
  saveFiles: (project?: Project) => Promise<void>
  deleteProject: () => Promise<void>
  runTests: () => Promise<void>
  addTest: (test: Test) => Promise<void>
  updateTest: (test: Test) => Promise<void>
  removeTest: (index: number) => Promise<void>
  addGrain: (grain: TestGrain) => Promise<void>
  updateGrain: (grain: TestGrain) => Promise<void>
  setGrains: (grains: TestGrain[]) => Promise<void>
  removeGrain: (grain: number | TestGrain) => Promise<void>
  saveTestData: (testData: TestData) => Promise<TestData>
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
      // const { currentProject, getGranary } = get()
      api.subscribe(createSubscription('citadel', '/citadel/types', handleMoldsUpdate(get, set)))
      
      const [rawProjects, rawTestData] = await Promise.all([
        api.scry({ app: 'citadel', path: '/projects' }),
        api.scry({ app: 'citadel', path: `/state/tests/all` }),
      ])

      if (rawProjects && rawProjects.length) {
        const projects = rawProjects.filter((rp: any) => rp).map((rp: any) => parseRawProject(rp, get().projects, rawTestData))
        set({ currentProject: projects[0].title, projects, route: { route: 'contract', subRoute: 'main' } })
      }

      // getGranary(currentProject)
      set({ loading: false })
    },
    getGranary: async (projectTitle: string) => {
      // const rawFactory = await api.scry({ app: 'citadel', path: `/factory-json/${projectTitle}` })
      // if (rawFactory && rawFactory.length) {
      //   const formattedRawFactory = [[rawFactory[0], rawFactory[1]]].concat(rawFactory.slice(2))
      //   get().setGrains(parseRawGrains(formattedRawFactory))
      // }
    },
    createProject: async (options: { [key: string]: string }, rawMetadata?: RawMetadata) => {
      const metadataGrain = rawMetadata && genFungibleMetadata(rawMetadata)
      const { projects } = get()
      
      // type CreationStep = 'project' | 'token' |  'template'
      // export type CreationOption = 'contract' | 'gall' | 'fungible' | 'nft' | 'issue' | 'wrapper'
      const newProject = {
        title: options.title,
        testData: metadataGrain ? genFungibleTokenTestData(metadataGrain) : fungibleTokenTestData,
        molds: getInitialMolds(options),
        text: getInitialContractText(options)
      }

      await get().saveFiles(newProject)
      set({ projects: projects.concat([newProject]), currentProject: options.title })
    },
    setCurrentProject: (currentProject: string) => {
      get().getGranary(currentProject)
      set({ currentProject })
    },
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
      const targetProject = project || getCurrentProject(projectTitle, projects)
      console.log(2, targetProject?.text)
      if (targetProject) {
        const { text, testData } = targetProject
        console.log(3, text.contract_main.length)
        // TODO: save all the testData as grains and tests respectively

        const json = {
          save: {
            project: projectTitle,
            arena: 'contract',
            deeds: [
              { dir: 'lib', scroll: { text: text.contract_main, project: projectTitle, path: '/main/hoon' } },
              { dir: 'lib', scroll: { text: text.contract_types, project: projectTitle, path: '/types/hoon' } },
              // { dir: 'lib', scroll: { text: JSON.stringify(testData), project: projectTitle, path: '/tests/json' } },
            ],
            charter: text.contract_main
          }
        }

        await api.poke({ app: 'citadel', mark: 'citadel-action', json })
        console.log(4, 'success')
      }
    },
    runTests: async () => {
      const { currentProject, projects } = get()
      const project = getCurrentProject(currentProject, projects)

      if (project) {
        // const invalidTests = project.testData.tests.filter(t => t.input.obsolete || t.input.actionInvalid)
        // const invalidGrains = project.testData.grains.filter(g => g.obsolete || g.riceInvalid)

        // if (invalidTests.length) {
        //   return window.alert('Please update any obsolete or invalid tests and grains')
        // } else if (invalidGrains.length) {
        //   return window.alert('Please update any obsolete or invalid grains')
        // }

        const focusedTests = project.testData.tests.filter(({ focus }) => focus)
        const testsToRun = focusedTests.length ? focusedTests : project.testData.tests.filter(({ exclude }) => !exclude)

        if (!testsToRun.length) {
          return window.alert('Please make sure you have at least 1 test that is not excluded')
        }

        const json = {
          test: {
            grains: null,
            // "contract-id": "0x74.6361.7274.6e6f.632d.7367.697a",
            survey: {
              project: currentProject,
              deeds: [],
              arena: "contract",
              charter: ""
            },
            // "yolks": ["[%give 10 0xdead 30 0x1.beef 0x1.dead]"] // this should be the list of testsToRun
            yolks: testsToRun.map(({ input: { action, formValues } }) => `[%${action} ${Object.values(formValues).map(({ value }: any) => value).join(' ')}]`)
          }
        }
        console.log('RUNNING TESTS:', JSON.stringify(json))
  
        await api.poke({ app: 'citadel', mark: 'citadel-action', json })
      }
    },
    deleteProject: async () => {
      const { currentProject, projects, route } = get()
      await api.poke({ app: 'citadel', mark: 'citadel-action', json: { delete: currentProject } })
      const newProjects = projects.filter(p => p.title !== currentProject)
      set({ projects: newProjects, currentProject: newProjects[0]?.title || '', route: newProjects.length < 1 ? { route: 'project', subRoute: 'new' } : route })
    },
    addTest: async (test: Test) => {
      const { projects, currentProject } = get()
      set({ projects: projects.map(p => p.title === currentProject ? { ...p, testData: { ...p.testData, tests: p.testData.tests.concat([test]) } } : p) })
    },
    updateTest: async (newTest: Test) => {
      const { projects, currentProject, saveTestData } = get()
      set({ projects: await Promise.all(projects.map(async (p) => (
        p.title !== currentProject ? p :
          { ...p, testData: await saveTestData({ ...p.testData, tests: p.testData.tests.map((test) => test.id === newTest.id ? newTest : test) }) }
      ))) })
    },
    removeTest: async (index: number) => {
      const { projects, currentProject, saveTestData } = get()
      set({ projects: await Promise.all(projects.map(async (p) => (
        p.title !== currentProject ? p :
          { ...p, testData: await saveTestData({ ...p.testData, tests: p.testData.tests.filter((_, i) => i !== index) }) }
      ))) })
    },
    addGrain: async (grain: TestGrain) => {
      const { projects, currentProject, saveTestData } = get()
      delete grain.type
      const json = { "save-grain": { meal: "rice", project: currentProject, grain: { ".y": grain } } }

      // const json = {"save-grain":{"meal":"rice","project":"zippity","grain":{".y":{"id":"0x1.beef","lord":"0x7367.697a","holder":"0xbeef","town-id":"0x123","label":"account","salt":1936157050,"data":{"metadata":"0x7367.697a","balance":"50","allowances":"(malt ~[[0xdead 1.000]])"}}}}}
      
      console.log('GRAIN:', JSON.stringify(json))
      await api.poke({ app: 'citadel', mark: 'citadel-action', json })

      set({ projects: await Promise.all(projects.map(async (p) => (
        p.title !== currentProject ? p :
          { ...p, testData: await saveTestData({ ...p.testData, grains: p.testData.grains.concat([grain]) }) }
      ))) })
    },
    updateGrain: async (newGrain: TestGrain) => {
      const { projects, currentProject, saveTestData} = get()
      delete newGrain.type
      const json = { "save-grain": { meal: "rice", project: currentProject, grain: { ".y": newGrain } } }
      await api.poke({ app: 'citadel', mark: 'citadel-action', json })

      set({ projects: await Promise.all(projects.map(async (p) => (
        p.title !== currentProject ? p :
          { ...p, testData: await saveTestData({ ...p.testData, grains: p.testData.grains.map((g) => g.id === newGrain.id ? newGrain : g) }) }
      ))) })
    },
    setGrains: async (grains: TestGrain[]) => {
      const { projects, currentProject, saveTestData } = get()

      set({ projects: await Promise.all(projects.map(async (p) => (
        p.title !== currentProject ? p :
          { ...p, testData: await saveTestData({ ...p.testData, grains }) }
      ))) })
    },
    removeGrain: async (grain: number | TestGrain) => {
      const { projects, currentProject, saveFiles } = get()

      const grainId = typeof grain === 'number' ? projects.find((p) => p.title === currentProject)?.testData?.grains?.[grain]?.id : grain.id
      if (grainId) {
        await api.poke({ app: 'citadel', mark: 'citadel-action', json: { 'delete-grain': { project: currentProject, 'grain-id': grainId } } })
      }

      if (typeof grain === 'number') {
        set({ projects: projects.map(p => p.title === currentProject ? { ...p, testData: { ...p.testData, grains: p.testData.grains.filter((_, i) => i !== grain) } } : p) })
      } else {
        set({ projects: projects.map(p => p.title === currentProject ? { ...p, testData: { ...p.testData, grains: p.testData.grains.filter((g) => g.id !== grain.id) } } : p) })
      }

      setTimeout(saveFiles, 100)
    },
    saveTestData: async (testData: TestData) => {
      const { currentProject } = get()
      const json = { 'save-test': { project: currentProject, test: JSON.stringify(testData), override: true } }
      console.log(JSON.stringify({ app: 'citadel', mark: 'citadel-action', json }))
      await api.poke({ app: 'citadel', mark: 'citadel-action', json })
      return testData
    },
  }),
  {
    name: 'contractStore'
  }
));

export default useContractStore;

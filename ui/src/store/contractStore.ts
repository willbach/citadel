import create from "zustand"
import { persist } from "zustand/middleware"
import api from "../api";
import { genFungibleMetadata, RawMetadata } from "../code-text/test-data/fungible";
import { Molds } from "../types/Molds";
import { EditorTextState, Project } from "../types/Project";
import { Route } from "../types/Route";
import { Test, TestData, TestOutput } from "../types/TestData";
import { TestGrain } from "../types/TestGrain";
import { EMPTY_TEST_DATA, getInitialContractText, getInitialMolds, getInitialTestData } from "../utils/create-project";
import { parseRawProject } from "../utils/project";
import { handleMoldsUpdate, handleTestResult } from "./subscriptions/contract";
import { createSubscription } from "./subscriptions/createSubscription";

const getCurrentProject = (curP: string, ps: Project[]) : Project | undefined => ps.find(p => p.title === curP)

const storeGrain = (project: string) => async (grain: TestGrain) => {
  const json = { "save-grain": { meal: "rice", project, grain: { ".y": grain } } }
  await api.poke({ app: 'citadel', mark: 'citadel-action', json })
}

export interface ContractStore {
  loading?: string
  currentProject: string
  projects: Project[]
  openApps: string[]
  currentApp: string
  route: Route
  testOutput: TestOutput[]
  setRoute: (route: Route) => void
  setLoading: (loading?: string) => void
  init: () => Promise<void>
  createProject: (options: { [key: string]: string }, rawMetadata?: RawMetadata) => Promise<void>
  setCurrentProject: (currentProject: string) => void
  addApp: (app: string) => void
  setCurrentApp: (currentApp: string) => void
  removeApp: (app: string) => void
  setMolds: (molds: Molds) => void
  setTextState: (text: EditorTextState) => void
  saveFiles: (project?: Project, action?: string) => Promise<void>
  deleteProject: () => Promise<void>
  runTests: () => Promise<void>
  addTest: (test: Test) => Promise<void>
  updateTest: (test: Test) => Promise<void>
  removeTest: (index: number) => Promise<void>
  addGrain: (grain: TestGrain) => Promise<void>
  updateGrain: (grain: TestGrain) => Promise<void>
  setGrains: (grains: TestGrain[]) => Promise<void>
  removeGrain: (grain: number | TestGrain) => Promise<void>
  saveTestData: (testData: TestData, projectTitle?: string) => Promise<TestData>
}

const useContractStore = create<ContractStore>(persist<ContractStore>(
  (set, get) => ({
    loading: '',
    currentProject: '',
    projects: [],
    openApps: ['webterm'],
    currentApp: '',
    route: { route: 'project', subRoute: 'new' },
    testOutput: [],
    setRoute: (route: Route) => set({ route }),
    setLoading: (loading?: string) => set({ loading }),
    init: async () => {
      api.subscribe(createSubscription('citadel', '/citadel/types', handleMoldsUpdate(get, set)))
      api.subscribe(createSubscription('citadel', '/citadel/test-result', handleTestResult(get, set)))
      
      const [rawProjects, rawTestData] = await Promise.all([
        api.scry({ app: 'citadel', path: '/projects' }),
        api.scry({ app: 'citadel', path: `/state/tests/all` }),
      ])

      if (rawProjects && rawProjects.length) {
        const projects = rawProjects.filter((rp: any) => rp).map((rp: any) => parseRawProject(rp, get().projects, rawTestData))
        set({ currentProject: projects[0].title, projects, route: { route: 'contract', subRoute: 'main' } })
      }

      set({ loading: undefined })
    },
    createProject: async (options: { [key: string]: string }, rawMetadata?: RawMetadata) => {
      set({ loading: 'Creating contract files...' })
      const { projects } = get()

      const newProject = {
        title: options.title,
        testData: EMPTY_TEST_DATA,
        molds: getInitialMolds(options),
        text: getInitialContractText(options, rawMetadata)
      }

      await get().saveFiles(newProject, 'save')

      const contractId = await api.scry({ app: 'citadel', path: `/project/id/${newProject.title}` })
      const metadataGrain = rawMetadata && genFungibleMetadata(contractId, rawMetadata)
      const testData: TestData = getInitialTestData(options, metadataGrain, contractId)
      get().saveTestData(testData, options.title)

      set({ loading: 'Creating initial granary...' })
      await Promise.all(testData.grains.map(storeGrain(newProject.title)))

      set({ loading: 'Compiling contract...' })
      await get().saveFiles(newProject, 'compile')

      set({ projects: projects.concat([{ ...newProject, testData }]), currentProject: options.title, loading: undefined })
    },
    setCurrentProject: (currentProject: string) => {
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
    saveFiles: async (newProject?: Project, action?: string) => {
      const { currentProject, projects } = get()
      const projectTitle = newProject?.title || currentProject
      const targetProject = newProject || getCurrentProject(projectTitle, projects)

      if (targetProject) {
        const { text: { contract_main, contract_types } } = targetProject

        const json = {
          save: {
            project: projectTitle,
            arena: 'contract',
            deeds: [
              { dir: 'lib', scroll: { text: contract_main, project: projectTitle, path: '/main/hoon' } },
              { dir: 'lib', scroll: { text: contract_types, project: projectTitle, path: '/types/hoon' } },
            ],
            charter: ''
          }
        }

        const compileJson = { save: { project: projectTitle, arena: 'contract', deeds: [], charter: contract_main } }

        if (action === 'save') {
          await api.poke({ app: 'citadel', mark: 'citadel-action', json })
        } else if (action === 'compile') {
          await api.poke({ app: 'citadel', mark: 'citadel-action', json: compileJson })
        } else {
          await api.poke({ app: 'citadel', mark: 'citadel-action', json })
          await api.poke({ app: 'citadel', mark: 'citadel-action', json: compileJson })
        }

      }
    },
    runTests: async () => {
      const { currentProject, projects } = get()
      const project = getCurrentProject(currentProject, projects)

      if (project) {
        // possible todo: check test validity before running
        const focusedTests = project.testData.tests.filter(({ focus }) => focus)
        const testsToRun = focusedTests.length ? focusedTests : project.testData.tests.filter(({ exclude }) => !exclude)

        if (!testsToRun.length) {
          return window.alert('Please make sure you have at least 1 test that is not excluded')
        }

        const json = {
          test: {
            grains: null,
            "contract-id": null,
            survey: {
              project: currentProject,
              deeds: [],
              arena: "contract",
              charter: ""
            },
            yolks: testsToRun.map(({ id, input: { value } }) => ({ id, yolk: value }))
          }
        }

        console.log('TESTS:', json.test.yolks)

        try {
          api.poke({ app: 'citadel', mark: 'citadel-action', json })
          set({ testOutput: testsToRun.map(({ id }) => ({ project: currentProject, id, status: -1 })) })
        } catch (e) {
          // window.alert('There was an error running the tests, please check the dojo and try again.')
        }
      }
    },
    deleteProject: async () => {
      const { currentProject, projects, route } = get()
      await api.poke({ app: 'citadel', mark: 'citadel-action', json: { delete: currentProject } })
      const newProjects = projects.filter(p => p.title !== currentProject)
      set({ projects: newProjects, currentProject: newProjects[0]?.title || '', route: newProjects.length < 1 ? { route: 'project', subRoute: 'new' } : route })
    },
    addTest: async (test: Test) => {
      const { projects, currentProject, saveTestData } = get()
      set({ projects: await Promise.all(projects.map(async (p) => (
        p.title !== currentProject ? p :
          { ...p, testData: await saveTestData({ ...p.testData, tests: p.testData.tests.concat([test]) }) }
      ))) })
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
      await storeGrain(currentProject)(grain)

      set({ projects: await Promise.all(projects.map(async (p) => (
        p.title !== currentProject ? p :
          { ...p, testData: await saveTestData({ ...p.testData, grains: p.testData.grains.concat([grain]) }) }
      ))) })
    },
    updateGrain: async (newGrain: TestGrain) => {
      const { projects, currentProject, saveTestData} = get()
      await storeGrain(currentProject)(newGrain)

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
    saveTestData: async (testData: TestData, projectTitle?: string) => {
      const { currentProject } = get()
      const json = { 'save-test': { project: projectTitle || currentProject, test: JSON.stringify(testData), override: true } }
      await api.poke({ app: 'citadel', mark: 'citadel-action', json })
      return testData
    },
  }),
  {
    name: 'contractStore'
  }
));

export default useContractStore;

import create from "zustand"
import { persist } from "zustand/middleware"
import api from "../api";
import { genFungibleMetadata, RawMetadata } from "../code-text/test-data/fungible";
import { Molds } from "../types/Molds";
import { EditorTextState, Project } from "../types/Project";
import { Route } from "../types/Route";
import { Test, TestData } from "../types/TestData";
import { TestGrain } from "../types/TestGrain";
import { EMPTY_TEST_DATA, getInitialContractText, getInitialMolds, getInitialTestData } from "../utils/create-project";
import { parseRawProject } from "../utils/project";
import { handleMoldsUpdate } from "./subscriptions/contract";
import { createSubscription } from "./subscriptions/createSubscription";

const getCurrentProject = (curP: string, ps: Project[]) : Project | undefined => ps.find(p => p.title === curP)

const storeGrain = (project: string) => async (grain: TestGrain) => {
  const formattedGrain = {
    ...grain,
    data: `[${Object.values(grain.data).map(({ value }) => value).join(' ')}]`
  }
  const json = { "save-grain": { meal: "rice", project, grain: { ".y": formattedGrain } } }

  console.log(json)

  await api.poke({ app: 'citadel', mark: 'citadel-action', json })
}

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
      
      const [rawProjects, rawTestData] = await Promise.all([
        api.scry({ app: 'citadel', path: '/projects' }),
        api.scry({ app: 'citadel', path: `/state/tests/all` }),
      ])

      if (rawProjects && rawProjects.length) {
        const projects = rawProjects.filter((rp: any) => rp).map((rp: any) => parseRawProject(rp, get().projects, rawTestData))
        set({ currentProject: projects[0].title, projects, route: { route: 'contract', subRoute: 'main' } })
      }

      // const contractId = await api.scry({ app: 'citadel', path: `/project/id/${get().currentProject}` })
      // console.log(contractId)
      // const testData = getInitialTestData({ token: 'fungible' }, {
      //   id: contractId,
      //   lord: contractId,
      //   holder: contractId,
      //   'town-id': '0x123',
      //   label: 'token-metadata',
      //   salt: 9843912418,
      //   data: {
      //     name: { type: '@t', value: "Zippity Token" },
      //     symbol: { type: '@t', value: "ZPTY" },
      //     decimals: { type: '@ud', value: "18" },
      //     supply: { type: '@ud', value: "1000000" },
      //     cap: { type: '@ud', value: "" },
      //     mintable: { type: '?', value: "true" },
      //     minters: { type: '@t', value: "[0xbeef]" },
      //     deployer: { type: '@ux', value: "0x0" },
      //     salt: { type: '@', value: '9843912418' }
      //   }
      // }, contractId)
      // console.log(testData)
      // get().saveTestData(testData)

      set({ loading: false })
    },
    createProject: async (options: { [key: string]: string }, rawMetadata?: RawMetadata) => {
      const { projects } = get()

      console.log(1, options, getInitialContractText(options))

      const newProject = {
        title: options.title,
        testData: EMPTY_TEST_DATA,
        molds: getInitialMolds(options),
        text: getInitialContractText(options)
      }

      console.log(2)

      await get().saveFiles(newProject)
      
      const contractId = await api.scry({ app: 'citadel', path: `/project/id/${newProject.title}` })
      console.log(3, contractId)
      const metadataGrain = rawMetadata && genFungibleMetadata(contractId, rawMetadata)
      const testData: TestData = getInitialTestData(options, metadataGrain, contractId)
      console.log(4, testData)
      get().saveTestData(testData, options.title)

      console.log(5)
      // await Promise.all(testData.grains.map(storeGrain(newProject.title)))

      set({ projects: projects.concat([{ ...newProject, testData }]), currentProject: options.title })
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
    saveFiles: async (newProject?: Project) => {
      const { currentProject, projects } = get()
      const projectTitle = newProject?.title || currentProject
      console.log(1, 'saving', projectTitle)
      const targetProject = newProject || getCurrentProject(projectTitle, projects)
      console.log(2, targetProject?.text)

      if (targetProject) {
        const { text: { contract_main, contract_types } } = targetProject
        console.log(3, contract_main.length)

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

        await api.poke({ app: 'citadel', mark: 'citadel-action', json })

        const saveJson = {
          save: {
            project: projectTitle,
            arena: 'contract',
            deeds: [],
            charter: contract_main
          }
        }

        await api.poke({ app: 'citadel', mark: 'citadel-action', json: saveJson })

        // const saveJson = {
        //   mill: {
        //     survey: {
        //       project: projectTitle,
        //       arena: 'contract',
        //       deeds: [],
        //       charter: contract_main,
        //       bran: ['0x79.7469.7070.697a', '0x79.7469.7070.697a', '0x79.7469.7070.697a', '0x0', null, null],
        //     }
        //   }
        // }

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
            "contract-id": null,
            survey: {
              project: currentProject,
              deeds: [],
              arena: "contract",
              charter: ""
            },
            // "yolks": ["[%give 10 0xdead 30 0x1.beef 0x1.dead]"] // this should be the list of testsToRun
            yolks: testsToRun.map(({ input: { value } }) => value)
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

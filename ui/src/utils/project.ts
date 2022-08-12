import { Project } from "../types/Project"
import { TestGrain } from "../types/TestGrain"

export const parseRawProject = (rawProject: any, projects: Project[]): Project => {
  const title = Object.keys(rawProject)[0]
  const files = rawProject[title]

  const storedProject = projects.find((p) => p.title === title)
  const text = files.reduce((acc:  { [key: string]: string }, cur: any) => {
      acc[`contract_${cur.scroll.path.split('/').slice(0, -1).join('')}`] = cur.scroll.text
      return acc
    }, {})

  return {
    title,
    text,
    molds: storedProject?.molds || { actions: {}, rice: {} },
    testData: storedProject?.testData || { "tests": [], "grains": [] }
  }
}

export const parseRawGrains = (rawGrains: any[]): TestGrain[] => {
  return rawGrains
    .filter((g: any) => (g[1] as any)?.q?.['.y'])
    .map((g: any) => (g[1] as any)?.q?.['.y'])
    .map((g: any) => {
      const newGrain = { ...g, data: g.data.flat(Infinity).map((d: any) => Object.keys(d)[0]).join('') }
      try {
        return { ...g, data: JSON.parse(newGrain.data) }
      } catch (e) {
        return newGrain
      }
    })
}

import { Project } from "../types/Project"

export const parseRawProject = (rawProject: any, projects: Project[]): Project => {
  const formattedProject = Array.isArray(rawProject[0]) ? rawProject.flat(1) : rawProject
  const [title] = formattedProject
  const storedProject = projects.find((p) => p.title === title)
  const text = formattedProject.slice(1)
    .reduce((acc:  { [key: string]: string }, cur:any) => {
      const file = cur.flat(Infinity)
      acc[`contract_${file[1].path[0]}`] = file[1].text
      return acc
    }, {})

  return {
    title,
    text,
    molds: storedProject?.molds || { actions: {}, rice: {} },
    testData: JSON.parse(text.contract_tests || '{"tests": [], "grains": []}')
  }
}

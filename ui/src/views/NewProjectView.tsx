import React, { useCallback, useState } from 'react'
import { FaArrowLeft } from 'react-icons/fa';
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/material.css'
import 'codemirror/addon/display/placeholder'
import Button from '../components/form/Button'
import Col from '../components/spacing/Col'
import Row from '../components/spacing/Row'
import useContractStore from '../store/contractStore';
import Input from '../components/form/Input';
import { BLANK_METADATA, RawMetadata } from '../code-text/test-data/fungible';

import './NewProjectView.scss'
import { MetadataForm } from '../components/forms/MetadataForm';

type CreationStep = 'title' | 'project' | 'token' |  'template' | 'metadata'
export type CreationOption = 'contract' | 'gall' | 'fungible' | 'nft' | 'issue' | 'wrapper' | 'title' | 'metadata'

const NewProjectView = ({ hide = false }: { hide?: boolean }) => {
  const { projects, createProject, setRoute } = useContractStore()
  
  const [step, setStep] = useState<CreationStep>('title')
  const [options, setOptions] = useState<{ [key: string]: CreationOption | string | undefined }>({ title: '' })
  const [metadata, setMetadata] = useState<RawMetadata>(BLANK_METADATA)

  const onSelect = useCallback((option: CreationOption) => async () => {
    switch (step) {
      case 'title':
        if (projects.find(({ title }) => title === options.title)) {
          window.alert('You already have a project with that name')
          break
        }
        setStep('project')
        break
      case 'project':
        setOptions({ ...options, project: option })
        setStep('token')
        break
      case 'token':
        setOptions({ ...options, token: option })
        setStep('template')
        break
      case 'template':
        if (option === 'issue') {
          setOptions({ ...options, template: option })
          setStep('metadata')
        } else {
          createProject({ ...options, template: option })
          setRoute({ route: 'contract', subRoute: 'main' })
        }
        break
      default:
        await createProject(options as { [key: string]: string }, metadata)
        setRoute({ route: 'contract', subRoute: 'main' })
        break
    }
    setOptions({ ...options,  })
  }, [step, setStep, options, setOptions, projects, createProject, metadata, setRoute])

  const onBack = useCallback(() => {
    switch (step) {
      case 'title':
        setRoute({ route: 'contract', subRoute: 'main' })
        break
      case 'project':
        setOptions({ ...options, title: '' })
        setStep('title')
        break
      case 'token':
        setOptions({ ...options, project: undefined })
        setStep('project')
        break
      case 'template':
        setOptions({ ...options, token: undefined })
        setStep('token')
        break
      case 'metadata':
        setOptions({ ...options, template: undefined })
        setMetadata(BLANK_METADATA)
        setStep('template')
        break
    }
  }, [step, setStep, options, setOptions, setRoute])

  const renderContent = () => {
    const buttonStyle = {
      width: '48%',
      minWidth: 240,
      height: '60px',
      verticalAlign: 'middle',
      justifyContent: 'center',
    }

    const backButton = <Button style={{ position: 'absolute', left: 0 }} iconOnly onClick={onBack} variant="unstyled" icon={<FaArrowLeft />} />

    if (step === 'title') {
      return (
        <>
          <Row style={{ width: '100%', position: 'relative', justifyContent: 'center' }}>
            {projects.length > 0 && backButton}
            <h3>New Project Title:</h3>
          </Row>
          <Input
            style={{ width: 220 }}
            onChange={(e) => setOptions({ title: e.target.value?.replace(' ', '') })}
            value={options.title || ''}
            placeholder="Title (no spaces)"
          />
          <Button variant='dark' style={{ marginTop: 16, width: 240, justifyContent: 'center' }} onClick={onSelect('title')}>
            Next
          </Button>
        </>
      )
    } else if (step === 'project') {
      return (
        <>
          <Row style={{ width: '100%', position: 'relative', justifyContent: 'center' }}>
            {backButton}
            <h3>Select Your Project Type:</h3>
          </Row>
          <Row style={{ flexWrap: 'wrap', width: '100%', justifyContent: 'space-between', marginTop: 12 }}>
            <Button style={buttonStyle} onClick={onSelect('contract')}>
              Uqbar Contract
            </Button>
            <Button style={buttonStyle} onClick={onSelect('gall')}>
              Uqbar Contract + Gall App
            </Button>
          </Row>
        </>
      )
    } else if (step === 'token') {
      return (
        <>
          <Row style={{ width: '100%', position: 'relative', justifyContent: 'center' }}>
            {backButton}
            <h3>Select Token Type:</h3>
          </Row>
          <Row style={{ flexWrap: 'wrap', width: '100%', justifyContent: 'space-between', marginTop: 12 }}>
            <Button style={buttonStyle} onClick={onSelect('fungible')}>
              Fungible Token
            </Button>
            <Button style={buttonStyle} onClick={onSelect('nft')}>
              Non-Fungible Token (NFT)
            </Button>
          </Row>
        </>
      )
    } else if (step === 'template') {
      return (
        <>
          <Row style={{ width: '100%', position: 'relative', justifyContent: 'center' }}>
            {backButton}
            <h3>Select Template Type:</h3>
          </Row>
          <Row style={{ flexWrap: 'wrap', width: '100%', justifyContent: 'space-between', marginTop: 12 }}>
            <Button style={buttonStyle} onClick={onSelect('issue')}>
              Issue New Token
            </Button>
            <Button style={buttonStyle} onClick={onSelect('wrapper')}>
              Wrapper Logic for Token
            </Button>
          </Row>
        </>
      )
    } else {
      return (
        <>
          <Row style={{ width: '100%', position: 'relative', justifyContent: 'center' }}>
            {backButton}
            <h3>Token Info:</h3>
          </Row>
          <MetadataForm metadata={metadata} setMetadata={setMetadata} onSubmit={onSelect('metadata')} />
        </>
      )
    }
  }

  return (
    <Col style={{ position: 'absolute', visibility: hide ? 'hidden' : 'visible', width: '100%', maxWidth: 600, height: '80%', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', justifySelf: 'center' }}>
      {renderContent()}
    </Col>
  )
}

export default NewProjectView

// import Iframe from 'react-iframe'
// import { Resizable, ResizeCallback } from 're-resizable'
// import create from 'zustand'
// import { persist } from 'zustand/middleware'
// const termUrl = '/apps/webterm'

// const windowSettings = create(persist((set, get) => ({
//   termRatio: .66
// }), {
//   name: 'citadel-settings'
// }))

// const Resizer = () => (
//   <div className='absolute right-0 top-0 px-2 -mr-2'>
//     <div className='flex items-center h-screen bg-gray-200'>
//       <SelectorIcon className='h-6 w-6 text-gray-800 rotate-90' />
//     </div>
//   </div>
// )

import React, { useCallback, useMemo, useState } from 'react'
import { Droppable } from 'react-beautiful-dnd'
import { FaPen, FaTrash, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import Col from '../spacing/Col'
import Row from '../spacing/Row'
import useContractStore from '../../store/contractStore';
import Button from '../form/Button';
import { Test } from '../../types/TestData';
import { EMPTY_PROJECT } from '../../types/Project';
import { Molds } from '../../types/Molds';
import { GrainDisplaySmall } from './GrainDisplay';
import { Values } from './ValuesDisplay';
import Input from '../form/Input';

export const DROPPABLE_DIVIDER = '___'

interface TestEntryProps extends TestListProps {
  test: Test
  testIndex: number
  molds: Molds
}

export const TestEntry = ({ test, testIndex, editTest, molds }: TestEntryProps) => {
  // need to handle action recursively
  const { removeTest, updateTest } = useContractStore()
  const [expandInput, setExpandInput] = useState(false)
  const [expandOutput, setExpandOutput] = useState(false)

  const testStyle = {
    justifyContent: 'space-between',
    margin: 8,
    padding: 8,
    border: '1px solid black',
    borderRadius: 4,
  }

  const toggleTestFocus = useCallback(() => {
    updateTest({ ...test, focus: !test.focus })
  }, [test, updateTest])

  const toggleTestExclude = useCallback(() => {
    updateTest({ ...test, exclude: !test.exclude })
  }, [test, updateTest])

  console.log(test.input.action)

  return (
    <Col className="action" style={{ ...testStyle, position: 'relative' }}>
      <Row style={{ justifyContent: 'space-between', borderBottom: '1px solid gray', paddingBottom: 2, marginBottom: 4 }}>
        <Row style={{ marginBottom: 4, marginLeft: -4 }}>
          <Row>
            <Input type="checkbox" checked={Boolean(test.focus)} onChange={toggleTestFocus} />
            <div>Focus</div>
          </Row>
          <Row style={{ marginLeft: 4 }}>
            <Input type="checkbox" checked={Boolean(test.exclude)} onChange={toggleTestExclude} />
            <div>Exclude</div>
          </Row>
        </Row>
        <Row style={{ marginRight: 4, marginTop: -4 }}>
          <Button
            onClick={() => editTest(test)}
            variant='unstyled'
            className="delete"
            iconOnly
            icon={<FaPen size={14} />}
          />
          <Button
            onClick={() => { if(window.confirm('Are you sure you want to remove this test?')) removeTest(testIndex) }}
            variant='unstyled'
            className="delete"
            style={{ marginLeft: 8 }}
            icon={<FaTrash size={16} />}
            iconOnly
          />
        </Row>
      </Row>
      <Col style={{ width: '100%', borderBottom: '1px solid gray', paddingTop: 6, paddingBottom: 6 }}>
        <Row style={{ marginBottom: 4 }}>
          <Button
            onClick={() => setExpandInput(!expandInput)}
            variant='unstyled'
            style={{ marginRight: 8, marginTop: 2, alignSelf: 'flex-start' }}
            iconOnly
            icon={expandInput ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
          />
          Action: %{test.input.action.type}
        </Row>
        {expandInput && (
          <Col style={{ width: '100%', marginBottom: 6 }}>
            <div style={{ marginBottom: 4 }}>From: {test.input.cart.from}</div>
            <div style={{ marginBottom: 4 }}>Cart Grains: ({test.input.cart.grains?.length})</div>
            <Droppable droppableId={`${test.id}___${test.input.cart.from}`} style={{ width: '100%' }}>
              {(provided: any) => (
                <Row {...provided.droppableProps} innerRef={provided.innerRef}
                style={{ ...provided.droppableProps.style, backgroundColor: 'lightgray', width: '100%', height: 80, borderRadius: 4, overflow: 'scroll', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                  {test.input.cart.grains.map(grain => (
                    <GrainDisplaySmall key={grain} grain={grain} test={test} />
                  ))}
                  {provided.placeholder}
                </Row>
              )}
            </Droppable>
            <h4 style={{ marginBottom: 0 }}>%{test.input.action.type}</h4>
            {/* display the action recursively */}
            <Values indent={1} values={test.input.action} test={test} actionMold={molds.actions[test.input.action.type as string]} />
          </Col>
        )}
      </Col>
      <Col className="output" style={{ flex: 1, marginTop: 4, paddingTop: 6 }}>
        <Row style={{ marginBottom: 4 }}>
          <Button
            onClick={() => setExpandOutput(!expandOutput)}
            variant='unstyled'
            style={{ marginRight: 8, marginTop: 2, alignSelf: 'flex-start' }}
            iconOnly
            icon={expandOutput ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
          />
          {test.output ? 'Expected' : ''} Output:
        </Row>
        {expandOutput && (
          <Col>
            {JSON.stringify(test.output) || 'null'}
          </Col>
        )}
      </Col>
    </Col>
  )
}

interface TestListProps {
  editTest: (test: Test) => void
  molds: Molds
}

export const TestList = ({ editTest, molds }: TestListProps) => {
  const { projects, currentProject } = useContractStore()
  const project = useMemo(() => projects.find(p => p.title === currentProject), [currentProject, projects])
  const { testData } = useMemo(() => project || EMPTY_PROJECT, [project])

  return (
    <Col className="test-list">
      {testData.tests.map((test, i) => <TestEntry key={test.id} test={test} testIndex={i} editTest={editTest} molds={molds} />)}
    </Col>
  )
}

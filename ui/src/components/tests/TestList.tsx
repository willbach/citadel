import React, { useMemo } from 'react'
import { Droppable } from 'react-beautiful-dnd'
import { FaPen, FaTrash } from 'react-icons/fa';
import Col from '../spacing/Col'
import Row from '../spacing/Row'
import useContractStore from '../../store/contractStore';
import Button from '../form/Button';
import { Test } from '../../types/TestData';
import { EMPTY_PROJECT } from '../../types/Project';
import { Molds } from '../../types/Molds';
import { GrainDisplaySmall } from './GrainDisplay';
import { Values } from './ValuesDisplay';

export const DROPPABLE_DIVIDER = '___'

interface TestEntryProps extends TestListProps {
  test: Test
  testIndex: number
  molds: Molds
}

export const TestEntry = ({ test, testIndex, editTest, molds }: TestEntryProps) => {
  // need to handle action recursively
  const { removeTest } = useContractStore()

  const testStyle = {
    justifyContent: 'space-between',
    margin: 8,
    padding: 8,
    border: '1px solid black',
    borderRadius: 4,
  }

  return (
    <Col className="action" style={{ ...testStyle, position: 'relative' }}>
      {/* TODO: mark all tests with actions with "outdated: true" with a marker */}
      <Col>
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
      </Col>
      <Row>
        <Col style={{ width: '100%' }}>
          <h4 style={{ marginBottom: 0 }}>%{test.input.action.type}</h4>
          {/* display the action recursively */}
          <Values indent={1} values={test.input.action} test={test} actionMold={molds.actions[test.input.action.type as string]} />
        </Col>
      </Row>
      <Row style={{ position: 'absolute', top: 4, right: 4, padding: 4 }}>
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
      {/* <Col className="output" style={{ flex: 1 }}>
        {JSON.stringify(test.output)}
      </Col> */}
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

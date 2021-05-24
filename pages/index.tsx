import React from 'react';
import produce from 'immer';
import _ from 'lodash';
import {
  Spinner,
  IconButton,
  Checkbox,
  Editable,
  EditablePreview,
  EditableInput,
  Fade,
} from '@chakra-ui/react';
import { RepeatIcon, AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { useTodoList } from 'hooks/useTodoList';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import {
  addToDeleteHintMapSelector,
  toBeDeletedHintMapState,
} from 'global-store';
import { Record } from 'interfaces';

export default function Home() {
  return (
    <div className="container">
      <TodoList />

      <style jsx global>{`
        #__next,
        body,
        html {
          margin: 0px;
          height: 100%;
        }
        body {
          padding: 25px;
          background: #eeeeee;
        }
      `}</style>
      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background: #ffffff;
          padding: 25px;
          width: 400px;
          min-height: 400px;
          margin-left: auto;
          margin-right: auto;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
}

const TodoList = () => {
  const { todoList, isProcessing, refresh, addNewTodo } = useTodoList();

  return (
    <div>
      <div
        style={{
          marginBottom: 10,
          display: 'flex',
          alignItems: 'center',
          minWidth: 260,
        }}
      >
        <IconButton
          aria-label="Refresh"
          icon={<RepeatIcon />}
          onClick={() => {
            refresh();
          }}
          style={{ marginRight: 10 }}
        />
        <IconButton
          aria-label="Add"
          icon={<AddIcon />}
          onClick={() => {
            addNewTodo();
          }}
          style={{ marginRight: 10 }}
        />
        {isProcessing && <Spinner color="blue.500" />}
      </div>

      {todoList.map((todo) => {
        return (
          <Todo
            key={
              todo.id +
              '/' +
              todo.fields.Name +
              '/' +
              (todo.fields.Done ? 'O' : 'X')
            }
            todo={todo}
          />
        );
      })}
    </div>
  );
};

const Todo = (props: { todo: Record }) => {
  const { todo } = props;
  const { updateTodo, deleteTodo } = useTodoList();
  const toBeDeletedMap = useRecoilValue(toBeDeletedHintMapState);
  const addToDeleteMap = useSetRecoilState(addToDeleteHintMapSelector);
  const debounceUpdate = _.debounce((todo: Record, nextValue: string) => {
    const updated = produce(todo, (nextTodo) => {
      nextTodo.fields.Name = nextValue;
    });
    updateTodo(updated);
  }, 1500);
  const toBeDeleted = toBeDeletedMap[todo.id];
  return (
    <Fade
      in={!toBeDeleted}
      style={{
        height: toBeDeleted ? 0 : 30,
        transition: toBeDeleted ? '0.5s height ease' : undefined,
      }}
    >
      <div className="todo">
        <Checkbox
          defaultChecked={todo.fields.Done === true}
          style={{ marginRight: 10, verticalAlign: 'top' }}
          onChange={(e) => {
            const checked = e.target.checked;
            const updated = produce(todo, (nextTodo) => {
              nextTodo.fields.Done = checked;
            });
            updateTodo(updated);
          }}
        />
        <div style={{ width: 200, marginRight: 10 }}>
          <Editable
            style={{
              display: 'flex',
              alignItems: 'center',
              height: '100%',
              minHeight: 30,
            }}
            defaultValue={todo.fields.Name}
            onChange={(nextValue) => {
              debounceUpdate(todo, nextValue);
            }}
          >
            <EditablePreview style={{ width: '100%' }} />
            <EditableInput />
          </Editable>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <IconButton
            aria-label="Delete"
            size="xs"
            colorScheme="red"
            icon={<DeleteIcon />}
            onClick={() => {
              addToDeleteMap(todo.id);
              deleteTodo(todo.id);
            }}
          />
        </div>
      </div>
      <style jsx>{`
        .todo {
          display: flex;
        }
      `}</style>
    </Fade>
  );
};

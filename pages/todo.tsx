import React from 'react';
import produce from 'immer';
import {
  Button,
  Checkbox,
  Editable,
  EditableInput,
  EditablePreview,
} from '@chakra-ui/react';

import { useTodoList } from 'hooks/useTodoList';

export default function Todo() {
  const {
    todoList,
    isLoading,
    addNewTodo,
    updateTodo,
    updateChecked,
    deleteTodo,
  } = useTodoList();

  if (isLoading) {
    return <div>loading...</div>;
  }

  return (
    <div>
      <Button
        onClick={() => {
          addNewTodo();
        }}
      >
        +
      </Button>
      {todoList.map((row) => (
        <div key={row.id} style={{ display: 'flex' }}>
          <Checkbox
            defaultChecked={row.fields.Done}
            onChange={(e) => {
              const { checked } = e.target;
              updateChecked(row, checked);
              const newRow = produce(row, (nextRow) => {
                nextRow.fields.Done = checked;
              });
              updateTodo(newRow);
            }}
          />
          <Editable
            defaultValue={row.fields.Name}
            onChange={(nextValue) => {
              const newRecord = produce(row, (nextRow) => {
                nextRow.fields.Name = nextValue;
              });
              updateTodo(newRecord);
            }}
          >
            <EditablePreview />
            <EditableInput />
          </Editable>
          <Button
            colorScheme="red"
            size="xs"
            onClick={() => {
              deleteTodo(row.id);
            }}
            style={{ marginLeft: '12px' }}
          >
            삭제
          </Button>
        </div>
      ))}
    </div>
  );
}

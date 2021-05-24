import { useEffect, useMemo } from 'react';
import axios from 'axios';
import { produce } from 'immer';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useToast } from '@chakra-ui/react';

import {
  addToDeleteHintMapSelector,
  removeFromDeleteHintMapSelector,
  toBeDeletedHintMapState,
} from 'global-store';
import { Record } from '../interfaces';

export function useTodoList() {
  const deleteHintMap = useRecoilValue(toBeDeletedHintMapState);
  const addToDeleteHintMap = useSetRecoilState(addToDeleteHintMapSelector);
  const removeFromDeleteHintMap = useSetRecoilState(
    removeFromDeleteHintMapSelector
  );

  const queryClient = useQueryClient();
  const toast = useToast();
  const key = 'todo-list';

  const { data, isLoading, isSuccess } = useQuery(key, () => {
    return axios.get('/api/todo');
  });

  const todoList: Record[] = useMemo(() => {
    if (isSuccess && data.data) {
      const { records } = data.data;
      return records.filter((record) => !deleteHintMap[record.id]);
    }
    return [];
  }, [isSuccess, data, deleteHintMap]);

  const createMutation = useMutation(
    () =>
      axios.post('/api/todo', {
        fields: {
          Name: '',
          Done: false,
        },
      }),
    {
      onSuccess: () => {
        refresh();
        toast({
          title: 'Added',
          status: 'info',
          position: 'bottom',
          duration: 1500,
        });
      },
    }
  );

  const deleteMutation = useMutation(
    (id: string) => {
      addToDeleteHintMap(id);
      return axios.delete(`/api/todo?id=${id}`);
    },
    {
      onSuccess: () => {
        refresh();
        toast({
          title: 'Deleted',
          status: 'error',
          position: 'bottom',
          duration: 1500,
        });
      },
      onError: (e, id) => {
        removeFromDeleteHintMap(id);
      },
    }
  );

  const updateMutation = useMutation(
    (record: Record) => axios.patch(`/api/todo?id=${record.id}`, record),
    {
      onSuccess: () => {
        refresh();
      },
    }
  );

  const refresh = () => {
    queryClient.invalidateQueries(key);
  };

  useEffect(() => {
    if (!isSuccess) {
      toast({
        title: 'Data fetch success!',
        status: 'info',
        position: 'bottom',
        duration: 1500,
      });
    }
  }, [isSuccess]);

  const updateChecked = (row: Record, checked: boolean) => {
    const newRow = produce(row, (nextRow) => {
      nextRow.fields.Done = checked;
    });
    updateMutation.mutate(newRow);
  };

  return {
    todoList,
    isLoading: isLoading,
    isProcessing:
      createMutation.isLoading ||
      deleteMutation.isLoading ||
      updateMutation.isLoading,
    refresh: refresh,
    addNewTodo: createMutation.mutate,
    deleteTodo: deleteMutation.mutate,
    updateTodo: updateMutation.mutate,
    updateChecked,
  };
}

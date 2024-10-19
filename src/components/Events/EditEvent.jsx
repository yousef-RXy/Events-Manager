import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { fetchEvent, queryClient, updateEvent } from '../../util/http.js';
import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';

export default function EditEvent() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['events', id],
    queryFn: ({ signal }) => fetchEvent({ id, signal }),
  });
  const { mutate } = useMutation({
    mutationFn: updateEvent,
    onMutate: async ({ event }) => {
      await queryClient.cancelQueries({ queryKey: ['events', id] });
      const prevEvent = queryClient.getQueryData(['events', id]);
      queryClient.setQueryData(['events', id], event);
      return { prevEvent };
    },
    onError: (error, data, { prevEvent }) => {
      queryClient.setQueryData(['events', id], prevEvent);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['events', id]);
    },
  });

  function handleSubmit(formData) {
    mutate({ id, event: formData });
    navigate('../');
  }

  function handleClose() {
    navigate('../');
  }

  return (
    <Modal onClose={handleClose}>
      {isError && (
        <div className="center">
          <ErrorBlock
            title="An error occurred"
            message={error.info?.message || 'Failed to fetch event details'}
          />
          <Link to=".." className="button">
            Okay
          </Link>
        </div>
      )}
      {isPending && (
        <div className="center">
          <LoadingIndicator />
        </div>
      )}
      {data && (
        <EventForm inputData={data} onSubmit={handleSubmit}>
          <Link to="../" className="button-text">
            Cancel
          </Link>
          <button type="submit" className="button">
            Update
          </button>
        </EventForm>
      )}
    </Modal>
  );
}

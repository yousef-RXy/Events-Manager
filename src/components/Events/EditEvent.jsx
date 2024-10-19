import {
  Link,
  redirect,
  useNavigate,
  useNavigation,
  useParams,
  useSubmit,
} from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { fetchEvent, queryClient, updateEvent } from '../../util/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import LoadingIndicator from '../UI/LoadingIndicator.jsx';

export default function EditEvent() {
  const navigate = useNavigate();
  const { state } = useNavigation();
  const { id } = useParams();
  const submit = useSubmit();

  const { data, isError, error } = useQuery({
    queryKey: ['events', id],
    queryFn: ({ signal }) => fetchEvent({ id, signal }),
    staleTime: 10000,
  });

  /*
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
  */

  function handleSubmit(formData) {
    submit(formData, { method: 'PUT' });
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
      {state === 'submitting' && (
        <div className="center">
          <LoadingIndicator />
        </div>
      )}

      {data && !(state === 'submitting') && (
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

// eslint-disable-next-line react-refresh/only-export-components
export function loader({ params: { id } }) {
  return queryClient.fetchQuery({
    queryKey: ['events', id],
    queryFn: ({ signal }) => fetchEvent({ id, signal }),
  });
}

export async function action({ params: { id }, request }) {
  const formData = await request.formData();
  const event = Object.fromEntries(formData);
  await updateEvent({ id, event });
  queryClient.invalidateQueries(['events', id]);
  return redirect('..');
}

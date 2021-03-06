import {useState, useEffect} from 'react';
import {Note} from 'src/libs/types';
import * as API from 'src/libs/api';
import logger from 'src/libs/logger';
import {useParams} from 'react-router-dom';

import NoteView from './NoteView';
import NoteEmpty from './NoteEmpty';

type ParamsType = {
  tagId: string;
};

const defaultParams = {archive: false, trash: false};

type Props = {
  params?: Object;
};

export default function NoteList(props: Props) {
  const {params} = props;
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const {tagId} = useParams<ParamsType>();

  useEffect(() => {
    setLoading(true);
    const fetchNotes = tagId
      ? API.fetchNotesByTag(tagId)
      : API.fetchAllNotes(params || defaultParams);
    fetchNotes.then(
      (notes) => {
        setNotes(notes);
        setLoading(false);
      },
      (error) => {
        logger.error(error);
      }
    );
    // eslint-disable-next-line
  }, [tagId]);

  const updateNotes = (note: Note) => {
    const changed = notes.findIndex((t) => t.id === note.id);
    notes[changed] = {...note};
    setNotes(notes);
  };

  if (loading) {
    return null;
  }

  if (!notes.length) {
    return <NoteEmpty />;
  }

  return (
    <>
      {notes.map((note: Note) => (
        <NoteView
          key={note.id}
          note={note}
          setNote={(note) => {
            updateNotes(note);
          }}
        />
      ))}
    </>
  );
}

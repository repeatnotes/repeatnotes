import {useState, useCallback} from 'react';
import {Note, EditorTab, SyncStatus} from 'src/libs/types';
import * as API from 'src/libs/api';
import logger from 'src/libs/logger';
import Editor from 'src/components/editor/MarkdownEditor';
import {useGlobal} from 'src/components/global/GlobalProvider';
import debounce from 'lodash/debounce';
import TagView from 'src/components/tag/TagView';
import NoteAction from './NoteAction';
import SrsAction from './SrsAction';

type Props = {
  note: Note;
  setNote: (note: Note) => void;
  selectedTab: EditorTab;
  setSelectedTab: (tab: EditorTab) => void;
};

export default function NoteEdit(props: Props) {
  const {setSync} = useGlobal();
  const {note, setNote, selectedTab, setSelectedTab} = props;
  const [currentTab, setCurrentTab] = useState<EditorTab>(
    selectedTab || 'preview'
  );

  const [content, setContent] = useState(note.content || '');
  const [id, setId] = useState(note.id || '');
  const [creating, setCreating] = useState(false);

  const upsertFunc = (id: string, newContent: string, oldNote: Note) => {
    setSync(SyncStatus.Syncing);
    if (!id && !creating && newContent.trim()) {
      setCreating(true);
      API.createNote({note: {content: newContent}}).then(
        (note: Note) => {
          setSync(SyncStatus.Success);
          setId(note.id);
          setNote && setNote({...note, id: note.id, content: newContent});

          setCreating(false);
        },
        (error) => {
          setSync(SyncStatus.Error);
          logger.error(error);

          setContent(oldNote.content);
          setNote && setNote(oldNote);
          setCreating(false);
        }
      );
    } else if (id) {
      API.updateNote(id, {note: {content: newContent}}).then(
        () => {
          setSync(SyncStatus.Success);
          setNote && setNote({...note, id, content: newContent});
        },
        (error) => {
          setSync(SyncStatus.Error);
          logger.error(error);

          setContent(oldNote.content);
          setNote && setNote(oldNote);
        }
      );
    }
  };

  // eslint-disable-next-line
  const debounceUpsert = useCallback(debounce(upsertFunc, 500), []);

  const upsertNote = (id: string, newContent: string) => {
    // For revert if things go wrong
    const oldNote = {...note, id, content};

    // Optimistically set forward
    setContent(newContent);
    setNote && setNote({...note, id, content: newContent});

    debounceUpsert(id, newContent, oldNote);
  };

  const changeTab = (tab: EditorTab) => {
    setCurrentTab(tab);
    setSelectedTab && setSelectedTab(tab);
  };

  return (
    <div
      className={
        'max-w-xl mx-auto mt-4 mb-16' +
        (currentTab === 'preview' ? '  border shadow-sm rounded' : '')
      }
    >
      <div
        onClick={() => currentTab === 'preview' && changeTab('write')}
        className="cursor-pointer"
      >
        <Editor
          content={content}
          setContent={(newContent) => {
            upsertNote(id, newContent);
          }}
          selectedTab={currentTab}
          setSelectedTab={changeTab}
        />
      </div>

      <TagView tags={note.tags || []} />
      {note.id && <SrsAction note={note} setNote={setNote} />}
      {note.id && <NoteAction note={note} setNote={setNote} />}
    </div>
  );
}

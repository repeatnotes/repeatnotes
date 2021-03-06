import {useRef, useEffect} from 'react';
import ReactMde from 'react-mde';
import {getDefaultToolbarCommands} from 'react-mde';
import {EditorTab} from 'src/libs/types';
import * as API from 'src/libs/api';
import logger from 'src/libs/logger';
import FileType from 'file-type/browser';

import MarkdownRenderer from './MarkdownRenderer';

type Props = {
  content: string;
  setContent: (s: string) => void;
  selectedTab: EditorTab;
  setSelectedTab: (t: EditorTab) => void;
};

const supportedTypes = new Set(['jpg', 'jpeg', 'gif', 'png', 'xml']);
const initialEditorHeight = 256;

export default function Editor(props: Props) {
  const {content, setContent, selectedTab, setSelectedTab} = props;

  const save = async function* (data: any) {
    const fileType = await FileType.fromBuffer(data);
    if (!fileType || !supportedTypes.has(fileType.ext)) {
      return false;
    }
    // Treat xml as svg for now
    let ext = `${fileType.ext}`;
    let mime = `${fileType.mime}`;

    if (ext === 'xml') {
      ext = 'svg';
      mime = 'image/svg';
    }
    const file = new File([data], `image.${ext}`, {type: mime});
    try {
      const res = await API.uploadFile(file);
      yield res.file_path;
      return true;
    } catch (err) {
      logger.error(err);
      return false;
    }
  };

  const ref = useRef<ReactMde>(null);

  const fitContent = () => {
    const middleScroll = document.getElementById('middle-scroll');
    const textArea = ref.current?.finalRefs.textarea?.current;

    if (middleScroll && textArea) {
      const scrollTop = middleScroll.scrollTop;

      textArea.style.height = 'auto';
      textArea.style.height = `${Math.max(
        textArea.scrollHeight,
        initialEditorHeight
      )}px`;
      textArea.scrollTop = textArea.scrollHeight;

      middleScroll.scrollTo(0, scrollTop);
    }
  };

  useEffect(fitContent, [selectedTab, content]);

  return (
    <ReactMde
      ref={ref}
      initialEditorHeight={initialEditorHeight}
      value={content}
      onChange={setContent}
      selectedTab={selectedTab}
      onTabChange={setSelectedTab}
      toolbarCommands={
        selectedTab === 'write' ? getDefaultToolbarCommands() : []
      }
      generateMarkdownPreview={(markdown) =>
        Promise.resolve(<MarkdownRenderer source={markdown} />)
      }
      classes={{
        reactMde: selectedTab === 'write' ? 'border rounded' : '',
        toolbar:
          selectedTab === 'write'
            ? 'border-b rounded text-sm'
            : 'border rounded text-sm',
      }}
      minPreviewHeight={100}
      l18n={{
        write: 'Write',
        preview: 'Done',
        uploadingImage: 'Uploading image...',
        pasteDropSelect:
          'Attach images by dragging & dropping, selecting or pasting them here.',
      }}
      childProps={{
        previewButton: {
          className: selectedTab === 'preview' ? 'hidden' : 'mde-tabs',
        },
        writeButton: {
          className: 'hidden',
        },
      }}
      paste={{
        saveImage: save,
      }}
    />
  );
}

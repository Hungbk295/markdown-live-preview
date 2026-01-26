import Editor from '@monaco-editor/react';
import { useTheme } from '../contexts/ThemeContext';

function MarkdownEditor({ value, onChange }) {
  const { isDark } = useTheme();

  const editorOptions = {
    fontSize: 14,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    scrollbar: {
      vertical: 'visible',
      horizontal: 'visible'
    },
    wordWrap: 'on',
    hover: { enabled: false },
    quickSuggestions: false,
    suggestOnTriggerCharacters: false,
    folding: false,
    lineNumbers: 'on',
    renderLineHighlight: 'line',
    padding: { top: 10, bottom: 10 }
  };

  return (
    <Editor
      height="100%"
      language="markdown"
      value={value}
      onChange={onChange}
      theme={isDark ? 'vs-dark' : 'vs'}
      options={editorOptions}
    />
  );
}

export default MarkdownEditor;

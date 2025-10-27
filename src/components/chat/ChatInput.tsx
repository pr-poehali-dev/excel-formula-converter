import { useState, useRef, KeyboardEvent, useEffect } from 'react';
import Icon from '@/components/ui/icon';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearChat: () => void;
  isLoading: boolean;
  hasMessages: boolean;
}

export function ChatInput({ onSendMessage, onFileUpload, onClearChat, isLoading, hasMessages }: ChatInputProps) {
  const [input, setInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isLoading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-2 bg-white rounded-2xl shadow-lg border border-blue-200 p-2 animate-pulse-glow">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors flex-shrink-0"
          title="Загрузить Excel файл"
        >
          <Icon name="Paperclip" size={20} className="text-slate-600" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xls,.xlsx"
          onChange={onFileUpload}
          className="hidden"
        />

        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Напиши, что нужно сделать в Excel..."
          className="flex-1 resize-none bg-transparent border-none focus:outline-none text-slate-700 placeholder-slate-400 py-2.5 px-2 min-h-[44px] max-h-32"
          rows={1}
          style={{
            height: 'auto',
            minHeight: '44px'
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = Math.min(target.scrollHeight, 128) + 'px';
          }}
        />

        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:cursor-not-allowed rounded-xl transition-colors flex-shrink-0"
          title="Отправить"
        >
          <Icon name="Send" size={20} className="text-white" />
        </button>
      </div>

      {hasMessages && (
        <div className="flex justify-center">
          <button
            onClick={onClearChat}
            className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Icon name="RotateCcw" size={14} />
            Начать сначала
          </button>
        </div>
      )}
    </div>
  );
}
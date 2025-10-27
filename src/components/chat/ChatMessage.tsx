import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  formula?: string;
  functions?: Array<{ name: string; description: string }>;
  timestamp: number;
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: 'Скопировано',
      description: 'Текст скопирован в буфер обмена',
    });
  };

  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] bg-blue-600 text-white rounded-2xl px-4 py-3 shadow-sm">
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] bg-white rounded-2xl px-4 py-3 shadow-sm border border-slate-100">
        <p className="text-sm text-slate-700 whitespace-pre-wrap break-words mb-2">
          {message.content}
        </p>

        {message.formula && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="bg-slate-50 rounded-lg p-3 font-mono text-sm text-slate-800 relative group">
              <div className="flex items-start justify-between gap-2">
                <code className="flex-1 break-all">{message.formula}</code>
                <button
                  onClick={() => handleCopy(message.formula!)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-slate-200 rounded"
                  title="Скопировать формулу"
                >
                  <Icon name={copied ? "Check" : "Copy"} size={16} className="text-slate-600" />
                </button>
              </div>
            </div>

            {message.functions && message.functions.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-xs font-medium text-slate-500">Используемые функции:</p>
                <div className="space-y-1.5">
                  {message.functions.map((func, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs">
                      <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {func.name}
                      </span>
                      <span className="text-slate-600">{func.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

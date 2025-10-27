import { useState, useMemo } from 'react';
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

  const generateExampleData = useMemo(() => {
    if (!message.formula) return null;

    const formula = message.formula.toUpperCase();
    const exampleData: Array<{ cell: string; value: string | number; result?: string | number }> = [];

    if (formula.includes('SUM') || formula.includes('СУММ')) {
      exampleData.push(
        { cell: 'A1', value: 10 },
        { cell: 'A2', value: 20 },
        { cell: 'A3', value: 30 },
        { cell: 'A4', value: '', result: 60 }
      );
    } else if (formula.includes('IF') || formula.includes('ЕСЛИ')) {
      exampleData.push(
        { cell: 'A1', value: 85 },
        { cell: 'B1', value: '', result: 'Отлично' }
      );
    } else if (formula.includes('VLOOKUP') || formula.includes('ВПР')) {
      exampleData.push(
        { cell: 'A1', value: 'Товар 1' },
        { cell: 'B1', value: 100 },
        { cell: 'C1', value: '', result: 100 }
      );
    } else if (formula.includes('COUNTIF') || formula.includes('СЧЁТЕСЛИ')) {
      exampleData.push(
        { cell: 'A1', value: 'Да' },
        { cell: 'A2', value: 'Нет' },
        { cell: 'A3', value: 'Да' },
        { cell: 'B1', value: '', result: 2 }
      );
    } else if (formula.includes('AVERAGE') || formula.includes('СРЗНАЧ')) {
      exampleData.push(
        { cell: 'A1', value: 10 },
        { cell: 'A2', value: 20 },
        { cell: 'A3', value: 30 },
        { cell: 'A4', value: '', result: 20 }
      );
    } else {
      exampleData.push(
        { cell: 'A1', value: 10 },
        { cell: 'B1', value: 5 },
        { cell: 'C1', value: '', result: '...' }
      );
    }

    return exampleData;
  }, [message.formula]);

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
        <div className="max-w-[85%] sm:max-w-[80%] bg-blue-600 text-white rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 shadow-sm">
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[90%] sm:max-w-[85%] bg-white rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 shadow-sm border border-slate-100">
        <p className="text-sm text-slate-700 whitespace-pre-wrap break-words mb-2">
          {message.content}
        </p>

        {message.formula && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="bg-slate-50 rounded-lg p-2.5 sm:p-3 font-mono text-xs sm:text-sm text-slate-800 relative group">
              <div className="flex items-start justify-between gap-2">
                <code className="flex-1 break-all leading-relaxed">{message.formula}</code>
                <button
                  onClick={() => handleCopy(message.formula!)}
                  className="opacity-100 transition-opacity p-1 sm:p-1.5 hover:bg-slate-200 rounded flex-shrink-0"
                  title="Скопировать формулу"
                >
                  <Icon name={copied ? "Check" : "Copy"} size={14} className="text-slate-600 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>

            {generateExampleData && generateExampleData.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-slate-500 mb-2">Пример работы формулы:</p>
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-slate-600 border-b border-slate-200">Ячейка</th>
                        <th className="px-3 py-2 text-left font-medium text-slate-600 border-b border-slate-200">Значение</th>
                        <th className="px-3 py-2 text-left font-medium text-slate-600 border-b border-slate-200">Результат</th>
                      </tr>
                    </thead>
                    <tbody>
                      {generateExampleData.map((row, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                          <td className="px-3 py-2 font-mono text-slate-700 border-b border-slate-100">{row.cell}</td>
                          <td className="px-3 py-2 text-slate-600 border-b border-slate-100">{row.value}</td>
                          <td className="px-3 py-2 font-semibold text-blue-600 border-b border-slate-100">
                            {row.result !== undefined ? row.result : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

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
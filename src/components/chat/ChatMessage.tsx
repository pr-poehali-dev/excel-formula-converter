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
    let gridData: Record<number, Record<string, string | number>> = {};

    if (formula.includes('SUM') || formula.includes('СУММ')) {
      gridData = {
        1: { A: 10 },
        2: { A: 20 },
        3: { A: 30 },
        4: { A: '=СУММ(A1:A3)' }
      };
    } else if (formula.includes('IF') || formula.includes('ЕСЛИ')) {
      gridData = {
        1: { A: 85, B: '=ЕСЛИ(A1>80;"Отлично";"Хорошо")' }
      };
    } else if (formula.includes('VLOOKUP') || formula.includes('ВПР')) {
      gridData = {
        1: { A: 'Товар 1', B: 100, C: '=ВПР(A1;A:B;2;0)' }
      };
    } else if (formula.includes('COUNTIF') || formula.includes('СЧЁТЕСЛИ')) {
      gridData = {
        1: { A: 'Да', B: '=СЧЁТЕСЛИ(A:A;"Да")' },
        2: { A: 'Нет' },
        3: { A: 'Да' }
      };
    } else if (formula.includes('AVERAGE') || formula.includes('СРЗНАЧ')) {
      gridData = {
        1: { A: 10 },
        2: { A: 20 },
        3: { A: 30 },
        4: { A: '=СРЗНАЧ(A1:A3)' }
      };
    } else {
      gridData = {
        1: { A: 10, B: 5, C: '=A1+B1' }
      };
    }

    return gridData;
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

            {generateExampleData && Object.keys(generateExampleData).length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-slate-500 mb-2">Пример работы формулы:</p>
                <div className="bg-white border-2 border-slate-300 rounded-lg overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-gradient-to-b from-slate-100 to-slate-50">
                          <th className="w-12 px-2 py-2 text-center font-semibold text-slate-600 border-r-2 border-b-2 border-slate-300">
                            
                          </th>
                          {['A', 'B', 'C', 'D'].map((col) => (
                            <th key={col} className="px-4 py-2 text-center font-semibold text-slate-700 border-r-2 border-b-2 border-slate-300 min-w-[100px]">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Object.keys(generateExampleData).map((rowNum) => {
                          const row = generateExampleData[Number(rowNum)];
                          return (
                            <tr key={rowNum} className="bg-white">
                              <td className="w-12 px-2 py-2 text-center font-semibold text-slate-600 bg-gradient-to-r from-slate-100 to-slate-50 border-r-2 border-b border-slate-300">
                                {rowNum}
                              </td>
                              {['A', 'B', 'C', 'D'].map((col) => (
                                <td key={col} className="px-4 py-2 text-slate-700 border-r-2 border-b border-slate-300 text-center">
                                  {row[col] !== undefined ? row[col] : ''}
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
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
import { useState, useMemo } from 'react';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  formula?: string;
  functions?: Array<{ name: string; description: string }>;
  example?: {
    grid: Record<string, Record<string, string | number>>;
    result: { row: number; col: string; value: string | number };
  };
  timestamp: number;
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const { toast } = useToast();

  const generateExampleData = useMemo(() => {
    if (message.example) {
      return message.example;
    }
    
    if (!message.formula) return null;

    const gridData: Record<string, Record<string, string | number>> = {
      '1': { A: 10, B: 20, C: 30 },
      '2': { A: 15, B: 25, C: 35 },
      '3': { A: 20, B: 30, C: 40 },
      '4': { A: message.formula }
    };

    return { grid: gridData, result: { row: 4, col: 'A', value: '...' } };
  }, [message.formula, message.example]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: 'Скопировано',
      description: 'Текст скопирован в буфер обмена',
    });
  };

  const handleFeedback = (isPositive: boolean) => {
    setFeedbackGiven(true);
    if (!isPositive) {
      setShowFeedbackForm(true);
    } else {
      toast({
        title: 'Спасибо за отзыв!',
        description: 'Рады, что формула вам подошла',
      });
    }
  };

  const handleSubmitFeedback = () => {
    if (feedbackText.trim()) {
      console.log('Отзыв:', { messageId: message.id, feedback: feedbackText });
      toast({
        title: 'Спасибо за отзыв!',
        description: 'Мы учтём ваше мнение',
      });
      setShowFeedbackForm(false);
      setFeedbackText('');
    }
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
        <p className="text-sm text-slate-700 whitespace-pre-wrap break-words">
          {message.content}
        </p>

        {message.formula && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="bg-slate-50 rounded-lg p-2.5 sm:p-3 font-mono text-xs sm:text-sm text-slate-800 relative group">
              <div className="flex items-start justify-between gap-2">
                <code className="flex-1 break-all leading-relaxed">{message.formula}</code>
                <button
                  onClick={() => handleCopy(message.formula!)}
                  className="opacity-100 transition-opacity px-2 py-1 sm:px-3 sm:py-1.5 hover:bg-slate-200 rounded flex-shrink-0 text-xs font-medium text-slate-600"
                  title="Скопировать формулу"
                >
                  {copied ? "✓ СКОПИРОВАНО" : "КОПИРОВАТЬ"}
                </button>
              </div>
            </div>

            {generateExampleData && generateExampleData.grid && Object.keys(generateExampleData.grid).length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-slate-500 mb-2">Пример работы формулы:</p>
                <div className="bg-white border-2 border-slate-300 rounded-lg overflow-hidden shadow-sm">
                  <div className="overflow-x-auto -mx-1">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-gradient-to-b from-slate-100 to-slate-50">
                          <th className="w-8 sm:w-12 px-1 sm:px-2 py-1.5 sm:py-2 text-center font-semibold text-slate-600 border-r-2 border-b-2 border-slate-300">
                            
                          </th>
                          {['A', 'B', 'C', 'D'].map((col) => (
                            <th key={col} className="px-2 sm:px-4 py-1.5 sm:py-2 text-center font-semibold text-slate-700 border-r-2 border-b-2 border-slate-300 min-w-[60px] sm:min-w-[100px]">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Object.keys(generateExampleData.grid).map((rowNum) => {
                          const row = generateExampleData.grid[rowNum];
                          const isResultRow = generateExampleData.result && Number(rowNum) === generateExampleData.result.row;
                          return (
                            <tr key={rowNum} className="bg-white">
                              <td className="w-8 sm:w-12 px-1 sm:px-2 py-1.5 sm:py-2 text-center font-semibold text-slate-600 bg-gradient-to-r from-slate-100 to-slate-50 border-r-2 border-b border-slate-300 text-[10px] sm:text-xs">
                                {rowNum}
                              </td>
                              {['A', 'B', 'C', 'D'].map((col) => {
                                const isResultCell = isResultRow && generateExampleData.result?.col === col;
                                const cellValue = row[col] !== undefined ? row[col] : '';
                                return (
                                  <td key={col} className={`px-2 sm:px-4 py-1.5 sm:py-2 border-r-2 border-b border-slate-300 text-center ${
                                    isResultCell ? 'bg-blue-50' : ''
                                  }`}>
                                    {isResultCell && typeof cellValue === 'string' && cellValue.startsWith('=') ? (
                                      <div className="space-y-0.5">
                                        <div className="text-slate-600 text-[9px] sm:text-[10px]">{cellValue}</div>
                                        <div className="font-semibold text-blue-600 text-[10px] sm:text-xs">{generateExampleData.result.value}</div>
                                      </div>
                                    ) : (
                                      <span className="text-slate-700 text-[10px] sm:text-xs">{cellValue}</span>
                                    )}
                                  </td>
                                );
                              })}
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

            {!feedbackGiven && (
              <div className="mt-4 pt-3 border-t border-slate-100">
                <p className="text-xs font-medium text-slate-600 mb-2">Формула помогла?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleFeedback(true)}
                    className="flex-1 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    👍 Да
                  </button>
                  <button
                    onClick={() => handleFeedback(false)}
                    className="flex-1 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    👎 Нет
                  </button>
                </div>
              </div>
            )}

            {showFeedbackForm && (
              <div className="mt-3 space-y-2">
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Расскажите, что не подошло..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
                <button
                  onClick={handleSubmitFeedback}
                  disabled={!feedbackText.trim()}
                  className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Отправить отзыв
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
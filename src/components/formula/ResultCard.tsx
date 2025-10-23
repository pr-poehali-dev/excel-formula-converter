import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { FormulaResult } from './types';

interface ResultCardProps {
  result: FormulaResult;
  copied: boolean;
  onCopy: () => void;
}

export function ResultCard({ result, copied, onCopy }: ResultCardProps) {
  return (
    <Card className="border-0 apple-glass border border-slate-200/60 apple-shadow-lg overflow-hidden">
      <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-transparent px-4 py-3 sm:px-6 sm:py-4">
        <CardTitle className="text-base sm:text-lg font-semibold text-slate-900">Результат</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
        {result.formula && result.formula.startsWith('=') ? (
          <>
            <div className="relative bg-slate-900 p-3 pr-12 sm:p-4 sm:pr-14 md:p-6 md:pr-16 rounded-xl sm:rounded-2xl border border-slate-800 group">
              <code className="text-xs sm:text-sm md:text-base font-mono text-green-400 break-all">
                {result.formula}
              </code>
              <button
                onClick={onCopy}
                className={`absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
                  copied 
                    ? 'bg-green-600 scale-110' 
                    : 'bg-slate-800 hover:bg-slate-700'
                }`}
                title={copied ? 'Скопировано!' : 'Скопировать формулу'}
              >
                <Icon 
                  name={copied ? 'Check' : 'Copy'} 
                  size={16} 
                  className={`${copied ? 'text-white' : 'text-slate-300'} sm:w-[18px] sm:h-[18px]`}
                />
              </button>
            </div>

            {result.explanation && (
              <div className="bg-blue-50/50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-blue-100">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <Icon name="Lightbulb" size={14} className="text-white sm:w-4 sm:h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-900 mb-1 sm:mb-2">Как это работает</h4>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{result.explanation}</p>
                  </div>
                </div>
              </div>
            )}

            {result.functions && result.functions.length > 0 && (
              <div className="bg-purple-50/50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-purple-100">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                    <Icon name="FunctionSquare" size={14} className="text-white sm:w-4 sm:h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-900 mb-3 sm:mb-4">Используемые функции</h4>
                    <div className="space-y-3">
                      {result.functions.map((func, index) => (
                        <div key={index} className="flex items-start gap-2.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="inline-flex items-center gap-1.5 mb-1">
                              <Icon name="Zap" size={12} className="text-purple-500 flex-shrink-0" />
                              <span className="text-xs sm:text-sm font-semibold text-slate-900">{func.name}</span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{func.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-red-50/50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-red-200">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                <Icon name="AlertCircle" size={14} className="text-white sm:w-4 sm:h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs sm:text-sm font-semibold text-slate-900 mb-1 sm:mb-2">Ошибка</h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {result.formula || result.explanation || 'Не удалось создать формулу. Попробуйте переформулировать запрос.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
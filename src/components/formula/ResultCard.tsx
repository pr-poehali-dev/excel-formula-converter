import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { FormulaResult } from './types';

interface ResultCardProps {
  result: FormulaResult;
  workbook: any;
  copied: boolean;
  onCopy: () => void;
}

export function ResultCard({ result, workbook, copied, onCopy }: ResultCardProps) {
  return (
    <Card className="border-0 apple-glass border border-slate-200/60 apple-shadow-lg overflow-hidden">
      <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-transparent">
        <CardTitle className="text-lg font-semibold text-slate-900">Результат</CardTitle>
      </CardHeader>
      <CardContent className="p-8 space-y-6">
        {workbook ? (
          <div className="bg-green-50/50 p-6 rounded-2xl border border-green-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <Icon name="CheckCircle" size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-slate-900 mb-2">{result.formula}</h4>
                {result.explanation && (
                  <p className="text-sm text-slate-700 leading-relaxed">{result.explanation}</p>
                )}
              </div>
            </div>
          </div>
        ) : result.formula && result.formula.startsWith('=') ? (
          <>
            <div className="relative bg-slate-900 p-6 pr-14 rounded-2xl border border-slate-800 group">
              <code className="text-base font-mono text-green-400 break-all">
                {result.formula}
              </code>
              <button
                onClick={onCopy}
                className={`absolute top-4 right-4 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
                  copied 
                    ? 'bg-green-600 scale-110' 
                    : 'bg-slate-800 hover:bg-slate-700'
                }`}
                title={copied ? 'Скопировано!' : 'Скопировать формулу'}
              >
                <Icon 
                  name={copied ? 'Check' : 'Copy'} 
                  size={18} 
                  className={copied ? 'text-white' : 'text-slate-300'}
                />
              </button>
            </div>

            {result.explanation && (
              <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <Icon name="Lightbulb" size={16} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-slate-900 mb-2">Как это работает</h4>
                    <p className="text-sm text-slate-700 leading-relaxed">{result.explanation}</p>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-red-50/50 p-6 rounded-2xl border border-red-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                <Icon name="AlertCircle" size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-slate-900 mb-2">Ошибка</h4>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {result.formula || result.explanation || 'Не удалось создать формулу. Попробуйте переформулировать запрос.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {result.functions && result.functions.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Icon name="Book" size={16} className="text-blue-500" />
              Функции в формуле
            </h4>
            <div className="space-y-3">
              {result.functions.map((func, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-white/80 rounded-xl border border-slate-200">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-white">{func.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <h5 className="text-sm font-semibold text-slate-900 mb-1">{func.name}</h5>
                    <p className="text-xs text-slate-600">{func.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

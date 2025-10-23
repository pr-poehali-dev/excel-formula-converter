import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface FunctionInfo {
  name: string;
  description: string;
}

interface FormulaResult {
  formula: string;
  explanation: string;
  functions: FunctionInfo[];
}

interface HistoryItem {
  id: string;
  query: string;
  formula: string;
  explanation: string;
  functions: FunctionInfo[];
  timestamp: number;
}

export default function Index() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<FormulaResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [language, setLanguage] = useState<'ru' | 'en'>('ru');
  const { toast } = useToast();

  useEffect(() => {
    const savedHistory = localStorage.getItem('formulaHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const saveToHistory = (userQuery: string, formulaResult: FormulaResult) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      query: userQuery,
      formula: formulaResult.formula,
      explanation: formulaResult.explanation,
      functions: formulaResult.functions,
      timestamp: Date.now(),
    };
    const updatedHistory = [newItem, ...history].slice(0, 10);
    setHistory(updatedHistory);
    localStorage.setItem('formulaHistory', JSON.stringify(updatedHistory));
  };

  const loadFromHistory = (item: HistoryItem) => {
    setQuery(item.query);
    setResult({
      formula: item.formula,
      explanation: item.explanation,
      functions: item.functions,
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('formulaHistory');
    toast({
      title: 'История очищена',
      description: 'Все записи удалены',
    });
  };

  const handleConvert = async () => {
    if (!query.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, введите запрос',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('https://functions.poehali.dev/12cba3b7-c7f4-4a93-b6ae-380062983a1f', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, language }),
      });

      if (!response.ok) {
        throw new Error('Ошибка конвертации');
      }

      const data = await response.json();
      const formulaResult: FormulaResult = {
        formula: data.formula,
        explanation: data.explanation || '',
        functions: data.functions || [],
      };
      setResult(formulaResult);
      saveToHistory(query, formulaResult);
      
      toast({
        title: 'Готово!',
        description: 'Формула успешно создана',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать формулу. Проверьте настройки API.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.formula);
    toast({
      title: 'Скопировано',
      description: 'Формула скопирована в буфер обмена',
    });
  };

  const handleClear = () => {
    setQuery('');
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="container max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12 text-center">
          <div className="relative inline-block mb-4 group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-[2rem] blur-xl opacity-75 group-hover:opacity-100 animate-pulse-slow" />
            <div className="relative w-16 h-16 rounded-[2rem] bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 p-[3px] apple-shadow-lg transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
              <div className="w-full h-full rounded-[1.8rem] bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent" />
                <Icon name="Sparkles" size={28} className="text-white relative z-10 drop-shadow-lg" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-semibold text-slate-900 mb-2 tracking-tight">Формулл.Нет</h1>
          <p className="text-lg text-slate-600 font-light">
            Превращайте идеи в формулы Excel мгновенно
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 items-start">
          <Card className="border-0 apple-glass border border-slate-200/60 apple-shadow-lg overflow-hidden sticky top-6">
            <CardContent className="p-6">
              <div className="space-y-4">
                <Textarea
                  placeholder="Опишите задачу для Excel..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="min-h-[200px] resize-none text-base border-slate-200 focus:border-blue-500 rounded-2xl bg-white/80 px-4 py-3"
                />
                <div className="flex gap-3">
                  <Button
                    onClick={handleConvert}
                    disabled={isLoading}
                    className="flex-1 h-12 text-base font-medium bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-2xl shadow-lg shadow-blue-500/30 transition-all duration-200"
                  >
                    {isLoading ? (
                      <>
                        <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                        Создание...
                      </>
                    ) : (
                      <>
                        <Icon name="Sparkles" size={18} className="mr-2" />
                        Создать формулу
                      </>
                    )}
                  </Button>
                  {query && (
                    <Button
                      onClick={handleClear}
                      variant="outline"
                      className="h-12 px-5 rounded-2xl border-slate-300 hover:bg-slate-100"
                    >
                      <Icon name="X" size={18} />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {result && !isLoading && (
              <Card className="border-0 apple-glass border border-slate-200/60 apple-shadow-lg overflow-hidden animate-fade-in">
                <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-transparent p-4">
                  <CardTitle className="text-base font-semibold text-slate-900">Результат</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                    <code className="text-sm font-mono text-green-400 break-all">
                      {result.formula}
                    </code>
                  </div>
                  
                  <Button
                    onClick={handleCopy}
                    className="w-full h-11 text-sm font-medium bg-slate-900 hover:bg-slate-800 rounded-xl"
                  >
                    <Icon name="Copy" size={16} className="mr-2" />
                    Скопировать формулу
                  </Button>

                  {result.explanation && (
                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                      <div className="flex items-start gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                          <Icon name="Lightbulb" size={14} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xs font-semibold text-slate-900 mb-1">Как это работает</h4>
                          <p className="text-xs text-slate-700 leading-relaxed">{result.explanation}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {result.functions && result.functions.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                        <Icon name="Book" size={14} className="text-blue-500" />
                        Функции в формуле
                      </h4>
                      <div className="space-y-2">
                        {result.functions.map((func, index) => (
                          <div key={index} className="flex items-start gap-2 p-3 bg-white/80 rounded-lg border border-slate-200">
                            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                              <span className="text-[10px] font-bold text-white">{func.name.charAt(0)}</span>
                            </div>
                            <div className="flex-1">
                              <h5 className="text-xs font-semibold text-slate-900 mb-0.5">{func.name}</h5>
                              <p className="text-[11px] text-slate-600 leading-relaxed">{func.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {isLoading && (
              <Card className="border-0 apple-glass border border-slate-200/60 apple-shadow-lg overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="relative mb-6">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 animate-float animate-glow flex items-center justify-center">
                        <Icon name="Sparkles" size={24} className="text-white" />
                      </div>
                    </div>
                    
                    <div className="text-center space-y-2 mb-6">
                      <h3 className="text-base font-semibold text-slate-900">Создаю формулу...</h3>
                      <p className="text-xs text-slate-600">AI анализирует ваш запрос</p>
                    </div>

                    <div className="w-full space-y-2">
                      <div className="h-3 rounded-full animate-shimmer" />
                      <div className="h-3 rounded-full animate-shimmer" style={{ animationDelay: '0.2s' }} />
                      <div className="h-3 rounded-full animate-shimmer w-3/4" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {history.length > 0 && (
          <div className="mt-8">
            <Card className="border-0 apple-glass border border-slate-200/60 apple-shadow overflow-hidden">
              <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-transparent p-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                    <Icon name="History" size={18} className="text-slate-400" />
                    История
                  </CardTitle>
                  <button
                    onClick={clearHistory}
                    className="text-xs text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    Очистить
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid md:grid-cols-2 gap-3">
                  {history.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => loadFromHistory(item)}
                      className="text-left p-3 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 transition-all duration-200 group"
                    >
                      <div className="text-xs font-medium text-slate-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {item.query}
                      </div>
                      <code className="text-[11px] font-mono text-slate-500 line-clamp-1">
                        {item.formula}
                      </code>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
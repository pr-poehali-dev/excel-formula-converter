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
      <div className="container max-w-4xl mx-auto px-6 py-16">
        <div className="mb-16 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 apple-shadow-lg">
            <Icon name="FunctionSquare" size={36} className="text-white" />
          </div>
          <h1 className="text-6xl font-semibold text-slate-900 mb-4 tracking-tight">
            Formula AI
          </h1>
          <p className="text-xl text-slate-600 font-light max-w-2xl mx-auto">
            Превращайте идеи в формулы Excel мгновенно
          </p>
          
          <div className="inline-flex items-center gap-1 mt-8 bg-white/60 apple-glass border border-slate-200/60 rounded-full p-1.5 apple-shadow">
            <button
              onClick={() => setLanguage('ru')}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                language === 'ru' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Русский
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                language === 'en' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              English
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="border-0 apple-glass border border-slate-200/60 apple-shadow-lg overflow-hidden">
            <CardContent className="p-8">
              <div className="space-y-6">
                <Textarea
                  placeholder="Опишите задачу для Excel..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="min-h-[140px] resize-none text-base border-slate-200 focus:border-blue-500 rounded-2xl bg-white/80 px-5 py-4"
                />
                <div className="flex gap-3">
                  <Button
                    onClick={handleConvert}
                    disabled={isLoading}
                    className="flex-1 h-14 text-base font-medium bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-2xl shadow-lg shadow-blue-500/30 transition-all duration-200"
                  >
                    {isLoading ? (
                      <>
                        <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                        Создание формулы...
                      </>
                    ) : (
                      <>
                        <Icon name="Sparkles" size={20} className="mr-2" />
                        Создать формулу
                      </>
                    )}
                  </Button>
                  {query && (
                    <Button
                      onClick={handleClear}
                      variant="outline"
                      className="h-14 px-6 rounded-2xl border-slate-300 hover:bg-slate-100"
                    >
                      <Icon name="X" size={20} />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {isLoading && (
            <Card className="border-0 apple-glass border border-slate-200/60 apple-shadow-lg overflow-hidden">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="relative mb-8">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 animate-float animate-glow flex items-center justify-center">
                        <Icon name="Sparkles" size={32} className="text-white" />
                      </div>
                    </div>
                    
                    <div className="text-center space-y-3 mb-8">
                      <h3 className="text-lg font-semibold text-slate-900">Создаю формулу...</h3>
                      <p className="text-sm text-slate-600">AI анализирует ваш запрос</p>
                    </div>

                    <div className="w-full max-w-md space-y-3">
                      <div className="h-4 rounded-full animate-shimmer" />
                      <div className="h-4 rounded-full animate-shimmer" style={{ animationDelay: '0.2s' }} />
                      <div className="h-4 rounded-full animate-shimmer w-3/4" style={{ animationDelay: '0.4s' }} />
                    </div>

                    <div className="mt-12 flex items-center gap-6">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center animate-pulse-slow">
                          <Icon name="Brain" size={20} className="text-blue-600" />
                        </div>
                        <span className="text-xs text-slate-500">Анализ</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center animate-pulse-slow" style={{ animationDelay: '0.3s' }}>
                          <Icon name="Code2" size={20} className="text-blue-600" />
                        </div>
                        <span className="text-xs text-slate-500">Генерация</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center animate-pulse-slow" style={{ animationDelay: '0.6s' }}>
                          <Icon name="CheckCircle2" size={20} className="text-blue-600" />
                        </div>
                        <span className="text-xs text-slate-500">Проверка</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {result && !isLoading && (
            <div className="space-y-6 animate-fade-in">
              <Card className="border-0 apple-glass border border-slate-200/60 apple-shadow-lg overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-transparent">
                  <CardTitle className="text-lg font-semibold text-slate-900">Результат</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                    <code className="text-base font-mono text-green-400 break-all">
                      {result.formula}
                    </code>
                  </div>
                  
                  <Button
                    onClick={handleCopy}
                    className="w-full h-12 text-base font-medium bg-slate-900 hover:bg-slate-800 rounded-xl"
                  >
                    <Icon name="Copy" size={18} className="mr-2" />
                    Скопировать формулу
                  </Button>

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

                  {result.functions && result.functions.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                        <Icon name="Code2" size={18} className="text-blue-500" />
                        Функции в формуле
                      </h4>
                      <div className="space-y-3">
                        {result.functions.map((func, index) => (
                          <div key={index} className="flex gap-4 p-4 bg-white rounded-xl border border-slate-200">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold text-slate-900 mb-1">{func.name}</div>
                              <div className="text-sm text-slate-600 leading-relaxed">{func.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {history.length > 0 && (
            <Card className="border-0 apple-glass border border-slate-200/60 apple-shadow overflow-hidden">
              <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-transparent">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <Icon name="History" size={20} className="text-slate-400" />
                    История
                  </CardTitle>
                  <button
                    onClick={clearHistory}
                    className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    Очистить
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-2">
                  {history.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => loadFromHistory(item)}
                      className="w-full text-left p-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 transition-all duration-200 group"
                    >
                      <div className="text-sm font-medium text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                        {item.query}
                      </div>
                      <code className="text-xs font-mono text-slate-500">
                        {item.formula}
                      </code>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
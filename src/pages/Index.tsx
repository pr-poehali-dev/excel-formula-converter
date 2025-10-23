import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Icon name="Sheet" size={40} className="text-primary" />
              <div>
                <h1 className="text-4xl font-semibold text-foreground">Excel Formula Converter</h1>
                <p className="text-muted-foreground text-lg">
                  Превратите свой запрос в формулу Excel с помощью AI
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-1">
              <Button
                variant={language === 'ru' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setLanguage('ru')}
                className="text-xs"
              >
                <Icon name="Languages" size={14} className="mr-1" />
                Русский
              </Button>
              <Button
                variant={language === 'en' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setLanguage('en')}
                className="text-xs"
              >
                <Icon name="Languages" size={14} className="mr-1" />
                English
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <Card className="shadow-sm border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="MessageSquare" size={20} />
                Введите запрос
              </CardTitle>
              <CardDescription>
                Опишите задачу, которую нужно решить в Excel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder="Например: суммировать все значения в столбце A с 1 по 10 строку"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="min-h-[120px] resize-none font-normal"
                />
                <div className="flex gap-3">
                  <Button
                    onClick={handleConvert}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                    size="lg"
                  >
                    <Icon name="Sparkles" size={18} />
                    {isLoading ? 'Конвертация...' : 'Конвертировать'}
                  </Button>
                  <Button
                    onClick={handleClear}
                    variant="outline"
                    size="lg"
                  >
                    <Icon name="X" size={18} />
                    Очистить
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {result && (
            <Card className="shadow-sm border-border animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="FileSpreadsheet" size={20} />
                  Результат
                </CardTitle>
                <CardDescription>
                  Готовая формула для Excel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-md border border-border">
                    <code className="text-sm font-mono text-foreground break-all">
                      {result.formula}
                    </code>
                  </div>
                  
                  {result.explanation && (
                    <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-md border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-2">
                        <Icon name="Info" size={18} className="text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-semibold text-foreground mb-1">Объяснение</h4>
                          <p className="text-sm text-muted-foreground">{result.explanation}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {result.functions && result.functions.length > 0 && (
                    <div className="border border-border rounded-md p-4">
                      <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Icon name="FunctionSquare" size={18} className="text-primary" />
                        Используемые функции
                      </h4>
                      <div className="space-y-3">
                        {result.functions.map((func, index) => (
                          <div key={index} className="flex gap-3">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-xs font-medium text-primary">{index + 1}</span>
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-foreground">{func.name}</div>
                              <div className="text-xs text-muted-foreground mt-0.5">{func.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleCopy}
                    variant="secondary"
                    className="flex items-center gap-2"
                    size="lg"
                  >
                    <Icon name="Copy" size={18} />
                    Скопировать формулу
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {history.length > 0 && (
            <Card className="shadow-sm border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="History" size={20} />
                    История запросов
                  </CardTitle>
                  <Button
                    onClick={clearHistory}
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Icon name="Trash2" size={16} />
                  </Button>
                </div>
                <CardDescription>
                  Последние {history.length} {history.length === 1 ? 'запрос' : 'запросов'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => loadFromHistory(item)}
                      className="p-3 border border-border rounded-md hover:bg-muted cursor-pointer transition-colors"
                    >
                      <div className="text-sm font-medium text-foreground mb-1">
                        {item.query}
                      </div>
                      <code className="text-xs font-mono text-muted-foreground">
                        {item.formula}
                      </code>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-sm border-border bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Icon name="Info" size={18} />
                Примеры запросов
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <Icon name="ChevronRight" size={16} className="mt-0.5 text-primary flex-shrink-0" />
                  <span>Посчитать среднее значение чисел в диапазоне B2:B20</span>
                </li>
                <li className="flex gap-2">
                  <Icon name="ChevronRight" size={16} className="mt-0.5 text-primary flex-shrink-0" />
                  <span>Найти максимальное значение в столбце C</span>
                </li>
                <li className="flex gap-2">
                  <Icon name="ChevronRight" size={16} className="mt-0.5 text-primary flex-shrink-0" />
                  <span>Если значение в A1 больше 100, вернуть "Да", иначе "Нет"</span>
                </li>
                <li className="flex gap-2">
                  <Icon name="ChevronRight" size={16} className="mt-0.5 text-primary flex-shrink-0" />
                  <span>Объединить текст из ячеек D1 и E1 через пробел</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
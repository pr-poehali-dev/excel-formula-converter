import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

export default function Index() {
  const [query, setQuery] = useState('');
  const [formula, setFormula] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error('Ошибка конвертации');
      }

      const data = await response.json();
      setFormula(data.formula);
      
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
    navigator.clipboard.writeText(formula);
    toast({
      title: 'Скопировано',
      description: 'Формула скопирована в буфер обмена',
    });
  };

  const handleClear = () => {
    setQuery('');
    setFormula('');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Icon name="Sheet" size={40} className="text-primary" />
            <h1 className="text-4xl font-semibold text-foreground">Excel Formula Converter</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Превратите свой запрос в формулу Excel с помощью AI
          </p>
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

          {formula && (
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
                      {formula}
                    </code>
                  </div>
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
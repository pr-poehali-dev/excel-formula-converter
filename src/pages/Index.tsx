import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/formula/PageHeader';
import { ResultCard } from '@/components/formula/ResultCard';
import { QueryInput } from '@/components/formula/QueryInput';
import { HistoryPanel } from '@/components/formula/HistoryPanel';
import { MagicAnimation } from '@/components/formula/MagicAnimation';
import { SubscriptionDialog } from '@/components/formula/SubscriptionDialog';
import { FormulaResult, HistoryItem } from '@/components/formula/types';
import Icon from '@/components/ui/icon';

export default function Index() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<FormulaResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [language] = useState<'ru' | 'en'>('ru');
  const [copied, setCopied] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [excelData, setExcelData] = useState<any>(null);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [queriesRemaining, setQueriesRemaining] = useState(5);
  const [isPremium, setIsPremium] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    const savedHistory = localStorage.getItem('formulaHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }

    const savedQueries = localStorage.getItem('queriesRemaining');
    if (savedQueries !== null) {
      setQueriesRemaining(parseInt(savedQueries, 10));
    }

    const premiumStatus = localStorage.getItem('isPremium');
    if (premiumStatus === 'true') {
      setIsPremium(true);
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

    if (!isPremium && queriesRemaining <= 0) {
      setShowSubscriptionDialog(true);
      if (typeof window !== 'undefined' && (window as any).ym) {
        (window as any).ym(104845386, 'reachGoal', 'limits_reached');
      }
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('https://functions.poehali.dev/12cba3b7-c7f4-4a93-b6ae-380062983a1f', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query, 
          language,
          excelData: excelData || null,
          hasExcel: !!excelData
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка конвертации');
      }

      const data = await response.json();
      const formulaResult: FormulaResult = {
        formula: data.formula,
        explanation: data.explanation || '',
        functions: data.functions || []
      };
      setResult(formulaResult);
      saveToHistory(query, formulaResult);

      if (!isPremium) {
        const newRemaining = queriesRemaining - 1;
        setQueriesRemaining(newRemaining);
        localStorage.setItem('queriesRemaining', newRemaining.toString());
        
        if (newRemaining === 0) {
          setTimeout(() => setShowSubscriptionDialog(true), 1000);
        }
      }

      if (typeof window !== 'undefined' && (window as any).ym) {
        (window as any).ym(104845386, 'reachGoal', 'new_formula');
      }
      
      toast({
        title: 'Готово!',
        description: isPremium ? 'Формула успешно создана' : `Формула создана. Осталось запросов: ${queriesRemaining - 1}`,
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
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: 'Скопировано',
      description: 'Формула скопирована в буфер обмена',
    });
  };

  const handleClear = () => {
    setQuery('');
    setResult(null);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xls|xlsx)$/)) {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, загрузите файл формата XLS или XLSX',
        variant: 'destructive',
      });
      return;
    }

    setUploadedFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      const wb = XLSX.read(data, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 });
      setExcelData(jsonData.slice(0, 20));
    };
    reader.readAsBinaryString(file);

    toast({
      title: 'Файл загружен',
      description: `${file.name} - данные будут учтены при создании формулы`,
    });
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setExcelData(null);
    toast({
      title: 'Файл удалён',
      description: 'Формулы будут создаваться без контекста файла',
    });
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {isLoading && <MagicAnimation />}
      
      <SubscriptionDialog
        open={showSubscriptionDialog}
        onOpenChange={setShowSubscriptionDialog}
        remainingQueries={queriesRemaining}
      />
      
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16">
        <PageHeader />

        {!isPremium && queriesRemaining < 5 && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name="AlertCircle" size={20} className="text-amber-600" />
              <span className="text-sm text-slate-700">
                <strong>Осталось запросов: {queriesRemaining}</strong> из 5 бесплатных
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setResult(null)}
                className="text-sm font-medium text-slate-700 hover:text-slate-900 flex items-center gap-1"
              >
                <Icon name="Plus" size={16} />
                Новый запрос
              </button>
              <button
                onClick={() => setShowSubscriptionDialog(true)}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Подключить безлимит
              </button>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {result && !isLoading && (
            <div className="space-y-6 animate-fade-in">
              <ResultCard
                result={result}
                copied={copied}
                onCopy={handleCopy}
              />
            </div>
          )}

          {!result || isLoading ? (
            <QueryInput
              query={query}
              isLoading={isLoading}
              uploadedFile={uploadedFile}
              onQueryChange={setQuery}
              onConvert={handleConvert}
              onClear={handleClear}
              onFileUpload={handleFileUpload}
              onRemoveFile={handleRemoveFile}
            />
          ) : (
            <div className="flex justify-center">
              <button
                onClick={() => setResult(null)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 shadow-sm hover:shadow"
              >
                <Icon name="Pencil" size={16} className="text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Изменить запрос</span>
              </button>
            </div>
          )}

          <HistoryPanel
            history={history}
            onLoadFromHistory={loadFromHistory}
            onClearHistory={clearHistory}
          />
        </div>
      </div>
    </div>
  );
}
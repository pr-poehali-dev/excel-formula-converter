import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/formula/PageHeader';
import { ResultCard } from '@/components/formula/ResultCard';
import { QueryInput } from '@/components/formula/QueryInput';
import { HistoryPanel } from '@/components/formula/HistoryPanel';
import { FormulaResult, HistoryItem } from '@/components/formula/types';

export default function Index() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<FormulaResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [language] = useState<'ru' | 'en'>('ru');
  const [copied, setCopied] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [excelData, setExcelData] = useState<any>(null);

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
        body: JSON.stringify({ 
          query, 
          language,
          excelData: excelData || null
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
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16">
        <PageHeader />

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
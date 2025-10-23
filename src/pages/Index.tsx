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
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [isProcessed, setIsProcessed] = useState(false);
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
    setIsProcessed(false);
    
    try {
      let excelData = null;
      if (workbook) {
        const ws = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 });
        excelData = jsonData.slice(0, 10);
      }

      const response = await fetch('https://functions.poehali.dev/12cba3b7-c7f4-4a93-b6ae-380062983a1f', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query, 
          language,
          excelData,
          hasExcel: !!workbook
        }),
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

      if (workbook && data.cellUpdates) {
        setIsProcessed(true);
        const ws = workbook.Sheets[workbook.SheetNames[0]];
        
        data.cellUpdates.forEach((update: { cell: string; value: string | number }) => {
          ws[update.cell] = { 
            t: typeof update.value === 'string' && update.value.startsWith('=') ? 'n' : 's',
            f: typeof update.value === 'string' && update.value.startsWith('=') ? update.value.substring(1) : undefined,
            v: update.value 
          };
        });

        const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
        data.cellUpdates.forEach((update: { cell: string }) => {
          const cellRef = XLSX.utils.decode_cell(update.cell);
          range.e.r = Math.max(range.e.r, cellRef.r);
          range.e.c = Math.max(range.e.c, cellRef.c);
        });
        ws['!ref'] = XLSX.utils.encode_range(range);
      }
      
      toast({
        title: 'Готово!',
        description: workbook ? 'Excel файл обновлён согласно запросу' : 'Формула успешно создана',
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
      setWorkbook(wb);
    };
    reader.readAsBinaryString(file);

    toast({
      title: 'Файл загружен',
      description: file.name,
    });
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setWorkbook(null);
    setIsProcessed(false);
  };

  const handleDownloadExcel = () => {
    if (!workbook) return;

    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });
    
    const s2ab = (s: string) => {
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
      return buf;
    };

    const blob = new Blob([s2ab(wbout)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `обработанный_${uploadedFile?.name || 'файл.xlsx'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: 'Файл загружен',
      description: 'Excel файл успешно сохранён',
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
                workbook={workbook}
                copied={copied}
                onCopy={handleCopy}
              />
            </div>
          )}

          <QueryInput
            query={query}
            isLoading={isLoading}
            uploadedFile={uploadedFile}
            workbook={workbook}
            isProcessed={isProcessed}
            onQueryChange={setQuery}
            onConvert={handleConvert}
            onClear={handleClear}
            onFileUpload={handleFileUpload}
            onRemoveFile={handleRemoveFile}
            onDownloadExcel={handleDownloadExcel}
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
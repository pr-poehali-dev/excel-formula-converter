import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
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
  const [copied, setCopied] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
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
      <div className="container max-w-4xl mx-auto px-6 py-16">
        <div className="mb-16 text-center">
          <div className="relative inline-block mb-6 group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-[2.5rem] blur-xl opacity-75 group-hover:opacity-100 animate-pulse-slow" />
            <div className="relative w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 p-[3px] apple-shadow-lg transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
              <div className="w-full h-full rounded-[2.3rem] bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent" />
                <div className="absolute -top-8 -right-8 w-16 h-16 bg-white/10 rounded-full blur-2xl" />
                <Icon name="Sparkles" size={40} className="text-white relative z-10 drop-shadow-lg" />
              </div>
            </div>
          </div>
          <h1 className="text-6xl font-semibold text-slate-900 mb-4 tracking-tight">Формулл.Нет</h1>
          <p className="text-xl text-slate-600 font-light max-w-2xl mx-auto">
            Превращайте идеи в формулы Excel мгновенно
          </p>
          

        </div>

        <div className="space-y-6">
          {result && !isLoading && (
            <div className="space-y-6 animate-fade-in">
              <Card className="border-0 apple-glass border border-slate-200/60 apple-shadow-lg overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-transparent">
                  <CardTitle className="text-lg font-semibold text-slate-900">Результат</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  {result.formula && result.formula.startsWith('=') ? (
                    <>
                      <div className="relative bg-slate-900 p-6 pr-14 rounded-2xl border border-slate-800 group">
                        <code className="text-base font-mono text-green-400 break-all">
                          {result.formula}
                        </code>
                        <button
                          onClick={handleCopy}
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
            </div>
          )}

          <Card className="border-0 apple-glass border border-slate-200/60 apple-shadow-lg overflow-hidden">
            <CardContent className="p-8">
              <div className="space-y-6">
                {uploadedFile && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center shadow-md">
                        <Icon name="FileSpreadsheet" size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{uploadedFile.name}</p>
                        <p className="text-xs text-slate-500">{(uploadedFile.size / 1024).toFixed(1)} КБ</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {workbook && (
                        <button
                          onClick={handleDownloadExcel}
                          className="px-4 h-9 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium flex items-center gap-2 transition-colors"
                          title="Скачать обновлённый файл"
                        >
                          <Icon name="Download" size={16} />
                          Скачать
                        </button>
                      )}
                      <button
                        onClick={handleRemoveFile}
                        className="w-9 h-9 rounded-lg bg-slate-200 hover:bg-red-100 flex items-center justify-center transition-colors"
                        title="Удалить файл"
                      >
                        <Icon name="X" size={16} className="text-slate-600" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="relative">
                  <input
                    type="file"
                    id="excel-upload"
                    accept=".xls,.xlsx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="excel-upload"
                    className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer transition-all"
                  >
                    <Icon name="Upload" size={20} className="text-slate-500" />
                    <span className="text-sm text-slate-600">
                      {uploadedFile ? 'Изменить файл Excel' : 'Загрузить файл Excel (необязательно)'}
                    </span>
                  </label>
                </div>

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
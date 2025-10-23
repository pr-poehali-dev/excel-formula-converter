import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

interface QueryInputProps {
  query: string;
  isLoading: boolean;
  uploadedFile: File | null;
  onQueryChange: (value: string) => void;
  onConvert: () => void;
  onClear: () => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
}

export function QueryInput({
  query,
  isLoading,
  uploadedFile,
  onQueryChange,
  onConvert,
  onClear,
  onFileUpload,
  onRemoveFile
}: QueryInputProps) {
  return (
    <Card className="border-0 apple-glass border border-slate-200/60 apple-shadow-lg overflow-hidden">
      <CardContent className="p-4 sm:p-6 md:p-8">
        <div className="space-y-6">
          <Textarea
            placeholder="Опишите задачу для Excel..."
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="min-h-[120px] sm:min-h-[140px] resize-none text-sm sm:text-base border-slate-200 focus:border-blue-500 rounded-xl sm:rounded-2xl bg-white/80 px-4 py-3 sm:px-5 sm:py-4"
          />

          {uploadedFile && (
            <div className="bg-green-50/50 p-3 sm:p-4 rounded-xl border border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
                  <Icon name="FileSpreadsheet" size={16} className="text-white sm:w-[18px] sm:h-[18px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-slate-900 truncate">{uploadedFile.name}</p>
                  <p className="text-xs text-slate-600">Файл загружен</p>
                </div>
                <button
                  onClick={onRemoveFile}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center hover:bg-red-100 transition-colors"
                  title="Удалить файл"
                >
                  <Icon name="X" size={14} className="text-slate-600 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          )}

          {!uploadedFile && (
            <div className="relative">
              <input
                type="file"
                accept=".xls,.xlsx"
                onChange={onFileUpload}
                className="hidden"
                id="excel-upload"
              />
              <label
                htmlFor="excel-upload"
                className="flex flex-col items-center justify-center gap-2 p-4 sm:p-5 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <Icon name="Upload" size={16} className="text-slate-400 group-hover:text-blue-500 sm:w-[18px] sm:h-[18px]" />
                  <span className="text-xs sm:text-sm text-slate-600 group-hover:text-blue-600 font-semibold">
                    Загрузить Excel файл для анализа
                  </span>
                </div>
                <p className="text-xs text-slate-500 text-center">
                  Я изучу структуру вашей таблицы и создам более точную формулу
                </p>
              </label>
            </div>
          )}
          <div className="flex gap-2 sm:gap-3">
            <Button
              onClick={onConvert}
              disabled={isLoading}
              className="flex-1 h-12 sm:h-14 text-sm sm:text-base font-medium bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl sm:rounded-2xl shadow-lg shadow-blue-500/30 transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Icon name="Loader2" size={18} className="mr-2 animate-spin sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Создание формулы...</span>
                  <span className="sm:hidden">Создание...</span>
                </>
              ) : (
                <>
                  <Icon name="Sparkles" size={18} className="mr-2 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Создать формулу</span>
                  <span className="sm:hidden">Создать</span>
                </>
              )}
            </Button>
            {query && (
              <Button
                onClick={onClear}
                variant="outline"
                className="h-12 sm:h-14 px-4 sm:px-6 rounded-xl sm:rounded-2xl border-slate-300 hover:bg-slate-100"
              >
                <Icon name="X" size={18} className="sm:w-5 sm:h-5" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
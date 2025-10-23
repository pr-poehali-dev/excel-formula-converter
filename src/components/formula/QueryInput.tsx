import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { FileUpload } from './FileUpload';

interface QueryInputProps {
  query: string;
  isLoading: boolean;
  uploadedFile: File | null;
  workbook: any;
  onQueryChange: (value: string) => void;
  onConvert: () => void;
  onClear: () => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
  onDownloadExcel: () => void;
}

export function QueryInput({
  query,
  isLoading,
  uploadedFile,
  workbook,
  onQueryChange,
  onConvert,
  onClear,
  onFileUpload,
  onRemoveFile,
  onDownloadExcel
}: QueryInputProps) {
  return (
    <Card className="border-0 apple-glass border border-slate-200/60 apple-shadow-lg overflow-hidden">
      <CardContent className="p-4 sm:p-6 md:p-8">
        <div className="space-y-6">
          <FileUpload
            uploadedFile={uploadedFile}
            workbook={workbook}
            onFileUpload={onFileUpload}
            onRemoveFile={onRemoveFile}
            onDownloadExcel={onDownloadExcel}
          />

          <Textarea
            placeholder="Опишите задачу для Excel..."
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="min-h-[120px] sm:min-h-[140px] resize-none text-sm sm:text-base border-slate-200 focus:border-blue-500 rounded-xl sm:rounded-2xl bg-white/80 px-4 py-3 sm:px-5 sm:py-4"
          />
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
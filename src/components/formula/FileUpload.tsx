import Icon from '@/components/ui/icon';

interface FileUploadProps {
  uploadedFile: File | null;
  workbook: any;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
  onDownloadExcel: () => void;
}

export function FileUpload({ uploadedFile, workbook, onFileUpload, onRemoveFile, onDownloadExcel }: FileUploadProps) {
  return (
    <div className="space-y-4">
      {uploadedFile && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 sm:p-4 rounded-xl border border-green-200 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-green-500 flex items-center justify-center shadow-md flex-shrink-0">
              <Icon name="FileSpreadsheet" size={18} className="text-white sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-slate-900 truncate">{uploadedFile.name}</p>
              <p className="text-xs text-slate-500">{(uploadedFile.size / 1024).toFixed(1)} КБ</p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            {workbook && (
              <button
                onClick={onDownloadExcel}
                className="flex-1 sm:flex-none px-3 sm:px-4 h-8 sm:h-9 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 sm:gap-2 transition-colors"
                title="Скачать обновлённый файл"
              >
                <Icon name="Download" size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Скачать</span>
              </button>
            )}
            <button
              onClick={onRemoveFile}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-slate-200 hover:bg-red-100 flex items-center justify-center transition-colors flex-shrink-0"
              title="Удалить файл"
            >
              <Icon name="X" size={14} className="text-slate-600 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="relative">
        <input
          type="file"
          id="excel-upload"
          accept=".xls,.xlsx"
          onChange={onFileUpload}
          className="hidden"
        />
        <label
          htmlFor="excel-upload"
          className="flex items-center justify-center gap-2 p-3 sm:p-4 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer transition-all"
        >
          <Icon name="Upload" size={18} className="text-slate-500 sm:w-5 sm:h-5 flex-shrink-0" />
          <span className="text-xs sm:text-sm text-slate-600 text-center">
            {uploadedFile ? 'Изменить файл Excel' : 'Загрузить файл Excel (необязательно)'}
          </span>
        </label>
      </div>
    </div>
  );
}
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
                onClick={onDownloadExcel}
                className="px-4 h-9 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium flex items-center gap-2 transition-colors"
                title="Скачать обновлённый файл"
              >
                <Icon name="Download" size={16} />
                Скачать
              </button>
            )}
            <button
              onClick={onRemoveFile}
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
          onChange={onFileUpload}
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
    </div>
  );
}

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { HistoryItem } from './types';

interface HistoryPanelProps {
  history: HistoryItem[];
  onLoadFromHistory: (item: HistoryItem) => void;
  onClearHistory: () => void;
}

export function HistoryPanel({ history, onLoadFromHistory, onClearHistory }: HistoryPanelProps) {
  if (history.length === 0) return null;

  return (
    <Card className="border-0 apple-glass border border-slate-200/60 apple-shadow-lg overflow-hidden">
      <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-transparent px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base sm:text-lg font-semibold text-slate-900">История запросов</CardTitle>
            <CardDescription className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
              Последние {history.length} запросов
            </CardDescription>
          </div>
          <Button
            onClick={onClearHistory}
            variant="ghost"
            size="sm"
            className="text-slate-500 hover:text-red-600 hover:bg-red-50 text-xs sm:text-sm flex-shrink-0"
          >
            <Icon name="Trash2" size={14} className="mr-0 sm:mr-1 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Очистить</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6">
        <div className="space-y-2 sm:space-y-3">
          {history.map((item) => (
            <button
              key={item.id}
              onClick={() => onLoadFromHistory(item)}
              className="w-full text-left p-3 sm:p-4 bg-white/60 hover:bg-blue-50/60 rounded-lg sm:rounded-xl border border-slate-200 hover:border-blue-300 transition-all group"
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center flex-shrink-0 group-hover:from-blue-100 group-hover:to-blue-200 transition-all">
                  <Icon name="Clock" size={14} className="text-slate-600 group-hover:text-blue-600 sm:w-4 sm:h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-slate-900 mb-1 line-clamp-1">
                    {item.query}
                  </p>
                  <code className="text-[10px] sm:text-xs font-mono text-blue-600 bg-blue-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded break-all">
                    {item.formula}
                  </code>
                  <p className="text-[10px] sm:text-xs text-slate-500 mt-1.5 sm:mt-2">
                    {new Date(item.timestamp).toLocaleString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
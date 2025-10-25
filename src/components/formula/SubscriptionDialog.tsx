import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  remainingQueries: number;
}

export function SubscriptionDialog({
  open,
  onOpenChange,
  remainingQueries,
}: SubscriptionDialogProps) {
  const { toast } = useToast();

  const handleSubscribe = () => {
    if (typeof window !== 'undefined' && (window as any).ym) {
      (window as any).ym(104845386, 'reachGoal', 'pay_request');
    }
    
    toast({
      title: 'Спасибо за интерес! 🚀',
      description: 'Скоро здесь появится возможность оформить подписку. Следите за обновлениями!',
      duration: 5000,
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Icon name="Zap" size={24} className="text-yellow-500" />
            {remainingQueries === 0 ? 'Лимит запросов исчерпан' : 'Осталось запросов'}
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            {remainingQueries === 0 ? (
              <span className="text-slate-700">
                Вы использовали все <strong>5 бесплатных запросов</strong>.
              </span>
            ) : (
              <span className="text-slate-700">
                Осталось <strong>{remainingQueries} из 5</strong> бесплатных запросов.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                <Icon name="Sparkles" size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Безлимитная подписка
                </h3>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-center gap-2">
                    <Icon name="Check" size={16} className="text-green-500" />
                    Безлимитное количество формул
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon name="Check" size={16} className="text-green-500" />
                    Анализ Excel файлов
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon name="Check" size={16} className="text-green-500" />
                    Приоритетная поддержка
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-blue-200/50">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-bold text-slate-900">150₽</span>
                <span className="text-slate-600">/месяц</span>
              </div>
              
              <Button
                onClick={handleSubscribe}
                className="w-full h-12 text-base font-medium bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-xl shadow-lg"
              >
                <Icon name="Crown" size={20} className="mr-2" />
                Оформить подписку
              </Button>
            </div>
          </div>

          <p className="text-xs text-center text-slate-500">
            Возможность оплаты скоро появится
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
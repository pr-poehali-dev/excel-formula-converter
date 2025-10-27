import { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { PageHeader } from '@/components/formula/PageHeader';
import { SubscriptionDialog } from '@/components/formula/SubscriptionDialog';
import Icon from '@/components/ui/icon';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  formula?: string;
  functions?: Array<{ name: string; description: string }>;
  timestamp: number;
}

export default function Index() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [excelData, setExcelData] = useState<any>(null);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [queriesRemaining, setQueriesRemaining] = useState(15);
  const [isPremium, setIsPremium] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { toast } = useToast();

  useEffect(() => {
    const savedQueries = localStorage.getItem('queriesRemaining');
    if (savedQueries !== null) {
      setQueriesRemaining(parseInt(savedQueries, 10));
    }

    const premiumStatus = localStorage.getItem('isPremium');
    if (premiumStatus === 'true') {
      setIsPremium(true);
    }

    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      setMessages([{
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Привет! Я помогу создать формулу для Excel. Расскажи, что тебе нужно сделать?',
        timestamp: Date.now()
      }]);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
    }
  }, [messages]);

  const handleSendMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return;

    if (!isPremium && queriesRemaining <= 0) {
      setShowSubscriptionDialog(true);
      if (typeof window !== 'undefined' && (window as any).ym) {
        (window as any).ym(104845386, 'reachGoal', 'limits_reached');
      }
      return;
    }

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      console.log('Отправка запроса:', userMessage);
      const response = await fetch('https://functions.poehali.dev/12cba3b7-c7f4-4a93-b6ae-380062983a1f', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: userMessage,
          language: 'ru',
          excelData: excelData || null,
          hasExcel: !!uploadedFile && !!excelData,
          conversationHistory: messages.slice(-4).map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
      });

      console.log('Статус ответа:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Ошибка от сервера:', errorText);
        throw new Error(`Ошибка запроса: ${response.status}`);
      }

      const data = await response.json();
      console.log('Получен ответ:', data);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.explanation || data.formula,
        formula: data.formula,
        functions: data.functions || [],
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);

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

    } catch (error) {
      console.error('Ошибка запроса:', error);
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось обработать запрос',
        variant: 'destructive',
      });
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Извини, произошла ошибка. Попробуй переформулировать вопрос.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
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
      description: `${file.name} - данные учитываются в диалоге`,
    });

    const fileMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `Отлично! Файл ${file.name} загружен. Я вижу данные из первых 20 строк. Теперь можешь задавать вопросы про формулы, и я буду учитывать структуру твоего файла.`,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, fileMessage]);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setExcelData(null);
    toast({
      title: 'Файл удалён',
      description: 'Контекст файла больше не используется',
    });
  };

  const handleClearChat = () => {
    setMessages([{
      id: Date.now().toString(),
      role: 'assistant',
      content: 'Привет! Я помогу создать формулу для Excel. Расскажи, что тебе нужно сделать?',
      timestamp: Date.now()
    }]);
    localStorage.removeItem('chatMessages');
    toast({
      title: 'Чат очищен',
      description: 'Начнём сначала',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex flex-col">
      <SubscriptionDialog
        open={showSubscriptionDialog}
        onOpenChange={setShowSubscriptionDialog}
        remainingQueries={queriesRemaining}
      />

      <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <PageHeader />

        {!isPremium && queriesRemaining < 15 && (
          <div className="mb-4 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-center justify-between gap-3 mb-2 sm:mb-0">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <Icon name="AlertCircle" size={18} className="text-amber-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-slate-700 truncate">
                  <strong>Осталось: {queriesRemaining}</strong> из 15
                </span>
              </div>
              <button
                onClick={() => setShowSubscriptionDialog(true)}
                className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700 whitespace-nowrap flex-shrink-0"
              >
                Безлимит
              </button>
            </div>
          </div>
        )}

        {uploadedFile && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Icon name="FileSpreadsheet" size={16} className="text-green-600 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-slate-700 truncate">{uploadedFile.name}</span>
            </div>
            <button
              onClick={handleRemoveFile}
              className="text-slate-500 hover:text-slate-700 flex-shrink-0 p-1"
            >
              <Icon name="X" size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pb-44 sm:pb-40">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6">
          <div className="space-y-4">
            {messages.map(message => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm pt-6 pb-4 shadow-2xl">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6">
          <ChatInput
            onSendMessage={handleSendMessage}
            onFileUpload={handleFileUpload}
            onClearChat={handleClearChat}
            isLoading={isLoading}
            hasMessages={messages.length > 1}
          />
        </div>
      </div>
    </div>
  );
}
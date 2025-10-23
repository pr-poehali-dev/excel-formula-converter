import Icon from '@/components/ui/icon';

export function PageHeader() {
  return (
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
  );
}

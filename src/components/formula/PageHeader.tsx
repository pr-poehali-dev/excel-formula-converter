import Icon from '@/components/ui/icon';

export function PageHeader() {
  return (
    <div className="mb-8 sm:mb-12 md:mb-16 text-center">
      <div className="relative inline-block mb-4 sm:mb-6 group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-[2rem] sm:rounded-[2.5rem] blur-xl opacity-75 group-hover:opacity-100 animate-pulse-slow" />
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 p-[3px] apple-shadow-lg transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
          <div className="w-full h-full rounded-[1.85rem] sm:rounded-[2.3rem] bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent" />
            <div className="absolute -top-8 -right-8 w-16 h-16 bg-white/10 rounded-full blur-2xl" />
            <Icon name="Sparkles" size={32} className="text-white relative z-10 drop-shadow-lg sm:w-10 sm:h-10" />
          </div>
        </div>
      </div>
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-slate-900 mb-2 sm:mb-3 md:mb-4 tracking-tight px-4">
        Формулл.Нет
      </h1>
      <p className="text-base sm:text-lg md:text-xl text-slate-600 font-light max-w-2xl mx-auto px-4">
        Превращайте идеи в формулы Excel мгновенно
      </p>
    </div>
  );
}
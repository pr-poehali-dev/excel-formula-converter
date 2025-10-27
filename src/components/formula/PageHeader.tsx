import Icon from '@/components/ui/icon';

export function PageHeader() {
  return (
    <div className="mb-6 sm:mb-8 md:mb-12 text-center">
      <div className="relative inline-block mb-3 sm:mb-4 group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-[1.5rem] sm:rounded-[2rem] blur-lg sm:blur-xl opacity-75 group-hover:opacity-100 animate-pulse-slow" />
        <div className="relative w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-[1.5rem] sm:rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 p-[3px] apple-shadow-lg transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
          <div className="w-full h-full rounded-[1.35rem] sm:rounded-[1.85rem] sm:rounded-[2.3rem] bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent" />
            <div className="absolute -top-8 -right-8 w-16 h-16 bg-white/10 rounded-full blur-2xl" />
            <Icon name="Sparkles" size={28} className="text-white relative z-10 drop-shadow-lg sm:w-9 sm:h-9 md:w-10 md:h-10" />
          </div>
        </div>
      </div>
      <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-slate-900 mb-1.5 sm:mb-2 md:mb-3 tracking-tight px-4">
        Формулл.Нет
      </h1>
      <p className="text-sm sm:text-base md:text-lg text-slate-600 font-light max-w-2xl mx-auto px-4">
        Превращайте идеи в формулы Excel
      </p>
    </div>
  );
}
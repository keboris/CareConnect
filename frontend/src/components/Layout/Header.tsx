import { MessageSquare, User, LogOut, Globe, AlertCircle, MapPin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useState } from 'react';

type Props = {
  currentView: 'map' | 'messages';
  onViewChange: (view: 'map' | 'messages') => void;
};

export function Header({ currentView, onViewChange }: Props) {
  const { user, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [sosActive, setSosActive] = useState(false);

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <img
              src="/chatgpt_image_17_nov._2025__10_56_53.png"
              alt="CareConnect Logo"
              className="h-10 w-auto"
            />
            <h1 className="text-2xl font-bold">CareConnect</h1>
          </div>

          <nav className="flex items-center space-x-2">
            <button
              onClick={() => onViewChange('map')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center space-x-2 ${
                currentView === 'map'
                  ? 'bg-white text-blue-700 font-medium shadow-lg'
                  : 'text-white hover:bg-blue-500'
              }`}
            >
              <MapPin size={18} />
              <span>{t('nav.home')}</span>
            </button>
            <button
              onClick={() => onViewChange('messages')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center space-x-2 ${
                currentView === 'messages'
                  ? 'bg-white text-blue-700 font-medium shadow-lg'
                  : 'text-white hover:bg-blue-500'
              }`}
            >
              <MessageSquare size={18} />
              <span>{t('nav.messages')}</span>
            </button>

            <div className="ml-4 flex items-center space-x-2 border-l border-white/20 pl-4">
              <div className="text-white text-sm font-medium px-3">
                {user?.firstName} {user?.lastName}
              </div>
              <button
                onClick={() => setSosActive(!sosActive)}
                className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center space-x-2 ${
                  sosActive
                    ? 'bg-red-600 text-white animate-pulse shadow-xl'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
                title={t('sos.toggle')}
              >
                <AlertCircle size={18} />
                <span>{sosActive ? t('sos.active') : t('sos.inactive')}</span>
              </button>

              <button
                onClick={() => setLanguage(language === 'en' ? 'de' : 'en')}
                className="p-2 rounded-lg text-white hover:bg-blue-500 transition-all flex items-center space-x-1"
                title="Change Language"
              >
                <Globe size={20} />
                <span className="text-sm font-medium uppercase">{language}</span>
              </button>

              <button
                onClick={signOut}
                className="p-2 rounded-lg text-white hover:bg-red-500 transition-all"
                title={t('nav.logout')}
              >
                <LogOut size={20} />
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

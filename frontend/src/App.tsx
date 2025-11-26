import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { LoginForm } from './components/Auth/LoginForm';
import { RegisterForm } from './components/Auth/RegisterForm';
import { Header } from './components/Layout/Header';
import { MapModal } from './components/Map/MapModal';
import { MessagesView } from './components/Messages/MessagesView';
import { ProfileView } from './components/Profile/ProfileView';
import { CreateListingModal } from './components/Listings/CreateListingModal';
import { ListingDetailModal } from './components/Listings/ListingDetailModal';
import { LandingNav } from './components/Landing/LandingNav';
import { HeroSection } from './components/Landing/HeroSection';
import { FeaturesSection } from './components/Landing/FeaturesSection';
import { CategoriesSection } from './components/Landing/CategoriesSection';
import { StatsSection } from './components/Landing/StatsSection';
import { Footer } from './components/Landing/Footer';
import { API_BASE_URL, Listing } from './config/api';
import { getCookie } from './lib/cookies';

function AppContent() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const [showRegister, setShowRegister] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [currentView, setCurrentView] = useState<'map' | 'messages' | 'profile'>('map');
  const [showCreateListing, setShowCreateListing] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showMap, setShowMap] = useState(false);

  const handleStartChat = async (listing: Listing) => {
    if (!user || !listing.profile) return;

    try {
      // Get authentication token from cookies
      const token = getCookie('auth_token');
      const response = await fetch(`${API_BASE_URL}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          listing_id: listing.id,
          requester_id: user.id,
          helper_id: listing.user_id,
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start conversation');
      }

      setSelectedListing(null);
      setCurrentView('messages');
    } catch (error) {
      console.error('Error starting chat:', error);
      alert('Fehler beim Starten der Unterhaltung');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (showLanding && !showRegister) {
      return (
        <div className="min-h-screen">
          <LandingNav
            onLogin={() => { setShowLanding(false); setShowRegister(false); }}
            onRegister={() => { setShowLanding(false); setShowRegister(true); }}
          />
          <HeroSection
            onGetStarted={() => { setShowLanding(false); setShowRegister(true); }}
            onOpenMap={() => setShowMap(true)}
          />
          <FeaturesSection />
          <CategoriesSection onCategoryClick={() => setShowMap(true)} />
          <StatsSection />
          <Footer />

          {showMap && (
            <MapModal
              onClose={() => setShowMap(false)}
              onSelectListing={setSelectedListing}
              onCreateListing={() => {
                setShowMap(false);
                setShowLanding(false);
                setShowRegister(true);
              }}
            />
          )}

          {selectedListing && (
            <ListingDetailModal
              listing={selectedListing}
              onClose={() => setSelectedListing(null)}
              onStartChat={() => {
                setSelectedListing(null);
                setShowLanding(false);
                setShowRegister(true);
              }}
            />
          )}
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
        {showRegister ? (
          <RegisterForm onToggleForm={() => setShowRegister(false)} />
        ) : (
          <LoginForm onToggleForm={() => setShowRegister(true)} />
        )}
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      <Header currentView={currentView} onViewChange={setCurrentView} />

      <main className="flex-1 overflow-hidden">
        {currentView === 'messages' && <MessagesView />}
        {currentView === 'profile' && <ProfileView />}
        {currentView === 'map' && (
          <div className="h-full flex items-center justify-center bg-gray-50">
            <button
              onClick={() => setShowMap(true)}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              {t('common.openMap')}
            </button>
          </div>
        )}
      </main>

      {showMap && (
        <MapModal
          onClose={() => setShowMap(false)}
          onSelectListing={setSelectedListing}
          onCreateListing={() => {
            setShowMap(false);
            setShowCreateListing(true);
          }}
        />
      )}

      {showCreateListing && (
        <CreateListingModal
          onClose={() => setShowCreateListing(false)}
          onSuccess={() => {
            setShowCreateListing(false);
            window.location.reload();
          }}
        />
      )}

      {selectedListing && (
        <ListingDetailModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          onStartChat={handleStartChat}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;

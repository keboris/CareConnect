import { Listing } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import { X, MapPin, Euro, Heart, Star, MessageSquare } from 'lucide-react';

type Props = {
  listing: Listing;
  onClose: () => void;
  onStartChat: (listing: Listing) => void;
};

export function ListingDetailModal({ listing, onClose, onStartChat }: Props) {
  const { profile } = useAuth();
  const isOwnListing = profile?.id === listing.user_id;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[2000] p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in duration-300">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-white">Anzeige Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl transition-all"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="relative">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-gray-900 mb-3">{listing.title}</h3>
                <div className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold shadow-sm" style={{ backgroundColor: listing.category?.color + '20', color: listing.category?.color }}>
                  {listing.category?.name}
                </div>
              </div>
              <div className="text-right ml-4">
                {listing.is_paid && listing.price ? (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 rounded-xl border-2 border-green-200">
                    <div className="flex items-center space-x-1 text-green-700 font-bold text-2xl">
                      <Euro size={24} />
                      <span>{listing.price.toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-4 py-3 rounded-xl border-2 border-blue-200">
                    <div className="flex items-center space-x-2 text-blue-700 font-semibold">
                      <Heart size={20} fill="currentColor" />
                      <span>Ehrenamtlich</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <p className="text-gray-700 leading-relaxed text-lg">{listing.description}</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <div className="flex items-start space-x-3 text-gray-700">
              <div className="bg-blue-100 p-2 rounded-lg">
                <MapPin size={22} className="text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">{listing.address}</p>
                <p className="text-gray-600">{listing.postal_code} {listing.city}</p>
              </div>
            </div>
          </div>

          {listing.profile && (
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-100">
              <h4 className="font-bold text-gray-900 mb-4 text-lg">Angeboten von</h4>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="text-white font-bold text-2xl">
                    {listing.profile.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-lg">{listing.profile.full_name}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className={i < Math.round(listing.profile!.rating_average) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                      />
                    ))}
                    <span className="text-gray-700 text-sm ml-2 font-medium">
                      {listing.profile.rating_average.toFixed(1)} ({listing.profile.rating_count} Bewertungen)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!isOwnListing && (
            <div className="pt-2">
              <button
                onClick={() => onStartChat(listing)}
                className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all font-semibold text-lg"
              >
                <MessageSquare size={22} />
                <span>Nachricht senden</span>
              </button>
            </div>
          )}

          {isOwnListing && (
            <div className="pt-2">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 text-blue-700 p-4 rounded-xl font-medium text-center">
                Dies ist Ihre eigene Anzeige
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

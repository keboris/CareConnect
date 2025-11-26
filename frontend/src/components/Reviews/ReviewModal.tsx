import { useState } from 'react';
import { Listing } from '../../config/api';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { X, Star } from 'lucide-react';

type Props = {
  listing: Listing;
  revieweeId: string;
  onClose: () => void;
  onSuccess: () => void;
};

export function ReviewModal({ listing, revieweeId, onClose, onSuccess }: Props) {
  const { profile } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || rating === 0) return;

    setLoading(true);
    try {
      // TODO: Replace with actual MongoDB API endpoint
      // Create a new review for the listing
      await api.post('/reviews', {
        listing_id: listing.id,
        reviewer_id: profile.id,
        reviewee_id: revieweeId,
        rating,
        comment: comment.trim() || null,
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating review:', error);
      alert('Fehler beim Erstellen der Bewertung');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Bewertung abgeben</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wie würden Sie diese Erfahrung bewerten?
            </label>
            <div className="flex items-center justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    size={40}
                    className={
                      star <= (hoveredRating || rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center mt-2 text-sm text-gray-600">
                {rating === 1 && 'Sehr schlecht'}
                {rating === 2 && 'Schlecht'}
                {rating === 3 && 'Befriedigend'}
                {rating === 4 && 'Gut'}
                {rating === 5 && 'Ausgezeichnet'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kommentar (optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Teilen Sie Ihre Erfahrungen..."
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={loading || rating === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Wird gesendet...' : 'Bewertung abgeben'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

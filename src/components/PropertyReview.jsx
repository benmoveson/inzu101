import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './PropertyReview.css';

const PropertyReview = ({ propertyId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [existingReview, setExistingReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [propertyId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/reviews/property/${propertyId}`);
      const data = await response.json();
      
      if (response.ok) {
        setReviews(data.reviews);
        setAverageRating(data.averageRating);
        setTotalReviews(data.totalReviews);

        // Check if current user has already reviewed
        if (user) {
          const userReview = data.reviews.find(r => r.userId === user.id);
          if (userReview) {
            setExistingReview(userReview);
            setRating(userReview.rating);
            setComment(userReview.comment);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('Please log in to submit a review');
      return;
    }

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const url = existingReview 
        ? `http://localhost:5000/api/reviews/${existingReview._id}`
        : 'http://localhost:5000/api/reviews';
      
      const method = existingReview ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          propertyId,
          rating,
          comment
        })
      });

      const data = await response.json();

      if (response.ok) {
        setShowReviewForm(false);
        setRating(0);
        setComment('');
        fetchReviews(); // Refresh reviews
      } else {
        setError(data.message || 'Failed to submit review');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (count, interactive = false) => {
    return (
      <div className="stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`star ${star <= (interactive ? (hoverRating || rating) : count) ? 'filled' : ''}`}
            onClick={interactive ? () => setRating(star) : undefined}
            onMouseEnter={interactive ? () => setHoverRating(star) : undefined}
            onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
            style={{ cursor: interactive ? 'pointer' : 'default' }}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="property-review">
      <div className="review-summary">
        <h3>Reviews</h3>
        {totalReviews > 0 ? (
          <div className="rating-overview">
            <div className="average-rating">
              <span className="rating-number">{averageRating.toFixed(1)}</span>
              {renderStars(Math.round(averageRating))}
              <span className="review-count">({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})</span>
            </div>
          </div>
        ) : (
          <p className="no-reviews">No reviews yet. Be the first to review!</p>
        )}
      </div>

      {user && (
        <div className="write-review-section">
          {!showReviewForm ? (
            <button 
              className="btn-write-review"
              onClick={() => setShowReviewForm(true)}
            >
              {existingReview ? 'Edit Your Review' : 'Write a Review'}
            </button>
          ) : (
            <form className="review-form" onSubmit={handleSubmitReview}>
              <h4>{existingReview ? 'Edit Your Review' : 'Write a Review'}</h4>
              
              <div className="form-group">
                <label>Rating *</label>
                {renderStars(rating, true)}
              </div>

              <div className="form-group">
                <label htmlFor="comment">Comment (optional)</label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience with this property..."
                  rows="4"
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => {
                    setShowReviewForm(false);
                    setError('');
                    if (!existingReview) {
                      setRating(0);
                      setComment('');
                    }
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-submit"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <div className="reviews-list">
        {reviews.map((review) => (
          <div key={review._id} className="review-item">
            <div className="review-header">
              <div className="reviewer-info">
                <span className="reviewer-name">{review.userName}</span>
                <span className="review-date">{formatDate(review.createdAt)}</span>
              </div>
              {renderStars(review.rating)}
            </div>
            {review.comment && (
              <p className="review-comment">{review.comment}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertyReview;

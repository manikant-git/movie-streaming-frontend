import React, { useState } from 'react';

const MovieCard = ({ movie }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isWatching, setIsWatching] = useState(false);

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleWatch = async () => {
    setIsWatching(true);
    // In a real app, this would open a video player or navigate to the streaming page
  };

  return (
    <div className="movie-card">
      <div className="movie-poster">
        <img src={movie.poster_url || '/placeholder.jpg'} alt={movie.title} />
        <div className="movie-overlay">
          <button className="play-btn" onClick={handleWatch}>▶ Watch Now</button>
          <button 
            className={`favorite-btn ${isFavorite ? 'active' : ''}`} 
            onClick={handleFavorite}
          >
            ♥ {isFavorite ? 'Favorited' : 'Add to Favorites'}
          </button>
        </div>
      </div>
      <div className="movie-info">
        <h3>{movie.title}</h3>
        <p className="rating">⭐ {movie.rating || 'N/A'}</p>
        <p className="genre">{movie.genre || 'Unknown'}</p>
        <p className="year">{movie.release_year || 'N/A'}</p>
      </div>
    </div>
  );
};

export default MovieCard;

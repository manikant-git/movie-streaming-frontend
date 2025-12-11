import React, { useState, useEffect } from 'react';

const Home = () => {
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Fetch featured movies
    const fetchFeatured = async () => {
      try {
        const response = await fetch('/api/movies/featured');
        const data = await response.json();
        setFeaturedMovies(data);
      } catch (error) {
        console.error('Error fetching featured movies:', error);
      }
    };

    // Fetch categories
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchFeatured();
    fetchCategories();
  }, []);

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <h2>Welcome to CineStream</h2>
          <p>Stream unlimited movies and TV shows</p>
        </div>
      </section>

      <section className="featured-section">
        <h3>Featured Movies</h3>
        <div className="movies-carousel">
          {featuredMovies.map((movie) => (
            <div key={movie.id} className="carousel-item">
              <img src={movie.poster_url} alt={movie.title} />
            </div>
          ))}
        </div>
      </section>

      <section className="categories-section">
        <h3>Browse by Category</h3>
        <div className="categories-grid">
          {categories.map((category) => (
            <a key={category.id} href={`/category/${category.id}`} className="category-card">
              {category.name}
            </a>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;

import React, { useState, useEffect } from 'react';
import './NewsAggregator.css';
import NewsList from '../components/NewsList';
import NewsCard from '../components/NewsCard';
const NewsAggregator = () => {
  const [news, setNews] = useState([]);
  const [searchTopic, setSearchTopic] = useState("");
  const [loading, setLoading] = useState(false); 

  const handleSearch = async () => {
    if (!searchTopic.trim()) return;
    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:5000/scrape?topic=${encodeURIComponent(searchTopic)}`
      );
      const result = await response.json();
      console.log("News Data : ",result);
      if (result.status === "success") {
        setNews(result.data);

      } else {
        console.error("Error fetching news:", result.message);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false); 
    }
  };

  // useEffect(() => {
  //   setNews([
  //     { title: 'News Article 1', summary: 'This is a short summary of the news.' ,  },
  //     { title: 'News Article 2', summary: 'Another news summary.' ,link : "hello"},
  //     { title: 'News Article 2', summary: 'Another news summary.' }
  //   ]);
  // }, []);


  return (
    <div className='flex flex-col p-6'>
      <div className="relative w-full max-w-md ml-[250px]">
        <div className="absolute inset-0 rounded-full p-[2px] ">
          <div className="w-[800px] h-full bg-black rounded-full flex items-center px-1 mt-15">
            <input
              type="text"
              placeholder="Enter news topic..."
              value={searchTopic}
              onChange={(e) => setSearchTopic(e.target.value)}
              className="w-full h-[70px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              className="ml-2 px-6 h-[40px] bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-full transition hover:opacity-80"
              disabled={loading}
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>
      </div>

      <div className="news-aggregator">
      <h2>Latest News</h2>
      {/* <div className="news-cards">
        {news.map((article, index) => (
          <div key={index} className="news-card">
            <h3>{article.Headline}</h3>
            <p>{article.summary}</p>
            <button>Read more</button>
          </div>
        ))}
      </div> */}
      <div>
            {news.map((article, index) => (
            <NewsCard key={index} article={article} />
            ))}
          </div>
     
      
    </div>
    </div>  
  );
}

export default NewsAggregator;

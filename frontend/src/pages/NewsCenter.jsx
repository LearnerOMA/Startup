import { useState } from "react";
import ThemeToggle from "../components/ThemeToggle";
import SearchBar from "../components/SearchBar";
import NewsList from "../components/NewsList";

const NewsCenter = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">
      <div className="flex justify-between p-4 shadow-md bg-white dark:bg-gray-900">
        <h1 className="text-xl font-bold">News Scraper</h1>
        <ThemeToggle />
      </div>

      <div className="max-w-4xl mx-auto mt-4">
        <SearchBar onSearch={setSearchQuery} />
        <NewsList searchQuery={searchQuery} />
      </div>
    </div>
  );
};

export default NewsCenter;

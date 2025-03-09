import { useState } from "react";

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  const handleSearch = () => {
    if (query.trim() !== "") {
      onSearch(query); 
      setShowResults(true);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-2xl mx-auto mt-6">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for news..."
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={handleSearch}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Search
      </button>
    </div>
  );
};

export default SearchBar;

import { useState } from "react";
import { Volume2, Languages } from "lucide-react";

const NewsCardBox = ({ news }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="p-4 border rounded-lg shadow-md dark:bg-gray-900 dark:text-white mb-4">
      <div className="flex justify-between items-center">
        <a
          href={news.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          {news.url}
        </a>
        <div className="flex gap-2">
          <button className="p-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700">
            <Volume2 size={18} />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700">
            <Languages size={18} />
          </button>
        </div>
      </div>
      <h2 className="text-xl font-bold mt-2">{news.title}</h2>
      <p className="mt-2">
        {expanded ? news.fullContent : `${news.content.substring(0, 100)}... `}
        <button
          className="text-blue-500 hover:underline"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      </p>
    </div>
  );
};

export default NewsCardBox;

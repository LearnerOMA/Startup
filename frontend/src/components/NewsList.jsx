import NewsCardBox from "./NewsCardBox";



const NewsList = ({NewsList}) => {
  return (
    <div className="p-4">
      {sampleNews.map((news) => (
        <NewsCardBox key={news.id} news={news} />
      ))}
    </div>
  );
};

export default NewsList;

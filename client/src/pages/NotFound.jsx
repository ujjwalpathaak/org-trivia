const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-7xl font-bold text-red-500">404</h1>
      <p className="text-xl text-gray-600 mt-4">Oops! The page you're looking for doesn't exist.</p>
      <a
        href="/"
        className="mt-6 px-6 py-3 bg-red-500 text-white text-lg rounded-lg shadow-md hover:bg-red-600 transition"
      >
        Go to Home
      </a>
    </div>
  );
};

export default NotFound;

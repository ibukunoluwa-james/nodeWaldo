import { Routes, Route, Link } from "react-router-dom";
import ImageListPage from "./pages/ImageListPage";
import GamePage from "./pages/GamePage";
import LeaderboardPage from "./pages/LeaderboardPage";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-600 text-white p-4 flex justify-between">
        <Link to="/" className="font-bold">Where’s Waldo</Link>
      </nav>

      <Routes>
        <Route path="/" element={<ImageListPage />} />
        <Route path="/game/:imageId" element={<GamePage />} />
        <Route path="/leaderboard/:imageId" element={<LeaderboardPage />} />
      </Routes>
    </div>
  );
}

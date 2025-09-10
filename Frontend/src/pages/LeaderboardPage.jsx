import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function LeaderboardPage() {
  const { imageId } = useParams();
  const [scores, setScores] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:3000/api/leaderboard/${imageId}`)
      .then(res => res.json())
      .then(setScores)
      .catch(console.error);
  }, [imageId]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Leaderboard</h1>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Player</th>
            <th className="p-2 border">Time (s)</th>
          </tr>
        </thead>
        <tbody>
          {scores.map(s => (
            <tr key={s.id}>
              <td className="p-2 border">{s.playerName || "Anonymous"}</td>
              <td className="p-2 border">{(s.timeMs / 1000).toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Link
        to="/"
        className="block mt-4 text-blue-600 underline"
      >
        Back to Images
      </Link>
    </div>
  );
}

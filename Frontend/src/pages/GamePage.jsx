import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TargetBox from "../components/TargetBox";
import Timer from "../components/Timer";
import Marker from "../components/Marker";

export default function GamePage() {
  const { imageId } = useParams();
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [game, setGame] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [clickPos, setClickPos] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  // Fetch image
  useEffect(() => {
    fetch(`http://localhost:3000/api/images/${imageId}`)
      .then(res => res.json())
      .then(setImage)
      .catch(console.error);
  }, [imageId]);

  // Start game
  useEffect(() => {
    fetch("http://localhost:3000/api/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageId: Number(imageId) })
    })
      .then(res => res.json())
      .then(setGame)
      .catch(console.error);
  }, [imageId]);

  // Timer
  useEffect(() => {
    if (game) {
      timerRef.current = setInterval(() => {
        setElapsed(Date.now() - new Date(game.startedAt).getTime());
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [game]);

  // Handle image click
  function handleImageClick(e) {
    const rect = e.target.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setClickPos({ x, y, clientX: e.clientX, clientY: e.clientY });
  }

  // Handle guess
  async function handleGuess(charId) {
    if (!game) return;
    const res = await fetch(`http://localhost:3000/api/games/${game.id}/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ x: clickPos.x, y: clickPos.y, charId })
    });
    const data = await res.json();

    if (data.correct) {
      setMarkers(prev => [...prev, { x: clickPos.x, y: clickPos.y, charId }]);
      if (data.remaining === 0) {
        clearInterval(timerRef.current);
        const playerName = prompt("You found all! Enter your name:");
        await fetch(`http://localhost:3000/api/games/${game.id}/finish`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerName })
        });
        navigate(`/leaderboard/${imageId}`);
      }
    } else {
      alert("Wrong spot!");
    }
    setClickPos(null);
  }

  if (!image || !game) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">{image.title}</h1>
        <Timer elapsed={elapsed} />
      </div>

      <div className="relative inline-block">
        <img
          src={`/assets/${image.filename}`}
          alt={image.title}
          onClick={handleImageClick}
          className="max-w-full"
        />
        {markers.map((m, i) => (
          <Marker key={i} x={m.x} y={m.y} />
        ))}
      </div>

      {clickPos && (
        <TargetBox
          clickPos={clickPos}
          characters={image.characters}
          onGuess={handleGuess}
          onCancel={() => setClickPos(null)}
        />
      )}
    </div>
  );
}

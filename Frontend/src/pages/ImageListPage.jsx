import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ImageCard from "../components/ImageCard";

export default function ImageListPage() {
  const [images, setImages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3000/api/images")
      .then(res => res.json())
      .then(setImages)
      .catch(console.error);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Choose a Game</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map(img => (
          <ImageCard
            key={img.id}
            image={img}
            onClick={() => navigate(`/game/${img.id}`)}
          />
        ))}
      </div>
    </div>
  );
}

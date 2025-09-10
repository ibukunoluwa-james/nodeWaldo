export default function ImageCard({ image, onClick }) {
  return (
    <div
      className="bg-white shadow rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition"
      onClick={onClick}
    >
      <img
        src={`/assets/${image.filename}`}
        alt={image.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-3">
        <h2 className="font-semibold">{image.title}</h2>
      </div>
    </div>
  );
}

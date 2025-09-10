export default function Marker({ x, y }) {
  return (
    <div
      className="absolute w-6 h-6 border-2 border-red-600 rounded-full pointer-events-none"
      style={{
        top: `${y * 100}%`,
        left: `${x * 100}%`,
        transform: "translate(-50%, -50%)"
      }}
    />
  );
}

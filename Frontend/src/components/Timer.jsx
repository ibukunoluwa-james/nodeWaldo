export default function Timer({ elapsed }) {
  const seconds = Math.floor(elapsed / 1000) % 60;
  const minutes = Math.floor(elapsed / 60000);

  return (
    <div className="text-lg font-mono">
      {minutes}:{seconds.toString().padStart(2, "0")}
    </div>
  );
}

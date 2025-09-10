export default function TargetBox({ clickPos, characters, onGuess, onCancel }) {
  return (
    <div
      className="absolute bg-white shadow-lg rounded p-2"
      style={{ top: clickPos.clientY, left: clickPos.clientX }}
    >
      <h4 className="font-semibold mb-2">Who is this?</h4>
      <ul>
        {characters.map(c => (
          <li
            key={c.id}
            className="cursor-pointer hover:bg-gray-100 px-2 py-1"
            onClick={() => onGuess(c.id)}
          >
            {c.name}
          </li>
        ))}
      </ul>
      <button
        className="text-xs text-red-500 mt-2"
        onClick={onCancel}
      >
        Cancel
      </button>
    </div>
  );
}

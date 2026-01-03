interface Props {
  x: number;
  y: number;
  characters: { id: number; name: string }[];
  foundChars: Set<number>;
  onSelect: (id: number) => void;
}

export default function TargetBox({ x, y, characters, foundChars, onSelect }: Props) {
  // Simple logic to flip dropdown if clicked near bottom/right edge
  // For simplicity, we just render right below for now.
  
  return (
    <div 
      className="absolute z-40"
      style={{ left: x, top: y }}
    >
      {/* Targeting Circle */}
      <div className="absolute -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-dashed border-white rounded-full bg-black/20 pointer-events-none animate-pulse shadow-[0_0_0_9999px_rgba(0,0,0,0.3)]" />
      
      {/* Dropdown Menu */}
      <div 
        className="absolute left-10 top-0 w-48 bg-zinc-900/95 backdrop-blur border border-zinc-700 rounded-lg shadow-2xl overflow-hidden flex flex-col animate-pop origin-top-left"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking menu
      >
        <div className="bg-zinc-800 px-3 py-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
          Who is this?
        </div>
        {characters.map(char => {
            const isFound = foundChars.has(char.id);
            if(isFound) return null; // Don't show already found

            return (
                <button
                    key={char.id}
                    onClick={() => onSelect(char.id)}
                    className="text-left px-4 py-3 hover:bg-blue-600/20 hover:text-blue-400 text-zinc-200 transition-colors text-sm font-medium border-t border-zinc-800/50"
                >
                    {char.name}
                </button>
            )
        })}
      </div>
    </div>
  );
}
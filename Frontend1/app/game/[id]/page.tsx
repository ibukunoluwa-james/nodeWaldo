import { fetchGameImage } from '@/lib/api';
import GameCanvas from '@/components/GameCanvas';

export default async function GamePage({ params }: { params: { id: string } }) {
  // Await params correctly in Next.js 15
  const { id } = await params;
  const image = await fetchGameImage(Number(id));

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <GameCanvas image={image} />
    </div>
  );
}
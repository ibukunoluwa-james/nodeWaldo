import Link from 'next/link';
import Image from 'next/image'; // <--- Don't forget this import
import { fetchImages } from '@/lib/api';

export default async function Home() {
  const images = await fetchImages();

  return (
    <main className="min-h-screen p-8 md:p-16 max-w-7xl mx-auto">
      <header className="mb-16 text-center space-y-4">
        <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          Spot The Character
        </h1>
        <p className="text-zinc-400 text-lg">Select an image to begin the hunt.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {images.map((img: any) => (
          <Link 
            key={img.id} 
            href={`/game/${img.id}`}
            className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-zinc-800 hover:border-zinc-600 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10"
          >
            {/* Actual Next.js Image Component */}
            <Image
              src={`/${img.filename}`} 
              alt={img.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={true}
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
            
            <div className="absolute bottom-0 left-0 p-6 w-full transform translate-y-2 group-hover:translate-y-0 transition-transform">
              <h2 className="text-xl font-semibold text-white mb-1">{img.title}</h2>
              <p className="text-zinc-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                Click to start &rarr;
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
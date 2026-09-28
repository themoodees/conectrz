import { CreatorImage } from "@/components/discovery/CreatorImage";

/** Staggered grid of creator photos — the creators provide the color. */
export function HeroCollage({ photos }: { photos: { src: string | null; name: string }[] }) {
  const columns = [photos.slice(0, 2), photos.slice(2, 4), photos.slice(4, 6)];
  return (
    <div aria-hidden="true" className="grid grid-cols-3 gap-3 sm:gap-4">
      {columns.map((column, index) => (
        <div
          key={index}
          className={`space-y-3 sm:space-y-4 ${index === 1 ? "pt-10" : index === 2 ? "pt-4" : ""}`}
        >
          {column.map((photo) => (
            <div key={photo.name} className="overflow-hidden rounded-card">
              <CreatorImage src={photo.src} name={photo.name} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

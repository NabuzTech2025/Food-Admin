import { Player } from "@lottiefiles/react-lottie-player";

export function SectionHeader({
  lottieSrc,
  title,
  right,
}: {
  lottieSrc: object;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-gray-50/70">
      <div className="flex items-center gap-2">
        <Player
          autoplay
          loop
          src={lottieSrc as never}
          style={{ width: 24, height: 24 }}
        />
        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">
          {title}
        </span>
      </div>
      {right}
    </div>
  );
}

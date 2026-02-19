const ShowCategoryType = ({
  name,
  number,
  color,
  icon: Icon,
  selected,
  onClick,
}: {
  name: string;
  number: number;
  color: string;
  icon: React.ElementType;
  selected?: boolean;
  onClick?: () => void;
}) => {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl border px-4 py-3 w-full flex items-center gap-3 cursor-pointer transition-all
        ${
          selected
            ? "bg-primary/5 border-primary/30 shadow-md"
            : "bg-white shadow-sm border-border hover:bg-muted"
        }
      `}
    >
      {/* Left color box with icon */}
      <div
        className={`w-10 h-10 rounded-md flex items-center justify-center transition-colors
          ${selected ? "bg-primary/20" : ""}
        `}
        style={{ backgroundColor: color }}
      >
        <Icon
          className={`w-5 h-5 ${selected ? "text-primary" : "text-foreground"}`}
        />
      </div>

      {/* Texts */}
      <div className="flex flex-col">
        <span
          className={`text-lg font-bold transition-colors ${
            selected ? "text-primary" : "text-foreground"
          }`}
        >
          {number}
        </span>
        <span
          className={`text-sm transition-colors ${
            selected ? "text-primary/80" : "text-muted-foreground"
          }`}
        >
          {name}
        </span>
      </div>
    </div>
  );
};

export default ShowCategoryType;

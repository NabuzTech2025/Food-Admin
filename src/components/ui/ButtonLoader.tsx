import { Loader2 } from "lucide-react";

const ButtonLoader = ({ size = 18, color = "white" }) => {
  return (
    <Loader2
      size={size}
      color={color}
      className="animate-spin"
      aria-label="Loading..."
    />
  );
};

export default ButtonLoader;

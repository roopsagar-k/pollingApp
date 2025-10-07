import { Clock } from "lucide-react";
import { useAppSelector } from "@/hooks/hooks";


export const Timer: React.FC = () => {
  const { remaining } = useAppSelector((state) => state.timer);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, "0")}:${sec
      .toString()
      .padStart(2, "0")}`;
  };

  const timerColor =
    remaining > 10
      ? "text-gray-900"
      : remaining > 0
      ? "text-red-500"
      : "text-gray-400";

  return (
    <div
      className={`flex items-center space-x-2 text-sm font-medium p-1 px-3 border rounded-md shadow-sm ${timerColor} border-gray-300`}
    >
      <Clock className={`w-4 h-4 ${timerColor}`} />
      <span>{formatTime(remaining)}</span>
    </div>
  );
};

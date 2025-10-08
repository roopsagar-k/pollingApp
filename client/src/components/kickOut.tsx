import { Sparkles } from "lucide-react";

export const KickOut = () => {
  return (
    <div className="w-full h-screen bg-background flex items-center justify-center">
      <div className="mb-10 text-center">
        <span className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full bg-gradient-to-r from-[#7765DA] via-[#5767D0] to-[#4F0DCE] text-white shadow-md mb-4">
          <Sparkles className="w-4 h-4" />
          Interview Poll
        </span>
        <h1 className="text-4xl md:text-5xl mb-3">You've been Kicked out !</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Looks like teacher had removed you from the poll system. Please Try
          again sometime.
        </p>
      </div>
    </div>
  );
}

import { Sparkles, Loader2 } from "lucide-react";

export const StudentWaiting = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-6 bg-background">
      <span className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full primary-gradient text-white shadow-md mb-4">
        <Sparkles className="w-4 h-4" />
        Interview Poll
      </span>
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
      <p className="text-4xl text-black font-semibold">
        Waiting for the teacher to ask the first question...
      </p>
    </div>
  );
};

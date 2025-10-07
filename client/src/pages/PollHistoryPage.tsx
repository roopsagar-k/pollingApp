import React, { useEffect, useMemo, useState } from "react";
import { useSocket } from "@/context/socketContext";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

type BackendOption = { id: number; text: string };
type BackendAnswer = { name: string; answer: string };
type BackendQuestion = {
  text: string;
  options: BackendOption[];
  answers?: Record<string, BackendAnswer> | null;
  createdAt: number;
  duration: number;
  isActive: boolean;
};
type BackendPoll = {
  id: string;
  createdAt: number;
  currentQuestion: BackendQuestion | null;
};

export const PollHistoryPage: React.FC = () => {
  const { getPastPolls } = useSocket();
  const [polls, setPolls] = useState<BackendPoll[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    getPastPolls((p) => setPolls(p as unknown as BackendPoll[]));
  }, [getPastPolls]);

  const questions = useMemo(() => {
    return polls
      .map((poll) => poll.currentQuestion)
      .filter((q): q is BackendQuestion => Boolean(q));
  }, [polls]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-gray-300 bg-white text-gray-700 hover:border-gray-400"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-2xl md:text-3xl font-semibold">
            View <span className="font-bold">Poll History</span>
          </h1>
        </div>

        {questions.length === 0 && (
          <div className="text-gray-600">No history available yet.</div>
        )}

        {questions.map((q, idx) => {
          const counts: Record<number, number> = {};
          q.options.forEach((o) => (counts[o.id] = 0));
          const answers = q.answers || {};
          Object.values(answers).forEach((entry) => {
            const idNum = Number(entry.answer);
            if (!Number.isNaN(idNum) && idNum in counts) counts[idNum] += 1;
          });
          const total = Object.values(counts).reduce((a, b) => a + b, 0) || 0;
          const percents = Object.fromEntries(
            Object.entries(counts).map(([id, c]) => [
              id,
              total ? Math.round((Number(c) / total) * 100) : 0,
            ])
          ) as Record<string, number>;

          return (
            <div key={`${q.text}-${idx}`} className="mb-10">
              <div className="text-sm font-semibold text-gray-800 mb-2">
                Question {idx + 1}
              </div>

              <div className="rounded-xl overflow-hidden border border-gray-200 bg-white">
                <div className="bg-gradient-to-r from-gray-700 to-gray-500 text-white px-4 py-3 text-sm font-medium">
                  {q.text}
                </div>
                <div className="p-4 space-y-3">
                  {q.options.map((opt, i) => {
                    const percent = percents[String(opt.id)] || 0;
                    return (
                      <div
                        key={`${opt.id}-${i}`}
                        className="relative rounded-lg border bg-gray-50"
                      >
                        <div
                          className="absolute inset-y-0 left-0 rounded-lg bg-[#7765DA] transition-all"
                          style={{ width: `${percent}%` }}
                        />
                        <div className="relative flex items-center justify-between px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-white text-gray-700 flex items-center justify-center text-xs font-semibold border">
                              {i + 1}
                            </div>
                            <span className="text-gray-800 font-medium">
                              {opt.text}
                            </span>
                          </div>
                          <span className="text-gray-600 text-sm font-semibold">
                            {percent}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PollHistoryPage;

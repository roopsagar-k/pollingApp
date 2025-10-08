import React, { useMemo } from "react";
import type { Question } from "@/lib/types";
import { Eye, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useSocket } from "@/context/socketContext";
import { ChatPanel } from "./ChatPanel";

interface TeacherResultsProps {
  question: Question;
  onAskNewQuestion: () => void;
}

export const TeacherResults: React.FC<TeacherResultsProps> = ({
  question,
  onAskNewQuestion,
}) => {
  const { results } = useSocket();
  const navigate = useNavigate();

  const tallies = useMemo(() => {
    const counts: Record<number, number> = {};
    question.options.forEach((o) => (counts[o.id] = 0));
    const answers = results || {};
    Object.values(answers).forEach((answerId) => {
      const idNum = Number(answerId);
      if (!Number.isNaN(idNum) && idNum in counts) counts[idNum] += 1;
    });
    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 0;
    return {
      counts,
      total,
      percents: Object.fromEntries(
        Object.entries(counts).map(([id, c]) => [
          id,
          total ? Math.round((c / total) * 100) : 0,
        ])
      ) as Record<string, number>,
    };
  }, [question.options, results]);

  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="flex justify-end items-center mb-6">
        <button
          onClick={() => navigate("/history")}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full primary-gradient text-white shadow-md"
        >
          <Eye className="w-4 h-4" /> View Poll History
        </button>
      </div>

      <div className="max-w-3xl mx-auto">
        <h2 className="text-base font-semibold mb-3 text-gray-900">Question</h2>

        <div className="rounded-xl overflow-hidden border border-gray-200 bg-white">
          <div className="bg-gradient-to-r from-gray-700 to-gray-500 text-white px-4 py-3 text-sm font-medium">
            {question.text}
          </div>
          <div className="p-4 space-y-3">
            {question.options.map((opt) => {
              const percent = tallies.percents[String(opt.id)] || 0;
              return (
                <div
                  key={opt.id}
                  className="relative rounded-lg border bg-gray-50"
                >
                  <div
                    className="absolute inset-y-0 left-0 rounded-lg bg-[#7765DA] transition-all"
                    style={{ width: `${percent}%` }}
                  />
                  <div className="relative flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-white text-gray-700 flex items-center justify-center text-xs font-semibold border">
                        {opt.id}
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

        <div className="flex justify-end mt-8">
          <button
            onClick={onAskNewQuestion}
            className={cn(
              "inline-flex items-center gap-2 px-6 py-3 text-white font-medium rounded-full primary-gradient"
            )}
          >
            <Plus className="w-4 h-4" /> Ask a new question
          </button>
        </div>
      </div>

      <ChatPanel role="teacher" />
    </div>
  );
};

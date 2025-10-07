import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { startTimer } from "@/slices/timerSlice";
import type { Question } from "@/lib/types";
import { useAppSelector } from "@/hooks/hooks";
import { Timer } from "./timer";
import { useSocket } from "@/context/socketContext";
import { ChatPanel } from "./shared/ChatPanel";

export const QuestionView: React.FC<{ currQuestion: Question }> = ({
  currQuestion,
}) => {
  const dispatch = useDispatch();
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { remaining, isActive } = useAppSelector((state) => state.timer);

  const { submitAnswer, results, timeUp } = useSocket();

  useEffect(() => {
    if (!isActive && currQuestion.duration > 0) {
      dispatch(startTimer(currQuestion.duration));
    }
  }, [currQuestion.duration, isActive, dispatch]);

  useEffect(() => {
    setSelectedOptionId(null);
    setIsSubmitted(false);
  }, [currQuestion.text, currQuestion.duration, currQuestion.options.length]);

  const handleSubmit = () => {
    if (selectedOptionId !== null) {
      setIsSubmitted(true);
      console.log(`Submitting answer: Option ID ${selectedOptionId}`);
      submitAnswer(selectedOptionId.toString());
    }
  };

  const isSubmissionDisabled =
    selectedOptionId === null || isSubmitted || remaining === 0;

  const shouldShowResults = isSubmitted || timeUp;

  const { percents } = React.useMemo(() => {
    const counts: Record<number, number> = {};
    currQuestion.options.forEach((o) => (counts[o.id] = 0));
    const answers = results || {};
    Object.values(answers).forEach((answerId) => {
      const idNum = Number(answerId);
      if (!Number.isNaN(idNum) && idNum in counts) counts[idNum] += 1;
    });
    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 0;
    const percentsMap: Record<string, number> = Object.fromEntries(
      Object.entries(counts).map(([id, c]) => [
        id,
        total ? Math.round((c / total) * 100) : 0,
      ])
    );
    return { counts, total, percents: percentsMap };
  }, [currQuestion.options, results]);

  return (
    <div className="min-h-screen pt-10 bg-[--color-background]">
      <div className="max-w-2xl mx-auto p-4">
      
        <div className="flex items-center mb-6 space-x-4">
          <h1 className="text-xl font-bold text-gray-900">Question 1</h1>
          <Timer />
        </div>

        {!shouldShowResults ? (
          <div className="rounded-xl overflow-hidden border border-gray-200 bg-white">
            <div className="bg-gradient-to-r from-gray-700 to-gray-500 text-white px-4 py-3 text-sm font-medium">
              {currQuestion.text}
            </div>
            <div className="p-4 space-y-3">
              {currQuestion.options.map((option, index) => {
                const isSelected = selectedOptionId === option.id;
                return (
                  <div
                    key={option.id}
                    onClick={() => setSelectedOptionId(option.id)}
                    className={`relative rounded-lg border transition cursor-pointer ${
                      isSelected
                        ? "border-[--color-primary] bg-[#F3F2FF]"
                        : "border-gray-200 bg-gray-50 hover:border-gray-300"
                    }`}
                  >
                    <div className="relative flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold border ${
                            isSelected
                              ? "bg-primary text-white border-primary"
                              : "bg-white text-gray-700"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <span className="text-gray-800 font-medium">
                          {option.text}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div>
            <div className="rounded-xl overflow-hidden border border-gray-200 bg-white">
              <div className="bg-gradient-to-r from-gray-700 to-gray-500 text-white px-4 py-3 text-sm font-medium">
                {currQuestion.text}
              </div>
              <div className="p-4 space-y-3">
                {currQuestion.options.map((opt, index) => {
                  const percent = percents[String(opt.id)] || 0;
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
                            {index + 1}
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
            <div className="font-bold text-2xl py-4 text-center">Wait for the teacher to ask a new question</div>
          </div>
        )}

        {/* Submit Button */}
        {!shouldShowResults && (
          <div className="flex justify-end mt-8">
            <button
              onClick={handleSubmit}
              disabled={isSubmissionDisabled}
              className={`px-16 py-3 text-lg font-medium text-white rounded-full primary-gradient transition duration-150 ease-in-out
                ${
                  isSubmissionDisabled
                    ? "opacity-60 cursor-not-allowed shadow-none"
                    : "shadow-lg shadow-[#5b51d8]/40 hover:opacity-90 active:opacity-100"
                }`}
            >
              {isSubmitted ? "Submitted" : "Submit"}
            </button>
          </div>
        )}

        <ChatPanel role="student" />
      </div>
    </div>
  );
};

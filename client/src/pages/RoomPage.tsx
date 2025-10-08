import React, { useState, useRef, useCallback } from "react";
import { Sparkles, X, Plus } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useSocket } from "@/context/socketContext";
import { cn } from "@/lib/utils";
import { StudentWaiting } from "@/components/studentWaiting";
import { QuestionView } from "@/components/questionView";
import { TeacherResults } from "@/components/teacherResults";

interface Option {
  id: number;
  text: string;
  isCorrect: boolean;
}

const OptionInput: React.FC<{
  option: Option;
  index: number;
  onChange: (id: number, field: keyof Option, value: string | boolean) => void;
  onRemove: (id: number) => void;
}> = ({ option, index, onChange, onRemove }) => {
  const isDefaultOption = index < 2;

  return (
    <div
      className={cn(
        "flex items-center w-full space-x-4 p-4 rounded-xl transition-colors duration-150",
        isDefaultOption
          ? "bg-white border border-gray-200"
          : "bg-gray-50 border border-gray-100"
      )}
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white primary-gradient">
        {index + 1}
      </div>

      <div className="flex-grow">
        <input
          type="text"
          value={option.text}
          onChange={(e) => onChange(option.id, "text", e.target.value)}
          className="w-full py-2 px-3 rounded-lg bg-transparent focus:outline-none focus:ring-0 text-gray-800 font-medium"
          placeholder={`Option ${index + 1}`}
          maxLength={100}
        />
      </div>

      {index >= 2 && (
        <button
          onClick={() => onRemove(option.id)}
          className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
          aria-label={`Remove option ${index + 1}`}
        >
          <X className="w-5 h-5" />
        </button>
      )}

      <div className="flex-shrink-0 ml-4 space-x-6 flex items-center">
        <span className="text-sm font-medium text-gray-700 hidden md:inline">
          Correct?
        </span>
        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            name={`correct-option-${option.id}`}
            checked={option.isCorrect === true}
            onChange={() => onChange(option.id, "isCorrect", true)}
            className="form-radio h-4 w-4 text-primary border-gray-300 focus:ring-primary"
          />
          <span className="ml-2 text-sm font-medium text-gray-700">Yes</span>
        </label>
        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            name={`correct-option-${option.id}`}
            checked={option.isCorrect === false}
            onChange={() => onChange(option.id, "isCorrect", false)}
            className="form-radio h-4 w-4 text-primary border-gray-300 focus:ring-primary"
          />
          <span className="ml-2 text-sm font-medium text-gray-700">No</span>
        </label>
      </div>
    </div>
  );
};

const TeacherCreatePoll: React.FC<{ onAsked?: () => void }> = ({ onAsked }) => {
  const [question, setQuestion] = useState("");
  const [timeLimit, setTimeLimit] = useState(60);
  const [options, setOptions] = useState<Option[]>([
    { id: 1, text: "Option A text", isCorrect: true },
    { id: 2, text: "Option B text", isCorrect: false },
  ]);
  const nextOptionId = useRef(3);

  const { startQuestion } = useSocket();

  const handleAddOption = useCallback(() => {
    setOptions((prev) => {
      if (prev.length >= 8) return prev;
      return [
        ...prev,
        { id: nextOptionId.current++, text: "", isCorrect: false },
      ];
    });
  }, []);

  const handleOptionChange = useCallback(
    (id: number, field: keyof Option, value: string | boolean) => {
      setOptions((prev) =>
        prev.map((opt) => (opt.id === id ? { ...opt, [field]: value } : opt))
      );
    },
    []
  );

  const handleOptionRemove = useCallback(
    (id: number) => {
      if (options.length <= 2) return;

      setOptions((prev) => prev.filter((opt) => opt.id !== id));
    },
    [options.length]
  );

  const timeOptions = [60].map((s) => ({
    value: s,
    label: `${s} seconds`,
  }));

  const maxQuestionLength = 200;
  const isAskDisabled =
    question.trim().length === 0 ||
    options.some((opt) => opt.text.trim().length === 0);

  const handleAskQuestion = async () => {
    console.log(question, options, timeLimit);
    startQuestion(question, options, timeLimit);
    onAsked?.();
  };

  return (
    <div className="p-4 md:p-10 w-full max-w-5xl mx-auto min-h-screen flex flex-col bg-background">
      <header className="mb-10 pt-4">
        <span className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full primary-gradient text-white shadow-md mb-4">
          <Sparkles className="w-4 h-4" />
          Interview Poll
        </span>
        <h1 className="text-4xl md:text-5xl mb-3 font-semibold text-gray-900">
          Let's <span className="font-bold">Get Started</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          You'll have the ability to create and manage polls, ask questions, and
          monitor your students' responses in real-time.
        </p>
      </header>

      {/* Content Area */}
      <main className="flex-grow pb-28">
        {" "}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <label
              htmlFor="question"
              className="font-medium text-lg text-gray-700"
            >
              Enter your question
            </label>
            <div className="relative">
              <select
                id="timeLimit"
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-4 pr-10 text-sm font-medium text-primary focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              >
                {timeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-primary">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="relative border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <textarea
              id="question"
              rows={4}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full p-4 resize-none focus:outline-none text-lg text-gray-800"
              placeholder="Start typing your question here..."
              maxLength={maxQuestionLength}
            />
            <div className="absolute bottom-2 right-4 text-sm text-gray-400">
              {question.length}/{maxQuestionLength}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="font-medium text-lg text-gray-700">Edit Options</h2>
          <div className="space-y-3">
            {options.map((option, index) => (
              <OptionInput
                key={option.id}
                option={option}
                index={index}
                onChange={handleOptionChange}
                onRemove={handleOptionRemove}
              />
            ))}
          </div>

          <button
            onClick={handleAddOption}
            className="flex items-center space-x-2 text-primary font-medium hover:opacity-80 transition-opacity mt-2 p-2"
            disabled={options.length >= 8}
          >
            <Plus className="w-4 h-4" />
            <span>Add More option</span>
          </button>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white/95 backdrop-blur-sm z-10 p-4 shadow-lg">
        <div className="w-full max-w-5xl mx-auto flex justify-end">
          <button
            onClick={() => handleAskQuestion()}
            disabled={isAskDisabled}
            className={cn(
              "text-white font-medium py-3 px-10 rounded-full transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]",
              "primary-gradient shadow-lg shadow-purple-500/30",
              isAskDisabled &&
                "opacity-50 cursor-not-allowed transform-none shadow-none"
            )}
          >
            Ask Question
          </button>
        </div>
      </footer>
    </div>
  );
};

export const RoomPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role");
  const first = useRef(searchParams.get("first") === "true");
  const { currentQuestion } = useSocket();
  const [showCreate, setShowCreate] = useState<boolean>(false);

  if (role === "teacher" && showCreate) {
    return (
      <div className="min-h-screen bg-background">
        <TeacherCreatePoll onAsked={() => setShowCreate(false)} />
      </div>
    );
  }

  if (first.current && role === "teacher" && !currentQuestion) {
    return (
      <div className="min-h-screen bg-background">
        <TeacherCreatePoll onAsked={() => setShowCreate(false)} />
      </div>
    );
  }

  if (role === "student" && !currentQuestion) {
    return <StudentWaiting />;
  }

  if (currentQuestion) {
    if (role === "teacher") {
      return (
        <TeacherResults
          question={currentQuestion}
          onAskNewQuestion={() => setShowCreate(true)}
        />
      );
    }
    return <QuestionView currQuestion={currentQuestion} />;
  }

  return <div className="min-h-screen bg-background" />;
};

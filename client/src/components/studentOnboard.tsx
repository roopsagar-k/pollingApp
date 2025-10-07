import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { useSocket } from "@/context/socketContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export const StudentOnBoard = () => {
  const [studentName, setStudentName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const {
    joinPoll,
    setStudentName: setPendingStudentName,
    joinedPollId,
  } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    if (joinedPollId) {
      navigate("/room?role=student");
    }
  }, [joinedPollId, navigate]);

  const handleContinue = () => {
    if (!studentName.trim() || studentName.trim().length < 3) {
      setError("Please enter your name (at least 3 characters)");
      return;
    }
    setError("");
    console.log("Student Name:", studentName);
    setPendingStudentName(studentName);
    joinPoll(studentName, (success, message) => {
      if (success) {
        navigate("/room?role=student");
      } else {
        setError(
          message ? message : "Unable to join the Poll: Unknown error occured"
        );
      }
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-5xl py-20 px-8 flex flex-col items-center">
        {/* Header */}
        <div className="mb-10 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full bg-gradient-to-r from-[#7765DA] via-[#5767D0] to-[#4F0DCE] text-white shadow-md mb-4">
            <Sparkles className="w-4 h-4" />
            Interview Poll
          </span>
          <h1 className="text-4xl md:text-5xl mb-3">
            Let's <span className="font-bold">Get Started</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            If you’re a student, you’ll be able to submit your answers,
            participate in live polls, and see how your responses compare with
            your classmates
          </p>
        </div>

        {/* Name Input */}
        <div className="flex flex-col space-y-2 mb-6 w-full max-w-md mx-auto">
          <label htmlFor="studentName" className="font-medium">
            Enter your Name
          </label>
          <input
            id="studentName"
            name="studentName"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="w-full py-2 px-4 rounded-lg bg-muted/10 focus:outline-none focus:ring-2 focus:ring-primary"
            type="text"
            placeholder="Enter your name (At least 3 letters)"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        {/* Continue Button */}
        <button
          className={cn(
            "w-full max-w-xs text-white font-medium py-3 px-8 rounded-full transition-transform transform hover:scale-[1.02] active:scale-[0.98]",
            "primary-gradient",
            (!studentName.trim() || studentName.trim().length < 3) &&
              "opacity-50 cursor-not-allowed"
          )}
          onClick={handleContinue}
          disabled={!studentName.trim() || studentName.trim().length < 3}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

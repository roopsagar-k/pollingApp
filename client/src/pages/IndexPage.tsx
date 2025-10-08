import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import { useSocket } from "@/context/socketContext";
import { useNavigate, useSearchParams } from "react-router-dom";

interface RoleCardProps {
  title: string;
  description: string;
  isSelected: boolean;
  onSelect: () => void;
}

const RoleCard: React.FC<RoleCardProps> = ({
  title,
  description,
  isSelected,
  onSelect,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col p-6 rounded-xl cursor-pointer transition-all duration-200 bg-white text-left max-w-sm w-full border",
        isSelected
          ? "border-2 border-[var(--color-primary)] shadow-md"
          : "border-gray-300 hover:border-gray-400"
      )}
      onClick={onSelect}
    >
      <h3 className="text-xl font-semibold mb-2 text-gray-900">{title}</h3>
      <p className="text-sm text-[var(--color-muted)]">{description}</p>
    </div>
  );
};

export const IndexPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<
    "student" | "teacher" | null
  >(null);
  const { createPoll } = useSocket();
  const navigate = useNavigate();
  const { pendingStudentName, setNoActivePoll, socket } = useSocket();
  const [searchParams] = useSearchParams();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

   useEffect(() => {
     const errorParam = searchParams.get("error");
     if (errorParam === "teacher-left") {
       setErrorMsg(
         "The teacher disconnected from the room — you’ve been removed."
       );
       setNoActivePoll(true);
       socket?.emit("kick_everyone_out");
     }
   }, [searchParams, socket, setNoActivePoll]);

  useEffect(() => {
    if (!pendingStudentName) {
      setNoActivePoll(true);
      socket?.emit("kick_everyone_out");
    }
  }, []);

  const handleContinue = () => {
    if (selectedRole) {
      console.log(`Continuing as: ${selectedRole}`);
      if (selectedRole === "teacher") {
        createPoll((pollId) => {
          navigate(`/room?role=teacher&pollId=${pollId}&first=true`);
        });
      }
      if (selectedRole === "student") navigate("/student-onboard");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-5xl py-20 px-8 flex flex-col items-center">
        {errorMsg && (
          <div className="mb-6 w-full max-w-md p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg text-center">
            {errorMsg}
          </div>
        )}

        {/* Header */}
        <div className="mb-10 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full bg-gradient-to-r from-[#7765DA] via-[#5767D0] to-[#4F0DCE] text-white shadow-md mb-4">
            <Sparkles className="w-4 h-4" />
            Interview Poll
          </span>
          <h1 className="text-4xl md:text-5xl mb-3">
            Welcome to the{" "}
            <span className="font-bold">Live Polling System</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Please select the role that best describes you to begin using the
            live polling system.
          </p>
        </div>

        {/* Role Cards */}
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 mb-12 w-full justify-center items-center">
          <RoleCard
            title="I'm a Student"
            description="Lorem ipsum is simply dummy text of the printing and typesetting industry."
            isSelected={selectedRole === "student"}
            onSelect={() => setSelectedRole("student")}
          />
          <RoleCard
            title="I'm a Teacher"
            description="Submit answers and view live poll results in real-time."
            isSelected={selectedRole === "teacher"}
            onSelect={() => setSelectedRole("teacher")}
          />
        </div>

        {/* Continue Button */}
        <button
          className={cn(
            "w-full max-w-xs text-white font-medium py-3 px-8 rounded-full transition-transform transform hover:scale-[1.02] active:scale-[0.98]",
            "primary-gradient"
          )}
          onClick={handleContinue}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

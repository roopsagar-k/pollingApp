import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import type { Option, PollResults, Question, PollSummary } from "@/lib/types";
import { useAppDispatch } from "@/hooks/hooks";
import { tick } from "@/slices/timerSlice";
import { useLocation, useNavigate } from "react-router-dom";

interface SocketContextType {
  socket: Socket | null;
  createPoll: (callback?: (pollId: string) => void) => void;
  joinPoll: (
    studentName: string,
    callback?: (success: boolean, message?: string) => void
  ) => void;
  setStudentName: (studentName: string) => void;
  startQuestion: (text: string, options: Option[], duration?: number) => void;
  submitAnswer: (answer: string) => void;
  getPastPolls: (callback: (polls: PollSummary[]) => void) => void;
  sendChat: (message: string) => void;
  getParticipants: () => void;
  kickParticipant: (socketId: string) => void;

  results: PollResults | null;
  currentQuestion: Question | null;
  students: string[];
  timeUp: boolean;
  joinedPollId: string | null;
  chat: { socketId: string; message: string; timestamp: number }[];
  participants: { socketId: string; name: string }[];
  noActivePoll: boolean;
  pendingStudentName: string | null;
  setNoActivePoll: React.Dispatch<React.SetStateAction<boolean>>;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  createPoll: () => {},
  joinPoll: () => {},
  startQuestion: () => {},
  submitAnswer: () => {},
  getPastPolls: () => {},
  sendChat: () => {},
  getParticipants: () => {},
  kickParticipant: () => {},
  results: null,
  currentQuestion: null,
  students: [],
  timeUp: false,
  setStudentName: () => {},
  joinedPollId: null,
  chat: [],
  participants: [],
  noActivePoll: false,
  pendingStudentName: null,
  setNoActivePoll: () => {},
});

interface SocketProviderProps {
  children: ReactNode;
  serverUrl: string;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({
  children,
  serverUrl,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [results, setResults] = useState<PollResults | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [students, setStudents] = useState<string[]>([]);
  const [timeUp, setTimeUp] = useState(false);
  const [_joinedPollId, setJoinedPollId] = useState<string | null>(null);
  const [chat, setChat] = useState<
    { socketId: string; message: string; timestamp: number }[]
  >([]);
  const [participants, setParticipants] = useState<
    { socketId: string; name: string }[]
  >([]);
  const [noActivePoll, setNoActivePoll] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const dispatch = useAppDispatch();
  const pendingStudentNameRef = useRef<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const locationRef = useRef(location);

  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  useEffect(() => {
    const newSocket = io(serverUrl, { transports: ["websocket"] });
    setSocket(newSocket);

    newSocket.on("poll_created", (poll) => {
      console.log("Poll created:", poll.id);
      setNoActivePoll(false);
      if (pendingStudentNameRef.current) {
        newSocket.emit("join_poll", { name: pendingStudentNameRef.current });
      }
    });

    newSocket.on("joined_success", ({ pollId }) => {
      console.log(`Joined poll ${pollId}`);
      pendingStudentNameRef.current = null;
      setJoinedPollId(pollId);
      setNoActivePoll(false);
    });

    newSocket.on("join_failed", ({ message }) => {
      console.warn("Failed to join poll:", message);
      setNoActivePoll(true);
    });

    newSocket.on("student_joined", ({ name }) => {
      setStudents((prev) => [...prev, name]);
    });

    newSocket.on("question_started", ({ text, duration, options }) => {
      console.log("Question started:", text);
      setCurrentQuestion({ text, duration, options });
      setResults(null);
      setTimeUp(false);
      setNoActivePoll(false);

      if (intervalRef.current) clearInterval(intervalRef.current);

      intervalRef.current = setInterval(() => {
        dispatch(tick());
      }, 1000);
    });

    newSocket.on("poll_results", (data) => {
      try {
        const normalized: Record<string, string> = {};
        Object.values<any>(data || {}).forEach((entry: any) => {
          if (
            entry &&
            typeof entry === "object" &&
            "name" in entry &&
            "answer" in entry
          ) {
            normalized[String(entry.name)] = String(entry.answer);
          }
        });
        setResults(normalized);
      } catch (_e) {
        setResults(data as any);
      }
    });

    newSocket.on("time_up", () => {
      setTimeUp(true);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    });

    newSocket.on("chat_message", (msg) => {
      setChat((prev) => [...prev, msg]);
    });

    newSocket.on("participants", (list) => {
      setParticipants(list);
    });

    newSocket.on("kicked", () => {
      navigate("/kick-out");
    });

    newSocket.on("poll_cleared", () => {
      setNoActivePoll(true);
      setCurrentQuestion(null);
      setResults(null);
    });

    newSocket.on("kicked_everyone", () => {
      setNoActivePoll(true);
      setCurrentQuestion(null);
      setResults(null);
      pendingStudentNameRef.current = null;
      if (locationRef.current.pathname !== "/") {
        navigate("/?error=teacher-left", { replace: true });
      }
    });
    return () => {
      newSocket.disconnect();
    };
  }, [serverUrl, dispatch]);

  const createPoll = (callback?: (pollId: string) => void) => {
    if (!socket) return;
    socket.emit("create_poll");
    socket.once("poll_created", (poll) => {
      callback?.(poll.id);
    });
  };

  const joinPoll = (
    studentName: string,
    callback?: (success: boolean, message?: string) => void
  ) => {
    if (!socket) return;
    pendingStudentNameRef.current = studentName;
    socket.emit("join_poll", { name: studentName });
    socket.once("joined_success", () => callback?.(true));
    socket.once("join_failed", ({ message }) =>
      callback?.(false, `Failed to join poll: ${message}`)
    );
  };

  const setStudentName = (studentName: string) => {
    pendingStudentNameRef.current = studentName;
  };

  const startQuestion = (text: string, options: Option[], duration = 60) => {
    if (!socket) return;
    socket.emit("new_question", { text, duration, options });
  };

  const submitAnswer = (answer: string) => {
    if (!socket) return;
    socket.emit("submit_answer", { answer });
  };

  const getPastPolls = (callback: (polls: PollSummary[]) => void) => {
    if (!socket) return;
    socket.emit("get_past_polls");
    socket.once("past_polls", callback);
  };

  const sendChat = (message: string) => {
    if (!socket) return;
    socket.emit("chat_message", { message });
  };

  const getParticipants = () => {
    if (!socket) return;
    socket.emit("get_participants");
  };

  const kickParticipant = (socketId: string) => {
    if (!socket) return;
    socket.emit("kick_participant", { socketId });
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        createPoll,
        joinPoll,
        startQuestion,
        submitAnswer,
        getPastPolls,
        sendChat,
        getParticipants,
        kickParticipant,
        results,
        currentQuestion,
        students,
        timeUp,
        setStudentName,
        joinedPollId: _joinedPollId,
        chat,
        participants,
        noActivePoll,
        pendingStudentName: pendingStudentNameRef.current,
        setNoActivePoll,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

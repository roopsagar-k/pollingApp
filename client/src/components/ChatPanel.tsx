import React, { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { useSocket } from "@/context/socketContext";
import { motion, AnimatePresence } from "framer-motion";

export const ChatPanel: React.FC<{ role: "student" | "teacher" }> = ({
  role,
}) => {
  const { chat, sendChat, participants, getParticipants, kickParticipant } =
    useSocket();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "participants">("chat");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (open && role === "teacher") getParticipants();
  }, [open, role, getParticipants]);

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    sendChat(trimmed);
    setMessage("");
  };

  return (
    <div className="fixed bottom-6 right-6">
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="w-12 h-12 rounded-full flex items-center justify-center primary-gradient cursor-pointer shadow-xl shadow-[#5b51d8]/50"
        >
          <MessageSquare className="w-6 h-6 text-white" />
        </button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className="w-96 max-w-[90vw] bg-white rounded-xl border shadow-xl overflow-hidden"
          >
            {role === "teacher" ? (
              <div className="flex items-center justify-between border-b px-2">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab("chat")}
                    className={`px-3 py-2 text-sm font-semibold ${
                      activeTab === "chat" ? "text-gray-900" : "text-gray-500"
                    }`}
                  >
                    Chat
                  </button>
                  <button
                    onClick={() => setActiveTab("participants")}
                    className={`px-3 py-2 text-sm font-semibold ${
                      activeTab === "participants"
                        ? "text-gray-900"
                        : "text-gray-500"
                    }`}
                  >
                    Participants
                  </button>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium rounded-full border border-gray-300 text-gray-700 hover:border-gray-400"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between px-3 py-2 border-b">
                <div className="text-sm font-semibold text-gray-700">Chat</div>
                <button
                  onClick={() => setOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium rounded-full border border-gray-300 text-gray-700 hover:border-gray-400"
                >
                  Close
                </button>
              </div>
            )}

            {activeTab === "chat" || role === "student" ? (
              <div className="p-3">
                <div className="h-64 overflow-auto space-y-2">
                  {chat.map((c, idx) => (
                    <div key={idx} className="text-sm text-gray-700">
                      <span className="font-semibold mr-1">
                        {(c as any).name
                          ? String((c as any).name).slice(0, 12)
                          : c.socketId.slice(0, 4)}
                        :
                      </span>
                      <span>{c.message}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message"
                    className="flex-1 border rounded-lg px-3 py-2 text-sm"
                  />
                  <button
                    onClick={handleSend}
                    className="px-3 py-2 rounded-lg primary-gradient text-white text-sm"
                  >
                    Send
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 h-72 overflow-auto">
                {participants.length === 0 && (
                  <div className="text-sm text-gray-500">No participants</div>
                )}
                {participants.map((p) => (
                  <div
                    key={p.socketId}
                    className="flex items-center justify-between py-2 border-b text-sm"
                  >
                    <span className="text-gray-800">{p.name}</span>
                    <button
                      onClick={() => kickParticipant(p.socketId)}
                      className="text-blue-600 hover:underline"
                    >
                      Kick out
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

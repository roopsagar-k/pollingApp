import { Server, Socket } from "socket.io";
import { PollService } from "../services/poll.service";
import { Option } from "../types";

const pollService = new PollService();

export const registerPollHandlers = (io: Server, socket: Socket) => {
  socket.on("create_poll", async () => {
    const poll = await pollService.createPoll(socket.id);
    socket.join(poll.id);
    io.emit("poll_created", poll);
  });

  socket.on("join_poll", async ({ name }) => {
    const pollId = await pollService.addStudentToCurrentPoll(socket.id, name);
    if (!pollId) {
      io.to(socket.id).emit("join_failed", {
        message: "No active poll available.",
      });
      return;
    }

    socket.join(pollId);
    io.to(pollId).emit("student_joined", { name });
    io.to(socket.id).emit("joined_success", { pollId });

    const currentPoll = await pollService.getCurrentPoll();
    const question = currentPoll?.currentQuestion;
    if (currentPoll && question && question.isActive) {
      const elapsedMs = Date.now() - question.createdAt;
      const totalMs = (question.duration || 0) * 1000;
      const remainingMs = Math.max(0, totalMs - elapsedMs);
      const remainingSeconds = Math.ceil(remainingMs / 1000);

      io.to(socket.id).emit("question_started", {
        text: question.text,
        options: question.options,
        duration: remainingSeconds,
      });
    }
  });

  socket.on(
    "new_question",
    async (data: { text: string; duration: number; options: Option[] }) => {
      const { text, options, duration } = data;

      const currentPoll = await pollService.getCurrentPoll();
      if (!currentPoll) return;

      const question = await pollService.setQuestion(
        currentPoll.id,
        text,
        options,
        duration
      );
      if (!question) return;

      io.to(currentPoll.id).emit("question_started", {
        text,
        options,
        duration,
      });

      setTimeout(async () => {
        await pollService.endQuestion(currentPoll.id);
        const results = await pollService.getResults(currentPoll.id);
        io.to(currentPoll.id).emit("poll_results", results);
        io.to(currentPoll.id).emit("time_up");
      }, duration * 1000);
    }
  );

  socket.on("submit_answer", async ({ answer }) => {
    const currentPoll = await pollService.getCurrentPoll();
    if (!currentPoll) return;

    const status = await pollService.submitAnswer(
      currentPoll.id,
      socket.id,
      answer
    );

    if (status === "all_answered") {
      await pollService.endQuestion(currentPoll.id);
      const results = await pollService.getResults(currentPoll.id);
      io.to(currentPoll.id).emit("poll_results", results);
    }
  });

  socket.on("get_past_polls", async () => {
    const polls = await pollService.getAllPolls();
    io.to(socket.id).emit("past_polls", polls);
  });

  socket.on("chat_message", async ({ message }) => {
    const currentPoll = await pollService.getCurrentPoll();
    if (!currentPoll) return;
    const isTeacher = currentPoll.teacherSocketId === socket.id;
    const student = currentPoll.students.find((s) => s.socketId === socket.id);
    const name = isTeacher ? "Teacher" : student?.name || "Anonymous";
    io.to(currentPoll.id).emit("chat_message", {
      socketId: socket.id,
      name,
      message,
      timestamp: Date.now(),
    });
  });

  socket.on("get_participants", async () => {
    const currentPoll = await pollService.getCurrentPoll();
    if (!currentPoll) return;
    io.to(socket.id).emit("participants", currentPoll.students);
  });

  socket.on("kick_participant", async ({ socketId }) => {
    const currentPoll = await pollService.getCurrentPoll();
    if (!currentPoll) return;
    if (currentPoll.teacherSocketId !== socket.id) return;
    await pollService.removeStudent(currentPoll.id, socketId);
    io.to(currentPoll.id).emit("participants", currentPoll.students);
    io.to(socketId).emit("kicked");
  });

  socket.on("kick_everyone_out", async () => {
    const currentPoll = await pollService.getCurrentPoll();
    if(!currentPoll) return;
    await pollService.clearPoll();
    io.to(currentPoll.id).emit("kicked_everyone")
  });

  socket.on("disconnect", async () => {
    console.log(`Socket ${socket.id} disconnected`);
    const cleared = await pollService.clearCurrentPollIfTeacher(socket.id);
    if (cleared) {
      io.emit("poll_cleared");
    }
  });
};

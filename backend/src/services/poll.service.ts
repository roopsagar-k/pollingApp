import redis from "../utils/redis";
import { Poll, Option, Question } from "../types";

export class PollService {
  private POLL_KEY_PREFIX = "poll:";

  private getPollKey(pollId: string) {
    // if (pollId.startsWith("poll_")) return pollId;
    // return `${this.POLL_KEY_PREFIX}${pollId}`;
    return pollId;
  }

  async createPoll(teacherSocketId: string): Promise<Poll> {
    const id = `poll_${Date.now()}`;
    const poll: Poll = {
      id,
      teacherSocketId,
      students: [], // Student[] with socketId & name
      currentQuestion: null,
      createdAt: Date.now(),
    };

    await redis.set(this.getPollKey(id), JSON.stringify(poll));
    await redis.set("currentPoll", id);
    await redis.lPush("pollHistory", id);

    return poll;
  }

  async getPoll(pollId: string): Promise<Poll | null> {
    const data = await redis.get(this.getPollKey(pollId));
    return data ? (JSON.parse(data) as Poll) : null;
  }

  async getCurrentPoll(): Promise<Poll | null> {
    const id = await redis.get("currentPoll");
    if (!id) return null;
    return this.getPoll(id);
  }

  async clearCurrentPollIfTeacher(socketId: string) {
    const current = await this.getCurrentPoll();
    if (!current) return false;
    if (current.teacherSocketId !== socketId) return false;
    await redis.del(this.getPollKey(current.id));
    await redis.del("currentPoll");
    return true;
  }

  async getAllPolls(): Promise<Poll[]> {
    const ids = await redis.lRange("pollHistory", 0, -1);
    const polls = await Promise.all(
      ids.map((id) => redis.get(id).then((p) => (p ? JSON.parse(p) : null)))
    );
    return polls.filter(Boolean) as Poll[];
  }

  async addStudentToCurrentPoll(socketId: string, name: string) {
    const poll = await this.getCurrentPoll();
    console.log("poll", poll);
    if (!poll) return null;

    const exists = poll.students.find((s) => s.socketId === socketId);
    if (!exists) poll.students.push({ socketId, name });

    await redis.set(this.getPollKey(poll.id), JSON.stringify(poll));
    return poll.id;
  }

  async setQuestion(
    pollId: string,
    text: string,
    options: Option[],
    duration = 60
  ): Promise<Question | null> {
    const poll = await this.getPoll(pollId);
    if (!poll) return null;

    const question: Question = {
      text,
      options,
      answers: {}, // { socketId: { name, answer } }
      createdAt: Date.now(),
      duration,
      isActive: true,
    };

    poll.currentQuestion = question;
    await redis.set(this.getPollKey(pollId), JSON.stringify(poll));

    return question;
  }

  async submitAnswer(pollId: string, socketId: string, answer: string) {
    const poll = await this.getPoll(pollId);
    if (!poll?.currentQuestion?.isActive) return;

    const student = poll.students.find((s) => s.socketId === socketId);
    if (!student) return;

    poll.currentQuestion.answers[socketId] = {
      name: student.name,
      answer,
    };

    if (
      poll.students.length === Object.keys(poll.currentQuestion.answers).length
    ) {
      poll.currentQuestion.isActive = false;
    }

    await redis.set(this.getPollKey(pollId), JSON.stringify(poll));

    if (!poll.currentQuestion.isActive) return "all_answered";
  }

  async getResults(pollId: string) {
    const poll = await this.getPoll(pollId);
    return poll?.currentQuestion?.answers || {};
  }

  async endQuestion(pollId: string) {
    const poll = await this.getPoll(pollId);
    if (!poll?.currentQuestion) return;
    poll.currentQuestion.isActive = false;
    await redis.set(this.getPollKey(pollId), JSON.stringify(poll));
  }

  async removeStudent(pollId: string, socketId: string) {
    const poll = await this.getPoll(pollId);
    if (!poll) return null;
    poll.students = poll.students.filter((s) => s.socketId !== socketId);
    await redis.set(this.getPollKey(pollId), JSON.stringify(poll));
    return poll;
  }
}

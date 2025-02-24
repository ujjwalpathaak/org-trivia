import cron from 'node-cron'
import QuestionRepository from '../repositories/question.repository.js'
import QuestionService from '../services/question.service.js'
import { scheduleQuestions } from './ cron_expressions.jobs.js'

const questionService = new QuestionService(new QuestionRepository());

export const scheduleQuestionsJob = cron.schedule("0 0 * * *", async () => {
  console.log("Running daily question scheduling job...");

  try {
    await questionService.scheduleQuestionsForNextWeek();
    console.log("Successfully scheduled 7 new questions for all organizations.");
  } catch (error) {
    console.error("Error scheduling questions:", error);
  }
});
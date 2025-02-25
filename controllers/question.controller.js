import QuestionRepository from "../repositories/question.repository.js";
import QuestionService from "../services/question.service.js";

const questionService = new QuestionService(new QuestionRepository());

export const getAllQuestions = async () => {
  try {
    const questions = await questionService.getAllQuestions();
    res.status(200).json(questions);
  } catch (err) {
    res.status(500).json({ message: "server error", error: err });
  }
};

export const getQuestionById = async () => {
  try {
    const { questionId } = req.params
    const questions = await questionService.getQuestionsById(questionId);
    res.status(200).json(questions);
  } catch (err) {
    res.status(500).json({ message: "server error", error: err });
  }
};

export const addQuestions = async (req, res) => {
  try {
    const question = req.body;
    const newQues = await questionService.saveQuestion(question);
    res.status(200).json({ newQues });
  } catch (err) {
    res.status(500).json({ message: "server error", error: err });
  }
};

export const getQuestionByGenreName = () => {
  try {
  } catch (err) {
    res.status(500).json({ message: "server error", error: err });
  }
};

export const handleLambdaCallback = async (req, res) => {
  try {
    const data = req.body;
    const { weeklyQuestions, orgId } = await questionService.formatWeeklyQuestions(data);
    await questionService.saveWeeklyQuestions(weeklyQuestions);

    res.status(200).json({ message: "Scheduled new questions"});
  } catch (err) {
    res.status(500).json({ message: "server error", error: err });
  }
}
export const getWeeklyUnapprovedQuestions = async (req, res) => {
  try {
    const { orgId } = req.params;
    const questions = await questionService.getWeeklyUnapprovedQuestions(orgId);

    res.status(200).json({ questions: questions});
  } catch (err) {
    res.status(500).json({ message: "server error", error: err });
  }

}


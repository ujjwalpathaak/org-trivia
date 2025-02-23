import Question from '../models/question.model.js';

class QuestionRepository {
    async saveQuestion(newQuestion){
        const newQues = new Question(newQuestion);
        newQues.save();

        return newQues
    }
}

export default QuestionRepository;
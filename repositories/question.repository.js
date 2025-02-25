import Question from '../models/question.model.js';
import WeeklyQuestion from '../models/weeklyQuestion.model.js';

class QuestionRepository {
    async saveQuestion(newQuestion) {
        return await new Question(newQuestion).save();
    }
    
    async saveWeeklyQuestions(newQuestions) {
        try{
            return await WeeklyQuestion.insertMany(newQuestions);
        }catch(err){
            console.log(err)
        }
    }
    
    async getCompanyName(orgId) {
        return await WeeklyQuestion.insertMany(newQuestions);
    }
    
}

export default QuestionRepository;
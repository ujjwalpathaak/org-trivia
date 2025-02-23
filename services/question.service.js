class QuestionService {
    constructor(questionService) {
        this.questionService = questionService;
    }
    async saveQuestion(newQuestion){
        console.log(newQuestion)
        return this.questionService.saveQuestion(newQuestion);
    }
}

export default QuestionService;

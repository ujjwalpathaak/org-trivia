const API_GATEWAY_URL = "https://w6d724kzj1.execute-api.eu-north-1.amazonaws.com"

class QuestionService {
    constructor(questionService) {
        this.questionService = questionService;
    }

    async saveQuestion(newQuestion){
        return this.questionService.saveQuestion(newQuestion);
    }

    async scheduleQuestionsForNextWeek(){
        // logic for scheduling quesitons
        // see what all orgs have it enabled.
        // see which week it is.
        // start that workflow.
    }

    async selectPnAQuestions(){
        // logic for selectPnAQuestions
        // currently hardcode it.
        const PnAQuestions = [
            {
              "question": "Golu starts from his house and walks 8 km north. Then, he turns left and walks 6 km. What is the shortest distance from his house?",
              "img": null,
              "options": ["10 km", "16 km", "14 km", "2 km"],
              "answer": 0,
              "refactor": false
            },
            {
              "question": "P starts walking 25 m west from his house, then turns right and walks 10 m. He turns right again and walks 15 m. After this, he turns right at an angle of 135° and walks 30 m. In which direction is he now heading?",
              "img": null,
              "options": ["West", "South", "South-West", "South-East"],
              "answer": 2,
              "refactor": true
            },
            {
              "question": "X starts walking straight south for 5 m, then turns left and walks 3 m. After that, he turns right and walks another 5 m. In which direction is X facing now?",
              "img": null,
              "options": ["North-East", "South", "North", "South-West"],
              "answer": 1,
              "refactor": true
            },
            {
              "question": "Hemant leaves his house, which is in the east, and reaches a crossing. The road to his left leads to a theatre, while the road straight ahead leads to a hospital. In which direction is the university?",
              "img": null,
              "options": ["North", "South", "East", "West"],
              "answer": 0,
              "refactor": false
            }
        ];

        this.fetchPnAQuestions(PnAQuestions)
    }
    
    async fetchPnAQuestions(companyName, PnAQuestions) {    
        try {
            const response = await fetch(API_GATEWAY_URL + "/generatePnA_Questions", {
                method: "POST",
                headers: {
                    'x-api-key': 'your-api-key',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    companyName: companyName,
                    PnAQuestions: PnAQuestions
                })
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const data = await response.json();
            console.log(data);
        } catch (error) {
            throw new Error("Error fetching PnA Questions:", error);
        }
    }
    
    async fetchCAnITQuestions(){
        // logic for fetchCAnITQuestions 
    }
    async fetchHRDQuestions(){
        // logic for fetchHRDQuestions
    }
    async scheduleQuestionsForNextWeek(){
        // logic for scheduling quesitons
    }
}

export default QuestionService;

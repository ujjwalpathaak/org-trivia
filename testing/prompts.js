export const generatePnAPrompt = (darwinbox, PnAQuestions) => `
Your task is to change the wording of question only rephrase the old questoin to align with ${darwinbox}.  

Guidelines:
- Retain the original meaning, logic, and answer options.  
- Modify the phrasing so that the questions feel directly related to ${darwinbox}'s teams, products, industry, or operations.
- Replace generic names and scenarios with relevant examples from ${darwinbox}'s context.  
  - Example: Instead of *"A shopkeeper calculates his monthly revenue,"* use *"A sales executive at ${darwinbox} calculates the monthly revenue of a key client."*  
- Ensure clarity and engagement while keeping the questions professional and conversational.

${PnAQuestions}

only return the new string.
`;

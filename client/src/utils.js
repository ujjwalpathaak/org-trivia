export const validateForm = (formData, setErrors, isLogin = false) => {
  let newErrors = {};

  if (!formData.email.trim()) {
    newErrors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    newErrors.email = 'Invalid email format';
  } else if (
    !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)
  ) {
    newErrors.email =
      'Email must be in a valid format (e.g., user@example.com)';
  } else if (formData.email.length > 100) {
    newErrors.email = 'Email must be less than 100 characters';
  } else if (/\s/.test(formData.email)) {
    newErrors.email = 'Email cannot contain spaces';
  }

  if (!formData.password.trim()) {
    newErrors.password = 'Password is required';
  } else if (!isLogin && formData.password.length < 6) {
    newErrors.password = 'Password must be at least 6 characters';
  } else if (!isLogin && !/[A-Z]/.test(formData.password)) {
    newErrors.password = 'Password must contain at least one uppercase letter';
  } else if (!isLogin && !/[a-z]/.test(formData.password)) {
    newErrors.password = 'Password must contain at least one lowercase letter';
  } else if (!isLogin && !/[0-9]/.test(formData.password)) {
    newErrors.password = 'Password must contain at least one number';
  } else if (!isLogin && !/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
    newErrors.password = 'Password must contain at least one special character';
  } else if (!isLogin && /\s/.test(formData.password)) {
    newErrors.password = 'Password cannot contain spaces';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

export const mergeUserAnswersAndCorrectAnswers = (
  correctAnswers,
  myAnswers,
) => {
  return correctAnswers.map(({ _id, answer }) => {
    const myAnswerObj = myAnswers.find(
      ({ questionId }) => questionId === _id.toString(),
    );
    return {
      questionId: _id,
      correctAnswer: answer,
      employeeAnswer: myAnswerObj ? myAnswerObj.answer : null,
    };
  });
};

export const getMonthAndYear = () => {
  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  return [month, year];
};

export const getPreviousMonthAndYear = () => {
  const today = new Date();

  let pMonth = today.getMonth();
  let pYear = today.getFullYear();
  
  return [pMonth, pYear];
};

export const daysUntilNextFriday = () => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7;

  return daysUntilFriday;
}

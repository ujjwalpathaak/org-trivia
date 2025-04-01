const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input.trim().replace(/[$.]/g, '');
  } else if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  } else if (typeof input === 'object' && input !== null) {
    return Object.fromEntries(
      Object.entries(input).map(([key, value]) => [key, sanitizeInput(value)]),
    );
  }
  return input;
};

export const sanitizeRequest = (req, res, next) => {
  if (req.body) req.body = sanitizeInput(req.body);
  if (req.query) req.query = sanitizeInput(req.query);
  if (req.params) req.params = sanitizeInput(req.params);
  if (req.data) req.data = sanitizeInput(req.data);

  next();
};

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Only POST requests are allowed." });
  }

  const { name, email, password } = req.body ?? {};

  // Basic input validation. This function does not store users yet.
  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Name, email and password are required."
    });
  }

  if (typeof password !== "string" || password.length < 8) {
    return res.status(400).json({
      message: "Password must be at least 8 characters long."
    });
  }

  // No database is used here, so this is only a mock registration response.
  // Never return the password to the frontend.
  return res.status(201).json({
    message: "Registration successful.",
    user: {
      name,
      email
    }
  });
}

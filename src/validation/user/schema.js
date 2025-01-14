const { z } = require("zod");

const userSchemas = {
  register: z.object({
    name: z
      .string()
      .min(3, "Name must be at least 3 characters")
      .max(24, "Name must not exceed 24 characters")
      .transform((val) => val.trim()),
    email: z
      .string()
      .email("Invalid email format")
      .transform((val) => val.toLowerCase()),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(100, "Password must not exceed 100 characters"),
  }),

  login: z.object({
    email: z
      .string()
      .email("Invalid email format")
      .transform((val) => val.toLowerCase()),
    password: z.string().min(1, "Password is required"),
  }),
};

module.exports = userSchemas;

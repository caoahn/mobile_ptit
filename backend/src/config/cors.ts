import { CorsOptions } from "cors";

export const corsOptions: CorsOptions = {
  origin: "*", // Change this to specific domains in production
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

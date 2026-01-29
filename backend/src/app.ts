import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { corsOptions } from "./config/cors";
import routes from "./routes";
import { errorHandler } from "./middlewares/error.middleware";

const app = express();

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", routes);

// Swagger UI
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
app.use("/api", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Error Handling
app.use(errorHandler);

export default app;

import { createContainer, asClass, InjectionMode, asValue } from "awilix";

// Repositories
import { UserRepository } from "../repositories/user.repository";
import { TokenRepository } from "../repositories/token.repository";
import { RecipeRepository } from "../repositories/recipe.repository";

// Services
import { UserService } from "../services/user.service";
import { AuthService } from "../services/auth.service";
import { TokenService } from "../services/token.service";
import { SocketService } from "../services/socket.service";
import { RecipeService } from "../services/recipe.service";
import { AIService } from "../services/ai.service";
import { CloudinaryService } from "../services/cloudinary.service";

// Controllers
import { UserController } from "../controllers/user.controller";
import { AuthController } from "../controllers/auth.controller";
import { HealthController } from "../controllers/health.controller";
import { RecipeController } from "../controllers/recipe.controller";
import { UtilController } from "../controllers/util.controller";
import { UploadController } from "../controllers/upload.controller";

const container = createContainer({
  injectionMode: InjectionMode.CLASSIC,
});

container.register({
  // Repositories
  userRepository: asClass(UserRepository).scoped(),
  tokenRepository: asClass(TokenRepository).scoped(),
  recipeRepository: asClass(RecipeRepository).scoped(),

  // Services
  userService: asClass(UserService).scoped(),
  tokenService: asClass(TokenService).scoped(),
  authService: asClass(AuthService).scoped(),
  socketService: asClass(SocketService).singleton(),
  recipeService: asClass(RecipeService).scoped(),
  aiService: asClass(AIService).scoped(),
  cloudinaryService: asClass(CloudinaryService).scoped(),

  // Controllers
  userController: asClass(UserController).scoped(),
  authController: asClass(AuthController).scoped(),
  recipeController: asClass(RecipeController).scoped(),
  healthController: asClass(HealthController).scoped(),
  utilController: asClass(UtilController).scoped(),
  uploadController: asClass(UploadController).scoped(),
});

export default container;

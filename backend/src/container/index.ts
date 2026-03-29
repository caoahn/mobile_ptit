import { createContainer, asClass, InjectionMode, asValue } from "awilix";

// Repositories
import { UserRepository } from "../repositories/user.repository";
import { TokenRepository } from "../repositories/token.repository";
import { RecipeRepository } from "../repositories/recipe.repository";
import { NotificationRepository } from "../repositories/notification.repository";
import { CommentRepository } from "../repositories/comment.repository";
import { LikeRepository } from "../repositories/like.repository";

// Services
import { UserService } from "../services/user.service";
import { AuthService } from "../services/auth.service";
import { TokenService } from "../services/token.service";
import { SocketService } from "../services/socket.service";
import { RecipeService } from "../services/recipe.service";
import { AIService } from "../services/ai.service";
import { CloudinaryService } from "../services/cloudinary.service";
import { NotificationService } from "../services/notification.service";

// Controllers
import { UserController } from "../controllers/user.controller";
import { AuthController } from "../controllers/auth.controller";
import { HealthController } from "../controllers/health.controller";
import { RecipeController } from "../controllers/recipe.controller";
import { UtilController } from "../controllers/util.controller";
import { UploadController } from "../controllers/upload.controller";
import { NotificationController } from "../controllers/notification.controller";
import { UpdateRecipeController } from "../controllers/update.recipe.controller";

// Services (update recipe)
import { UpdateRecipeService } from "../services/update.recipe.service";
import { RecommendationService } from "../services/recommendation.service";
import { RecommendationController } from "../controllers/recommendation.controller";

const container = createContainer({
  injectionMode: InjectionMode.CLASSIC,
});

container.register({
  // Repositories
  userRepository: asClass(UserRepository).scoped(),
  tokenRepository: asClass(TokenRepository).scoped(),
  recipeRepository: asClass(RecipeRepository).scoped(),
  notificationRepository: asClass(NotificationRepository).scoped(),
  commentRepository: asClass(CommentRepository).scoped(),
  likeRepository: asClass(LikeRepository).scoped(),

  // Services
  userService: asClass(UserService).scoped(),
  tokenService: asClass(TokenService).scoped(),
  authService: asClass(AuthService).scoped(),
  socketService: asClass(SocketService).singleton(),
  recipeService: asClass(RecipeService).scoped(),
  updateRecipeService: asClass(UpdateRecipeService).scoped(),
  aiService: asClass(AIService).scoped(),
  cloudinaryService: asClass(CloudinaryService).scoped(),
  notificationService: asClass(NotificationService).scoped(),

  // Controllers
  userController: asClass(UserController).scoped(),
  authController: asClass(AuthController).scoped(),
  recipeController: asClass(RecipeController).scoped(),
  updateRecipeController: asClass(UpdateRecipeController).scoped(),
  healthController: asClass(HealthController).scoped(),
  utilController: asClass(UtilController).scoped(),
  uploadController: asClass(UploadController).scoped(),
  notificationController: asClass(NotificationController).scoped(),
  recommendationService: asClass(RecommendationService).scoped(),
  recommendationController: asClass(RecommendationController).scoped(),
});

export default container;

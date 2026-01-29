import { createContainer, asClass, InjectionMode, asValue } from "awilix";

// Repositories
import { UserRepository } from "../repositories/user.repository";
import { TokenRepository } from "../repositories/token.repository";
import { MeetingRepository } from "../repositories/meeting.repository";
import { TranscriptRepository } from "../repositories/transcript.repository";
import { RecipeRepository } from "../repositories/recipe.repository";

// Services
import { UserService } from "../services/user.service";
import { AuthService } from "../services/auth.service";
import { TokenService } from "../services/token.service";
import { AudioService } from "../services/audio.service";
import { MeetingService } from "../services/meeting.service";
import { TranscriptService } from "../services/transcript.service";
import { SocketService } from "../services/socket.service";
import { RecipeService } from "../services/recipe.service";
import { AIService } from "../services/ai.service";

// Controllers
import { UserController } from "../controllers/user.controller";
import { AuthController } from "../controllers/auth.controller";
import { AudioController } from "../controllers/audio.controller";
import { MeetingController } from "../controllers/meeting.controller";
import { TranscriptController } from "../controllers/transcript.controller";
import { HealthController } from "../controllers/health.controller";
import { RecipeController } from "../controllers/recipe.controller";
import { UtilController } from "../controllers/util.controller";

const container = createContainer({
  injectionMode: InjectionMode.CLASSIC,
});

container.register({
  // Repositories
  userRepository: asClass(UserRepository).scoped(),
  tokenRepository: asClass(TokenRepository).scoped(),
  meetingRepository: asClass(MeetingRepository).scoped(),
  transcriptRepository: asClass(TranscriptRepository).scoped(),
  recipeRepository: asClass(RecipeRepository).scoped(),

  // Services
  userService: asClass(UserService).scoped(),
  tokenService: asClass(TokenService).scoped(),
  authService: asClass(AuthService).scoped(),
  audioService: asClass(AudioService).scoped(),
  meetingService: asClass(MeetingService).scoped(),
  transcriptService: asClass(TranscriptService).scoped(),
  socketService: asClass(SocketService).singleton(), // Keep SocketService as singleton commonly
  recipeService: asClass(RecipeService).scoped(),
  aiService: asClass(AIService).scoped(),

  // Controllers
  userController: asClass(UserController).scoped(),
  authController: asClass(AuthController).scoped(),
  recipeController: asClass(RecipeController).scoped(),
  audioController: asClass(AudioController).scoped(),
  meetingController: asClass(MeetingController).scoped(),
  transcriptController: asClass(TranscriptController).scoped(),
  healthController: asClass(HealthController).scoped(),
  utilController: asClass(UtilController).scoped(),
});

export default container;

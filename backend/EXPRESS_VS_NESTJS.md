# Summary: Express vs NestJS - Key Changes

## 🔄 Quick Reference Guide

### Dependency Injection

**Express (Awilix)**

```typescript
// container/index.ts
import { createContainer, asClass } from "awilix";

const container = createContainer();
container.register({
  userService: asClass(UserService).scoped(),
  userController: asClass(UserController).scoped(),
});

// Usage
const userController = container.resolve<UserController>("userController");
```

**NestJS (Built-in)**

```typescript
// users.module.ts
@Module({
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}

// users.controller.ts
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {} // Auto-injected
}
```

---

### Routing

**Express**

```typescript
// routes/user.route.ts
import { Router } from "express";
const router = Router();

router.get("/profile", authMiddleware, userController.getProfile);
router.post("/:id/follow", authMiddleware, userController.followUser);

export default router;
```

**NestJS**

```typescript
// users.controller.ts
@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
  @Get("profile")
  getProfile(@Req() req) {}

  @Post(":id/follow")
  followUser(@Param("id") id: number) {}
}
```

---

### Middleware → Guards/Interceptors

**Express (Middleware)**

```typescript
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    req.user = tokenService.verifyToken(token);
    next();
  } catch (err) {
    return res.status(403).json({ error: "Forbidden" });
  }
};
```

**NestJS (Guard)**

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

// JWT Strategy
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersRepo: UsersRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'secret',
    });
  }

  async validate(payload: any) {
    return this.usersRepo.findById(payload.id);
  }
}

// Usage
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@Req() req) { }
```

---

### Validation

**Express (Manual)**

```typescript
router.post("/register", (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ error: "Password too short" });
  }

  next();
});
```

**NestJS (class-validator)**

```typescript
// register.dto.ts
export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

// controller
@Post('register')
register(@Body() registerDto: RegisterDto) {
  // Validation automatic
}
```

---

### Error Handling

**Express**

```typescript
// middlewares/error.middleware.ts
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.error(err.message);
  return res.status(500).json({
    error: err.message || "Internal server error",
  });
};

// app.ts
app.use(errorHandler);

// Usage in service
if (!user) {
  throw new Error("User not found");
}
```

**NestJS**

```typescript
// filters/http-exception.filter.ts
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Handle all exceptions
  }
}

// main.ts
app.useGlobalFilters(new AllExceptionsFilter());

// Usage in service
if (!user) {
  throw new NotFoundException("User not found");
}
// Or: throw new BadRequestException(), UnauthorizedException(), etc.
```

---

### DTOs & Response

**Express**

```typescript
// dto/auth/register.request.ts
export interface RegisterRequest {
  email: string;
  password: string;
}

// utils/response.ts
export const sendSuccess = (res: Response, data: any, message?: string) => {
  return res.status(200).json({
    success: true,
    message,
    data,
  });
};

// controller
register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await this.authService.register(req.body);
    sendSuccess(res, user, "User registered");
  } catch (error) {
    next(error);
  }
};
```

**NestJS**

```typescript
// dto/register.dto.ts
export class RegisterDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password: string;
}

// controller - No need for manual response formatting
@Post('register')
async register(@Body() registerDto: RegisterDto) {
  return this.authService.register(registerDto);
  // NestJS auto-formats to JSON with 200/201 status
}

// Or use Interceptor for custom format
@UseInterceptors(TransformInterceptor)
```

---

### Database Models

**Express (Sequelize)**

```typescript
// models/user.model.ts
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "users",
  },
);
```

**NestJS (Sequelize-TypeScript)**

```typescript
// entities/user.entity.ts
import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'users',
  timestamps: true,
  underscored: true,
})
export class User extends Model<User> {
  @Column({
    type: DataType.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  email: string;
}

// Module
@Module({
  imports: [SequelizeModule.forFeature([User])],
})
```

---

### Repository Pattern

**Express**

```typescript
// repositories/user.repository.ts
export class UserRepository {
  async findById(id: number): Promise<User | null> {
    return User.findByPk(id);
  }
}

// container/index.ts
container.register({
  userRepository: asClass(UserRepository).scoped(),
});
```

**NestJS**

```typescript
// users.repository.ts
@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async findById(id: number): Promise<User | null> {
    return this.userModel.findByPk(id);
  }
}

// users.module.ts
@Module({
  imports: [SequelizeModule.forFeature([User])],
  providers: [UsersRepository],
  exports: [UsersRepository],
})
```

---

### Service Layer

**Express**

```typescript
// services/auth.service.ts
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
  ) {}

  async login(data: LoginRequest) {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) throw new Error("Invalid credentials");
    // ...
  }
}
```

**NestJS**

```typescript
// auth.service.ts
@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly tokenService: TokenService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersRepository.findByEmail(loginDto.email);
    if (!user) throw new UnauthorizedException("Invalid credentials");
    // ...
  }
}
```

---

### Swagger Documentation

**Express (swagger-jsdoc)**

```typescript
// routes/auth.route.ts
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 */
router.post("/login", authController.login);

// config/swagger.ts
import swaggerJsdoc from "swagger-jsdoc";
export const swaggerSpec = swaggerJsdoc({
  /* ... */
});
```

**NestJS (@nestjs/swagger)**

```typescript
// auth.controller.ts
@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  @Post("login")
  @ApiOperation({ summary: "Login user" })
  @ApiResponse({ status: 200, description: "Login successful" })
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto) {}
}

// login.dto.ts
export class LoginDto {
  @ApiProperty({ example: "user@example.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "Password123!" })
  @IsString()
  password: string;
}

// main.ts
const config = new DocumentBuilder()
  .setTitle("API")
  .setVersion("1.0")
  .addBearerAuth()
  .build();
const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup("api/docs", app, document);
```

---

### File Upload

**Express (Multer)**

```typescript
// middlewares/upload.middleware.ts
import multer from "multer";

const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const upload = multer({ storage });

// routes
router.post("/upload", upload.single("file"), userController.uploadAvatar);
```

**NestJS**

```typescript
// users.controller.ts
@Post('upload')
@UseInterceptors(
  FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
      },
    }),
  }),
)
async uploadFile(@UploadedFile() file: Express.Multer.File) {
  return { filename: file.filename };
}
```

---

### WebSocket (Socket.IO)

**Express**

```typescript
// services/socket.service.ts
import { Server } from "socket.io";

export class SocketService {
  private io: Server;

  init(server: any) {
    this.io = new Server(server);

    this.io.on("connection", (socket) => {
      console.log("Client connected");
    });
  }

  emit(event: string, data: any) {
    this.io.emit(event, data);
  }
}
```

**NestJS**

```typescript
// socket.gateway.ts
@WebSocketGateway({ cors: { origin: "*" } })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log("Client connected");
  }

  @SubscribeMessage("message")
  handleMessage(@MessageBody() data: any) {
    this.server.emit("message", data);
  }
}
```

---

### Testing

**Express (Manual Jest Setup)**

```typescript
// __tests__/auth.service.test.ts
import { AuthService } from "../services/auth.service";

describe("AuthService", () => {
  let authService: AuthService;

  beforeEach(() => {
    // Manual setup
    authService = new AuthService(mockUserRepo, mockTokenService);
  });

  it("should login user", async () => {
    // Test
  });
});
```

**NestJS (Built-in Testing)**

```typescript
// auth.service.spec.ts
import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";

describe("AuthService", () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersRepository, useValue: mockUsersRepo },
        { provide: TokenService, useValue: mockTokenService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it("should login user", async () => {
    // Test
  });
});
```

---

## 📊 Feature Comparison Table

| Feature                  | Express + Manual   | NestJS Built-in    | Winner    |
| ------------------------ | ------------------ | ------------------ | --------- |
| **Dependency Injection** | Awilix (3rd party) | Native             | NestJS ✓  |
| **Routing**              | Manual             | Decorators         | NestJS ✓  |
| **Validation**           | Manual/Joi         | class-validator    | NestJS ✓  |
| **OpenAPI/Swagger**      | swagger-jsdoc      | @nestjs/swagger    | NestJS ✓  |
| **Testing**              | Manual setup       | Built-in utilities | NestJS ✓  |
| **TypeScript Support**   | Good               | Excellent          | NestJS ✓  |
| **Module System**        | Manual             | Built-in           | NestJS ✓  |
| **Learning Curve**       | Easy               | Moderate           | Express ✓ |
| **Flexibility**          | High               | Moderate           | Express ✓ |
| **Structure**            | Free-form          | Opinionated        | Depends   |
| **Performance**          | Excellent          | Excellent          | Tie       |
| **Community**            | Huge               | Growing            | Express ✓ |

---

## 🎯 Migration Benefits

### Why NestJS?

1. **Better Structure**: Opinionated architecture giúp maintain dễ hơn
2. **Built-in Features**: DI, validation, Swagger, testing đã có sẵn
3. **TypeScript First**: Design cho TypeScript từ đầu
4. **Scalability**: Dễ scale với large teams
5. **Modern Patterns**: SOLID principles, Clean Architecture
6. **Documentation**: Tự động generate API docs
7. **Testing**: Built-in testing utilities
8. **Maintainability**: Code organized tốt hơn

### Trade-offs

1. **Learning Curve**: Phải học decorators, modules, providers
2. **Less Flexibility**: Phải follow NestJS way
3. **Bundle Size**: Slightly larger
4. **Migration Effort**: Cần thời gian để migrate

---

## 📚 Recommended Reading

1. [NestJS Documentation](https://docs.nestjs.com/)
2. [NestJS Fundamentals Course](https://courses.nestjs.com/)
3. [NestJS Best Practices](https://github.com/nestjs/nest/tree/master/sample)
4. [Clean Architecture with NestJS](https://dev.to/nestjs)

---

## ✅ Migration Checklist

- [ ] Understand NestJS concepts (modules, providers, controllers)
- [ ] Setup new NestJS project
- [ ] Migrate database configuration
- [ ] Convert models to entities
- [ ] Migrate DTOs with validation
- [ ] Migrate repositories
- [ ] Migrate services
- [ ] Migrate controllers with decorators
- [ ] Setup authentication (JWT strategy)
- [ ] Migrate middleware to guards/interceptors
- [ ] Setup Swagger
- [ ] Write tests
- [ ] Deploy

---

**Good luck with your migration! 🚀**

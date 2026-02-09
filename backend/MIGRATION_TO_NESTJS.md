# Tài Liệu Chi Tiết: Chuyển Đổi Backend Sang NestJS

## 📋 Mục Lục

1. [Tổng Quan Dự Án Hiện Tại](#1-tổng-quan-dự-án-hiện-tại)
2. [So Sánh Kiến Trúc](#2-so-sánh-kiến-trúc)
3. [Chuẩn Bị Môi Trường NestJS](#3-chuẩn-bị-môi-trường-nestjs)
4. [Roadmap Chuyển Đổi](#4-roadmap-chuyển-đổi)
5. [Chi Tiết Chuyển Đổi Từng Module](#5-chi-tiết-chuyển-đổi-từng-module)
6. [Migration Checklist](#6-migration-checklist)

---

## 1. Tổng Quan Dự Án Hiện Tại

### 1.1. Tech Stack Hiện Tại

```
- Framework: Express.js
- Language: TypeScript
- ORM: Sequelize
- Database: MySQL
- DI Container: Awilix
- Authentication: JWT (jsonwebtoken)
- File Upload: Multer
- Real-time: Socket.IO
- API Docs: Swagger
```

### 1.2. Cấu Trúc Dự Án Hiện Tại

```
backend/
├── src/
│   ├── app.ts                    # Express app setup
│   ├── server.ts                 # Entry point
│   ├── config/                   # Configuration
│   ├── container/                # Awilix DI container
│   ├── controllers/              # Request handlers
│   ├── dto/                      # Data Transfer Objects
│   ├── interfaces/               # TypeScript interfaces
│   ├── middlewares/              # Express middlewares
│   ├── models/                   # Sequelize models
│   ├── repositories/             # Data access layer
│   ├── routes/                   # Route definitions
│   ├── services/                 # Business logic
│   ├── types/                    # Type definitions
│   └── utils/                    # Utilities
```

### 1.3. Các Module Chính

1. **Auth Module**: Đăng ký, đăng nhập, refresh token
2. **User Module**: Quản lý user profile, follow/unfollow
3. **Recipe Module**: CRUD công thức nấu ăn, feed, likes
4. **Meeting Module**: Quản lý cuộc họp
5. **Audio Module**: Xử lý audio
6. **Transcript Module**: Xử lý transcript
7. **Health Module**: Health check endpoint
8. **Util Module**: Các utilities

---

## 2. So Sánh Kiến Trúc

### 2.1. Express (Hiện Tại) vs NestJS

| Aspect              | Express + Awilix       | NestJS                                |
| ------------------- | ---------------------- | ------------------------------------- |
| **DI Container**    | Awilix (manual)        | Built-in (@Injectable)                |
| **Routing**         | Manual route files     | Decorators (@Controller, @Get, @Post) |
| **Middleware**      | Express middleware     | Guards, Interceptors, Pipes           |
| **Validation**      | Manual/Custom          | class-validator & class-transformer   |
| **ORM Integration** | Sequelize (manual)     | @nestjs/sequelize (integrated)        |
| **Testing**         | Jest (manual setup)    | Built-in testing utilities            |
| **Module System**   | Manual                 | Built-in (@Module)                    |
| **Swagger**         | swagger-jsdoc + manual | @nestjs/swagger (decorators)          |

### 2.2. Mapping Components

| Express/Current    | NestJS Equivalent                  |
| ------------------ | ---------------------------------- |
| Controller         | Controller (@Controller)           |
| Service            | Provider (@Injectable)             |
| Repository         | Repository (Provider)              |
| Middleware         | Guard/Interceptor/Middleware       |
| DTO                | DTO with class-validator           |
| Route              | Controller methods with decorators |
| Container (Awilix) | Module system with DI              |
| Error Handler      | Exception Filters                  |

---

## 3. Chuẩn Bị Môi Trường NestJS

### 3.1. Cài Đặt NestJS CLI

```bash
npm install -g @nestjs/cli
```

### 3.2. Tạo Project Mới

```bash
# Option 1: Tạo project mới
nest new backend-nestjs

# Option 2: Init trong thư mục hiện tại (sau khi backup)
nest new . --skip-git
```

### 3.3. Cài Đặt Dependencies Cần Thiết

```bash
# Core NestJS packages
npm install @nestjs/common @nestjs/core @nestjs/platform-express

# Database - Sequelize
npm install @nestjs/sequelize sequelize sequelize-typescript mysql2
npm install @types/sequelize -D

# Configuration
npm install @nestjs/config

# Authentication
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install bcryptjs
npm install @types/passport-jwt @types/bcryptjs -D

# Validation
npm install class-validator class-transformer

# Swagger
npm install @nestjs/swagger swagger-ui-express

# File Upload
npm install @nestjs/platform-express multer
npm install @types/multer -D

# Socket.IO
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io

# Other utilities
npm install uuid
npm install @types/uuid -D
```

### 3.4. Package.json Scripts (NestJS)

```json
{
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  }
}
```

---

## 4. Roadmap Chuyển Đổi

### Phase 1: Setup & Core Infrastructure (Tuần 1)

- [ ] Tạo NestJS project structure
- [ ] Setup database configuration với Sequelize
- [ ] Migrate models sang entities
- [ ] Setup environment configuration
- [ ] Setup logging

### Phase 2: Common Modules (Tuần 1-2)

- [ ] Tạo common module (guards, interceptors, filters, pipes)
- [ ] Migrate middleware sang guards/interceptors
- [ ] Setup validation với class-validator
- [ ] Setup exception filters

### Phase 3: Auth Module (Tuần 2)

- [ ] Migrate Auth Service
- [ ] Implement JWT Strategy
- [ ] Migrate Auth Controller
- [ ] Setup Auth Guard
- [ ] Testing

### Phase 4: User Module (Tuần 2-3)

- [ ] Migrate User Repository
- [ ] Migrate User Service
- [ ] Migrate User Controller
- [ ] Implement follow/unfollow logic
- [ ] Testing

### Phase 5: Recipe Module (Tuần 3)

- [ ] Migrate Recipe Repository
- [ ] Migrate Recipe Service
- [ ] Migrate Recipe Controller
- [ ] Implement feed, likes, saved recipes
- [ ] Testing

### Phase 6: Meeting, Audio, Transcript Modules (Tuần 4)

- [ ] Migrate Meeting Module
- [ ] Migrate Audio Module
- [ ] Migrate Transcript Module
- [ ] Testing

### Phase 7: Socket.IO & Additional Features (Tuần 4)

- [ ] Setup WebSocket Gateway
- [ ] Migrate Socket Service
- [ ] Testing real-time features

### Phase 8: Documentation & Deployment (Tuần 5)

- [ ] Setup Swagger với decorators
- [ ] Write API documentation
- [ ] E2E testing
- [ ] Performance testing
- [ ] Deployment setup

---

## 5. Chi Tiết Chuyển Đổi Từng Module

### 5.1. Database Configuration

#### Current (Sequelize)

```typescript
// config/database.ts
export const sequelize = new Sequelize(
  env.db.name,
  env.db.user,
  env.db.password,
  {
    host: env.db.host,
    dialect: "mysql",
    logging: false,
  },
);
```

#### NestJS

```typescript
// database/database.module.ts
import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        dialect: "mysql",
        host: configService.get("DB_HOST"),
        port: configService.get("DB_PORT"),
        username: configService.get("DB_USER"),
        password: configService.get("DB_PASSWORD"),
        database: configService.get("DB_NAME"),
        autoLoadModels: true,
        synchronize: true, // Disable in production
        logging: false,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
```

### 5.2. Environment Configuration

#### Current

```typescript
// config/env.ts
export const env = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  db: { ... },
  jwt: { ... },
};
```

#### NestJS

```typescript
// config/configuration.ts
export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiration: "1h",
    refreshExpiration: "7d",
  },
});

// app.module.ts
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
  ],
})
export class AppModule {}
```

### 5.3. Models → Entities

#### Current (Sequelize Model)

```typescript
// models/user.model.ts
export class User extends Model<UserAttributes, UserCreationAttributes> {
  public id!: number;
  public username!: string;
  public email!: string;
  // ...
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    username: { type: DataTypes.STRING(50), allowNull: false },
    // ...
  },
  { sequelize, tableName: "users" },
);
```

#### NestJS (Sequelize-TypeScript Entity)

```typescript
// modules/users/entities/user.entity.ts
import { Table, Column, Model, DataType, HasMany } from "sequelize-typescript";

@Table({
  tableName: "users",
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
    type: DataType.STRING(50),
    allowNull: false,
    unique: true,
  })
  username: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    unique: true,
  })
  email: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  password_hash: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  full_name?: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  bio?: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  avatar_url?: string;

  // Remove password from JSON
  toJSON() {
    const values = { ...this.get() } as any;
    delete values.password_hash;
    return values;
  }
}
```

### 5.4. DTOs với Validation

#### Current (Simple Interface)

```typescript
// dto/auth/register.request.ts
export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}
```

#### NestJS (Class with Validation)

```typescript
// modules/auth/dto/register.dto.ts
import { IsEmail, IsString, MinLength, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RegisterDto {
  @ApiProperty({ example: "user@example.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "username123", minLength: 3, maxLength: 50 })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username: string;

  @ApiProperty({ example: "Password123!", minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;
}
```

### 5.5. Repository Pattern

#### Current

```typescript
// repositories/user.repository.ts
export class UserRepository implements IUserRepository {
  async create(user: UserCreationAttributes): Promise<User> {
    return User.create(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return User.findOne({ where: { email } });
  }
}
```

#### NestJS

```typescript
// modules/users/users.repository.ts
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { User } from "./entities/user.entity";

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    return this.userModel.create(userData);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return this.userModel.findByPk(id);
  }

  async update(id: number, userData: Partial<User>): Promise<User | null> {
    await this.userModel.update(userData, { where: { id } });
    return this.findById(id);
  }
}
```

### 5.6. Service Layer

#### Current

```typescript
// services/auth.service.ts
export class AuthService implements IAuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
  ) {}

  async register(data: RegisterRequest): Promise<UserProfileResponse> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error("Email already exists");
    }
    // ...
  }
}
```

#### NestJS

```typescript
// modules/auth/auth.service.ts
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from "@nestjs/common";
import { UsersRepository } from "../users/users.repository";
import { TokenService } from "./token.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import * as bcrypt from "bcryptjs";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly tokenService: TokenService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersRepository.findByEmail(
      registerDto.email,
    );
    if (existingUser) {
      throw new ConflictException("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.usersRepository.create({
      ...registerDto,
      password_hash: hashedPassword,
    });

    return this.mapUserToProfile(user);
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersRepository.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password_hash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const tokens = this.tokenService.generateAuthTokens(user);

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      user: this.mapUserToProfile(user),
    };
  }

  private mapUserToProfile(user: User) {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      bio: user.bio,
      avatar_url: user.avatar_url,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }
}
```

### 5.7. Controller Layer

#### Current

```typescript
// controllers/auth.controller.ts
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.authService.register(req.body);
      sendCreated(res, user, "User registered successfully");
    } catch (error) {
      next(error);
    }
  };
}
```

#### NestJS

```typescript
// modules/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Req,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @ApiOperation({ summary: "Register a new user" })
  @ApiResponse({ status: 201, description: "User registered successfully" })
  @ApiResponse({ status: 409, description: "Email already exists" })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Login user" })
  @ApiResponse({ status: 200, description: "Login successful" })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Refresh access token" })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refresh_token);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user profile" })
  async getProfile(@Req() req) {
    return req.user;
  }
}
```

### 5.8. Authentication Guard

#### Current (Middleware)

```typescript
// middlewares/auth.middleware.ts
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return sendError(res, 401, "Unauthorized");

  try {
    const user = tokenService.verifyToken(token, "access");
    (req as any).user = user;
    next();
  } catch (err) {
    return sendError(res, 403, "Forbidden");
  }
};
```

#### NestJS (Guard + JWT Strategy)

```typescript
// modules/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { UsersRepository } from "../../users/users.repository";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersRepository: UsersRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get("jwt.secret"),
    });
  }

  async validate(payload: any) {
    const user = await this.usersRepository.findById(payload.id);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}

// modules/auth/guards/jwt-auth.guard.ts
import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}
```

### 5.9. Module Definition

#### NestJS Auth Module

```typescript
// modules/auth/auth.module.ts
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { SequelizeModule } from "@nestjs/sequelize";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { TokenService } from "./token.service";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { UsersModule } from "../users/users.module";
import { User } from "../users/entities/user.entity";

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get("jwt.secret"),
        signOptions: { expiresIn: configService.get("jwt.accessExpiration") },
      }),
      inject: [ConfigService],
    }),
    SequelizeModule.forFeature([User]),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, TokenService, JwtStrategy],
  exports: [AuthService, TokenService, JwtStrategy, PassportModule],
})
export class AuthModule {}
```

### 5.10. Exception Handling

#### Current

```typescript
// middlewares/error.middleware.ts
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.error(err.message);
  return sendError(res, 500, err.message);
};
```

#### NestJS (Exception Filter)

```typescript
// common/filters/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Response } from "express";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : "Internal server error";

    this.logger.error(
      `${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : exception,
    );

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}

// main.ts
app.useGlobalFilters(new AllExceptionsFilter());
```

### 5.11. Main Entry Point

#### Current

```typescript
// server.ts
import app from "./app";
import { connectDB } from "./config/database";

const startServer = async () => {
  await connectDB();
  app.listen(env.port, () => {
    logger.info(`Server running on port ${env.port}`);
  });
};
startServer();
```

#### NestJS

```typescript
// main.ts
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix("api");

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle("Backend API")
    .setDescription("API documentation for Backend")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger UI: http://localhost:${port}/api`);
}
bootstrap();
```

### 5.12. App Module (Root)

```typescript
// app.module.ts
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import configuration from "./config/configuration";
import { DatabaseModule } from "./database/database.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { RecipesModule } from "./modules/recipes/recipes.module";
import { MeetingsModule } from "./modules/meetings/meetings.module";
import { AudioModule } from "./modules/audio/audio.module";
import { TranscriptsModule } from "./modules/transcripts/transcripts.module";
import { HealthModule } from "./modules/health/health.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    RecipesModule,
    MeetingsModule,
    AudioModule,
    TranscriptsModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

### 5.13. File Upload

#### Current

```typescript
// middlewares/upload.middleware.ts
import multer from "multer";
const storage = multer.diskStorage({ ... });
export const upload = multer({ storage });
```

#### NestJS

```typescript
// modules/users/users.controller.ts
import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";

@Controller("users")
export class UsersController {
  @Post("upload-avatar")
  @UseInterceptors(
    FileInterceptor("avatar", {
      storage: diskStorage({
        destination: "./uploads/avatars",
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}-${file.originalname}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return cb(new Error("Only image files are allowed!"), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    return {
      filename: file.filename,
      path: file.path,
      url: `/uploads/avatars/${file.filename}`,
    };
  }
}
```

### 5.14. WebSocket (Socket.IO)

#### Current

```typescript
// services/socket.service.ts
import { Server } from "socket.io";
export class SocketService {
  private io: Server;
  // ...
}
```

#### NestJS

```typescript
// modules/socket/socket.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Logger } from "@nestjs/common";

@WebSocketGateway({
  cors: {
    origin: "*",
  },
})
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger("SocketGateway");

  afterInit(server: Server) {
    this.logger.log("WebSocket Gateway initialized");
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage("message")
  handleMessage(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ): void {
    this.server.emit("message", data);
  }

  // Method to emit from service
  emitToAll(event: string, data: any) {
    this.server.emit(event, data);
  }

  emitToClient(clientId: string, event: string, data: any) {
    this.server.to(clientId).emit(event, data);
  }
}

// socket.module.ts
import { Module } from "@nestjs/common";
import { SocketGateway } from "./socket.gateway";

@Module({
  providers: [SocketGateway],
  exports: [SocketGateway],
})
export class SocketModule {}
```

---

## 6. Migration Checklist

### 6.1. Pre-Migration

- [ ] Backup toàn bộ code hiện tại
- [ ] Document tất cả APIs hiện có
- [ ] List tất cả dependencies
- [ ] Prepare test cases
- [ ] Setup git branch mới cho NestJS

### 6.2. Setup Phase

- [ ] Install NestJS CLI
- [ ] Create new NestJS project
- [ ] Setup TypeScript configuration
- [ ] Setup ESLint & Prettier
- [ ] Install all required dependencies
- [ ] Configure environment variables
- [ ] Setup database connection

### 6.3. Core Migration

- [ ] Migrate database configuration
- [ ] Convert models to entities
- [ ] Setup all DTOs with validation
- [ ] Create common module (guards, filters, interceptors)
- [ ] Setup logger
- [ ] Setup exception handling

### 6.4. Module Migration

- [ ] **Auth Module**
  - [ ] Token Service
  - [ ] JWT Strategy
  - [ ] Auth Service
  - [ ] Auth Controller
  - [ ] Auth Guard
  - [ ] Test endpoints

- [ ] **Users Module**
  - [ ] User Entity
  - [ ] Users Repository
  - [ ] Users Service
  - [ ] Users Controller
  - [ ] Follow/Unfollow features
  - [ ] Test endpoints

- [ ] **Recipes Module**
  - [ ] Recipe entities (Recipe, Ingredient, RecipeStep, Like, SavedRecipe)
  - [ ] Recipes Repository
  - [ ] Recipes Service
  - [ ] Recipes Controller
  - [ ] Feed implementation
  - [ ] Test endpoints

- [ ] **Meetings Module**
  - [ ] Meeting Entity
  - [ ] Meetings Repository
  - [ ] Meetings Service
  - [ ] Meetings Controller
  - [ ] Test endpoints

- [ ] **Audio Module**
  - [ ] Audio Service
  - [ ] Audio Controller
  - [ ] File upload handling
  - [ ] Test endpoints

- [ ] **Transcripts Module**
  - [ ] Transcript Entity
  - [ ] Transcripts Repository
  - [ ] Transcripts Service
  - [ ] Transcripts Controller
  - [ ] Test endpoints

- [ ] **Health Module**
  - [ ] Health Controller
  - [ ] Database health check
  - [ ] Test endpoint

### 6.5. Additional Features

- [ ] Setup Swagger documentation
- [ ] Implement file upload
- [ ] Setup WebSocket Gateway
- [ ] Implement pagination
- [ ] Implement search/filter

### 6.6. Testing

- [ ] Unit tests for services
- [ ] Unit tests for repositories
- [ ] Integration tests for controllers
- [ ] E2E tests for critical flows
- [ ] Load testing

### 6.7. Documentation

- [ ] Update README
- [ ] API documentation (Swagger)
- [ ] Architecture documentation
- [ ] Deployment guide

### 6.8. Deployment

- [ ] Setup production environment
- [ ] Configure CI/CD
- [ ] Database migration strategy
- [ ] Deploy to staging
- [ ] Deploy to production

---

## 7. Best Practices cho NestJS

### 7.1. Project Structure

- Organize theo feature modules
- Mỗi module tự contained với controller, service, repository, DTOs
- Sử dụng common module cho shared resources
- Tách biệt business logic (service) và data access (repository)

### 7.2. Dependency Injection

- Sử dụng constructor injection
- Inject interfaces khi có thể
- Sử dụng `@Injectable()` cho providers
- Sử dụng scoped/transient providers khi cần thiết

### 7.3. Error Handling

- Sử dụng built-in exceptions (BadRequestException, NotFoundException, etc.)
- Tạo custom exceptions khi cần
- Implement global exception filters
- Log errors properly

### 7.4. Validation

- Sử dụng class-validator decorators
- Validate ở DTO level
- Use ValidationPipe globally
- Custom validators khi cần

### 7.5. Security

- Implement JWT authentication properly
- Use Guards for authorization
- Validate and sanitize inputs
- Implement rate limiting
- Use helmet for security headers
- Hash passwords with bcrypt

### 7.6. Performance

- Use caching when appropriate (@nestjs/cache-manager)
- Implement pagination for large datasets
- Use database indexes properly
- Optimize N+1 queries
- Use async/await properly

### 7.7. Testing

- Write unit tests for services
- Write integration tests for controllers
- Use mocks for dependencies
- Achieve good test coverage (>80%)

---

## 8. Common Pitfalls & Solutions

### 8.1. Circular Dependencies

**Problem**: Module A imports Module B, Module B imports Module A

**Solution**:

```typescript
// Use forwardRef
@Module({
  imports: [forwardRef(() => UsersModule)],
})
export class AuthModule {}
```

### 8.2. Database Connection

**Problem**: Sequelize models not loading properly

**Solution**:

```typescript
// Make sure to import models in module
@Module({
  imports: [
    SequelizeModule.forFeature([User, Recipe, Follow]),
  ],
})
```

### 8.3. Validation Not Working

**Problem**: DTOs not validating

**Solution**:

```typescript
// Enable global validation pipe in main.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
  }),
);
```

### 8.4. Guards Not Working

**Problem**: JwtAuthGuard không bắt unauthorized requests

**Solution**:

```typescript
// Ensure JWT Strategy is registered in module
@Module({
  providers: [JwtStrategy],
})
```

---

## 9. Resources & References

### Official Documentation

- [NestJS Documentation](https://docs.nestjs.com/)
- [NestJS Sequelize](https://docs.nestjs.com/techniques/database#sequelize-integration)
- [NestJS Authentication](https://docs.nestjs.com/security/authentication)
- [NestJS Validation](https://docs.nestjs.com/techniques/validation)

### Additional Resources

- [NestJS Best Practices](https://github.com/nestjs/nest/tree/master/sample)
- [Clean Architecture with NestJS](https://dev.to/nestjs)
- [NestJS Testing Guide](https://docs.nestjs.com/fundamentals/testing)

---

## 10. Timeline Estimation

| Phase               | Duration       | Tasks                               |
| ------------------- | -------------- | ----------------------------------- |
| Setup & Planning    | 2-3 days       | Project setup, dependencies, config |
| Core Infrastructure | 3-4 days       | Database, common modules, auth      |
| Users Module        | 2-3 days       | User CRUD, profile, follow system   |
| Recipes Module      | 3-4 days       | Recipe CRUD, feed, likes, saved     |
| Other Modules       | 4-5 days       | Meeting, Audio, Transcript          |
| WebSocket           | 2-3 days       | Socket.IO integration               |
| Testing             | 4-5 days       | Unit, integration, E2E tests        |
| Documentation       | 2-3 days       | API docs, architecture docs         |
| **Total**           | **22-30 days** | **~4-6 weeks**                      |

---

## 11. Support & Next Steps

### Immediate Next Steps

1. Backup dự án hiện tại
2. Tạo NestJS project mới
3. Setup database connection
4. Bắt đầu với Auth module (critical path)

### Need Help?

- NestJS Discord: https://discord.gg/nestjs
- Stack Overflow: Tag `nestjs`
- GitHub Issues: https://github.com/nestjs/nest/issues

---

**Chúc bạn thành công với việc migration sang NestJS! 🚀**

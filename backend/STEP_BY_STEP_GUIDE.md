# Step-by-Step Guide: Migration từ Express sang NestJS

## 📝 Prerequisites

Trước khi bắt đầu, đảm bảo bạn đã:

- [x] Backup toàn bộ code hiện tại
- [x] Đọc qua tài liệu chính (MIGRATION_TO_NESTJS.md)
- [x] Có kiến thức cơ bản về NestJS
- [x] Cài đặt Node.js (v16+) và npm

---

## Phase 1: Setup Project (Day 1-2)

### Step 1.1: Backup Dự Án Hiện Tại

```bash
# Tạo branch backup
git checkout -b backup-express
git add .
git commit -m "Backup before NestJS migration"
git push origin backup-express

# Tạo branch mới cho NestJS
git checkout -b feature/nestjs-migration
```

### Step 1.2: Install NestJS CLI

```bash
# Install globally
npm install -g @nestjs/cli

# Verify installation
nest --version
```

### Step 1.3: Tạo NestJS Project

**Option A: Tạo project mới (Recommended)**

```bash
# Tạo thư mục mới
cd ..
nest new backend-nestjs

# Copy .env và các file config cần thiết
cp backend/.env backend-nestjs/
cp backend/.gitignore backend-nestjs/
```

**Option B: Init trong thư mục hiện tại**

```bash
# Rename thư mục cũ
mv src src-old

# Init NestJS (chọn npm)
nest new . --skip-git --package-manager npm
```

### Step 1.4: Install Dependencies

```bash
cd backend-nestjs  # hoặc cd backend nếu dùng option B

# Database - Sequelize
npm install @nestjs/sequelize sequelize sequelize-typescript mysql2
npm install @types/sequelize --save-dev

# Configuration
npm install @nestjs/config

# Authentication & Security
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install bcryptjs
npm install @types/passport-jwt @types/bcryptjs --save-dev

# Validation
npm install class-validator class-transformer

# Swagger/OpenAPI
npm install @nestjs/swagger swagger-ui-express

# File Upload
npm install @nestjs/platform-express multer
npm install @types/multer --save-dev

# WebSocket
npm install @nestjs/websockets @nestjs/platform-socket.io

# Utilities
npm install uuid
npm install @types/uuid --save-dev
```

### Step 1.5: Setup Environment Configuration

Tạo file `.env`:

```env
# Application
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=dish_gram

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_key_here
JWT_ACCESS_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d

# CORS
CORS_ORIGIN=*
```

Tạo file `src/config/configuration.ts`:

```typescript
export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  database: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "dish_gram",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "secret",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "refresh_secret",
    accessExpiration: process.env.JWT_ACCESS_EXPIRATION || "1h",
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || "7d",
  },
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
  },
});
```

### Step 1.6: Setup Database Module

Tạo `src/database/database.module.ts`:

```typescript
import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        dialect: "mysql",
        host: configService.get("database.host"),
        port: configService.get("database.port"),
        username: configService.get("database.username"),
        password: configService.get("database.password"),
        database: configService.get("database.database"),
        autoLoadModels: true,
        synchronize: false, // Set to false in production
        logging: false,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
```

### Step 1.7: Update Main Entry Point

Update `src/main.ts`:

```typescript
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix for all routes
  app.setGlobalPrefix("api");

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties
      transform: true, // Auto transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle("DishGram API")
    .setDescription("Backend API for DishGram application")
    .setVersion("1.0")
    .addBearerAuth()
    .addTag("Authentication")
    .addTag("Users")
    .addTag("Recipes")
    .addTag("Meetings")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
```

### Step 1.8: Update App Module

Update `src/app.module.ts`:

```typescript
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import configuration from "./config/configuration";
import { DatabaseModule } from "./database/database.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Make config available globally
      load: [configuration],
      envFilePath: ".env",
    }),
    DatabaseModule,
    // Các modules khác sẽ thêm ở đây
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

### Step 1.9: Test Setup

```bash
# Run the application
npm run start:dev

# Nếu thành công, bạn sẽ thấy:
# 🚀 Application is running on: http://localhost:3000
# 📚 Swagger documentation: http://localhost:3000/api/docs
```

Truy cập http://localhost:3000/api/docs để xem Swagger UI

---

## Phase 2: Common Modules (Day 3-4)

### Step 2.1: Create Common Module Structure

```bash
# Tạo common module
nest generate module common

# Tạo các thư mục con
mkdir -p src/common/decorators
mkdir -p src/common/guards
mkdir -p src/common/interceptors
mkdir -p src/common/filters
mkdir -p src/common/pipes
mkdir -p src/common/dto
mkdir -p src/common/interfaces
```

### Step 2.2: Exception Filter

Tạo `src/common/filters/http-exception.filter.ts`:

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = "Internal server error";

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === "string"
          ? exceptionResponse
          : exceptionResponse;
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
    };

    this.logger.error(
      `${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : JSON.stringify(exception),
    );

    response.status(status).json(errorResponse);
  }
}
```

Register trong `main.ts`:

```typescript
import { AllExceptionsFilter } from "./common/filters/http-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ... other config

  app.useGlobalFilters(new AllExceptionsFilter());

  // ...
}
```

### Step 2.3: Logging Interceptor

Tạo `src/common/interceptors/logging.interceptor.ts`:

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body } = request;
    const now = Date.now();

    this.logger.log(`→ ${method} ${url}`);
    if (Object.keys(body).length > 0) {
      this.logger.debug(`Body: ${JSON.stringify(body)}`);
    }

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const delay = Date.now() - now;
          this.logger.log(
            `← ${method} ${url} ${response.statusCode} - ${delay}ms`,
          );
        },
        error: (error) => {
          const delay = Date.now() - now;
          this.logger.error(
            `← ${method} ${url} ERROR - ${delay}ms`,
            error.message,
          );
        },
      }),
    );
  }
}
```

### Step 2.4: Custom Decorators

Tạo `src/common/decorators/get-user.decorator.ts`:

```typescript
import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
```

Tạo `src/common/decorators/public.decorator.ts`:

```typescript
import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "isPublic";
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

### Step 2.5: Pagination DTOs

Tạo `src/common/dto/pagination.dto.ts`:

```typescript
import { IsOptional, IsInt, Min, Max } from "class-validator";
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class PaginationDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
```

---

## Phase 3: Auth Module (Day 5-7)

### Step 3.1: Generate Auth Module

```bash
# Generate module, service, and controller
nest generate module modules/auth
nest generate service modules/auth
nest generate controller modules/auth
```

### Step 3.2: Generate Users Module (cần cho Auth)

```bash
nest generate module modules/users
nest generate service modules/users
nest generate controller modules/users
```

### Step 3.3: Copy & Convert User Model

```bash
# Tạo thư mục entities
mkdir -p src/modules/users/entities

# Copy và convert user.model.ts sang user.entity.ts
# Xem NESTJS_EXAMPLES.md để có code mẫu
```

Tạo `src/modules/users/entities/user.entity.ts` - xem NESTJS_EXAMPLES.md

### Step 3.4: Create Users Repository

Tạo `src/modules/users/users.repository.ts` - xem NESTJS_EXAMPLES.md

### Step 3.5: Update Users Module

Update `src/modules/users/users.module.ts`:

```typescript
import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { UsersRepository } from "./users.repository";
import { User } from "./entities/user.entity";

@Module({
  imports: [SequelizeModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService, UsersRepository], // Export để Auth module có thể dùng
})
export class UsersModule {}
```

### Step 3.6: Create Auth DTOs

```bash
mkdir -p src/modules/auth/dto
```

Tạo các files:

- `register.dto.ts`
- `login.dto.ts`
- `refresh-token.dto.ts`
- `auth-response.dto.ts`

Xem NESTJS_EXAMPLES.md để có code mẫu

### Step 3.7: Create Token Service

Tạo `src/modules/auth/token.service.ts` - xem NESTJS_EXAMPLES.md

### Step 3.8: Create JWT Strategy

```bash
mkdir -p src/modules/auth/strategies
```

Tạo `src/modules/auth/strategies/jwt.strategy.ts` - xem NESTJS_EXAMPLES.md

### Step 3.9: Create JWT Guard

```bash
mkdir -p src/modules/auth/guards
```

Tạo `src/modules/auth/guards/jwt-auth.guard.ts`:

```typescript
import { Injectable, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { IS_PUBLIC_KEY } from "../../../common/decorators/public.decorator";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
```

### Step 3.10: Implement Auth Service

Update `src/modules/auth/auth.service.ts` - xem NESTJS_EXAMPLES.md

### Step 3.11: Implement Auth Controller

Update `src/modules/auth/auth.controller.ts` - xem NESTJS_EXAMPLES.md

### Step 3.12: Update Auth Module

Update `src/modules/auth/auth.module.ts`:

```typescript
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { TokenService } from "./token.service";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get("jwt.secret"),
        signOptions: {
          expiresIn: configService.get("jwt.accessExpiration"),
        },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, TokenService, JwtStrategy],
  exports: [AuthService, TokenService, JwtStrategy, PassportModule],
})
export class AuthModule {}
```

### Step 3.13: Add Auth Module to App Module

Update `src/app.module.ts`:

```typescript
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";

@Module({
  imports: [
    // ... existing imports
    AuthModule,
    UsersModule,
  ],
  // ...
})
export class AppModule {}
```

### Step 3.14: Test Auth Endpoints

```bash
# Start server
npm run start:dev

# Truy cập Swagger
# http://localhost:3000/api/docs

# Test các endpoints:
# POST /api/auth/register
# POST /api/auth/login
# POST /api/auth/refresh
# GET /api/auth/me (with Bearer token)
```

Test với curl hoặc Postman:

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "Password123!"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!"
  }'
```

---

## Phase 4: Tiếp Tục Với Các Module Khác

### Checklist

- [x] **Phase 1-2 Complete**: Setup project và common modules
- [x] **Phase 3 Complete**: Auth module hoạt động đúng
- [ ] **Phase 4**: Users module (follow/unfollow, profile)
- [ ] **Phase 5**: Recipes module
- [ ] **Phase 6**: Meetings, Audio, Transcript modules
- [ ] **Phase 7**: WebSocket
- [ ] **Phase 8**: Testing & Documentation

### Next Steps

1. Implement Users Module hoàn chỉnh
2. Implement Recipes Module
3. Migrate các modules còn lại
4. Testing
5. Documentation

---

## Troubleshooting

### Common Issues

**Issue 1: Database Connection Failed**

```
Solution: Kiểm tra .env file, đảm bảo credentials đúng
```

**Issue 2: Module Not Found**

```bash
# Solution: Clear cache và rebuild
rm -rf dist
npm run build
```

**Issue 3: Validation Not Working**

```typescript
// Solution: Ensure ValidationPipe is enabled in main.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
  }),
);
```

**Issue 4: JWT Not Working**

```
Solution:
1. Check JWT_SECRET in .env
2. Verify JwtStrategy is in providers
3. Check AuthGuard usage
```

---

## Tips & Best Practices

1. **Commit Often**: Commit sau mỗi module hoàn thành
2. **Test Immediately**: Test ngay sau khi implement xong từng feature
3. **Keep Old Code**: Giữ code cũ cho đến khi migration hoàn tất
4. **Document Changes**: Ghi chú những thay đổi quan trọng
5. **Ask for Help**: Tham khảo NestJS Discord/StackOverflow khi gặp khó khăn

---

**Good luck với migration! 🚀**

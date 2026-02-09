# NestJS Code Examples - Chi Tiết Implementation

## Mục Lục

1. [Auth Module - Complete Implementation](#auth-module)
2. [Users Module - Complete Implementation](#users-module)
3. [Recipes Module - Complete Implementation](#recipes-module)
4. [Common Utilities](#common-utilities)

---

## Auth Module

### 1. Cấu trúc thư mục

```
modules/auth/
├── auth.module.ts
├── auth.controller.ts
├── auth.service.ts
├── token.service.ts
├── dto/
│   ├── login.dto.ts
│   ├── register.dto.ts
│   ├── refresh-token.dto.ts
│   └── auth-response.dto.ts
├── strategies/
│   └── jwt.strategy.ts
└── guards/
    └── jwt-auth.guard.ts
```

### 2. DTOs

#### register.dto.ts

```typescript
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RegisterDto {
  @ApiProperty({
    example: "user@example.com",
    description: "User email address",
  })
  @IsEmail({}, { message: "Please provide a valid email" })
  email: string;

  @ApiProperty({
    example: "john_doe",
    description: "Username (3-50 characters)",
    minLength: 3,
    maxLength: 50,
  })
  @IsString()
  @MinLength(3, { message: "Username must be at least 3 characters" })
  @MaxLength(50, { message: "Username must not exceed 50 characters" })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: "Username can only contain letters, numbers and underscores",
  })
  username: string;

  @ApiProperty({
    example: "Password123!",
    description: "Password (minimum 6 characters)",
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: "Password must be at least 6 characters" })
  password: string;

  @ApiProperty({
    example: "John Doe",
    description: "Full name (optional)",
    required: false,
  })
  @IsString()
  @MaxLength(100)
  full_name?: string;
}
```

#### login.dto.ts

```typescript
import { IsEmail, IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
  @ApiProperty({
    example: "user@example.com",
    description: "User email address",
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: "Password123!",
    description: "User password",
  })
  @IsString()
  @MinLength(6)
  password: string;
}
```

#### auth-response.dto.ts

```typescript
import { ApiProperty } from "@nestjs/swagger";

export class UserProfileDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ required: false })
  full_name?: string;

  @ApiProperty({ required: false })
  bio?: string;

  @ApiProperty({ required: false })
  avatar_url?: string;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}

export class AuthResponseDto {
  @ApiProperty()
  access_token: string;

  @ApiProperty()
  refresh_token: string;

  @ApiProperty({ type: UserProfileDto })
  user: UserProfileDto;
}
```

### 3. Token Service

```typescript
// modules/auth/token.service.ts
import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { User } from "../users/entities/user.entity";

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  generateAuthTokens(user: User) {
    const payload = {
      id: user.id,
      email: user.email,
      username: user.username,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get("jwt.secret"),
      expiresIn: this.configService.get("jwt.accessExpiration"),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get("jwt.refreshSecret"),
      expiresIn: this.configService.get("jwt.refreshExpiration"),
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  verifyToken(token: string, type: "access" | "refresh") {
    try {
      const secret =
        type === "access"
          ? this.configService.get("jwt.secret")
          : this.configService.get("jwt.refreshSecret");

      return this.jwtService.verify(token, { secret });
    } catch (error) {
      throw new Error("Invalid token");
    }
  }

  decodeToken(token: string) {
    return this.jwtService.decode(token);
  }
}
```

### 4. JWT Strategy

```typescript
// modules/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { UsersRepository } from "../../users/users.repository";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
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
      throw new UnauthorizedException("User not found");
    }

    // Return user object (will be attached to request.user)
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      full_name: user.full_name,
      bio: user.bio,
      avatar_url: user.avatar_url,
    };
  }
}
```

### 5. Auth Service

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
import { AuthResponseDto, UserProfileDto } from "./dto/auth-response.dto";
import * as bcrypt from "bcryptjs";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly tokenService: TokenService,
  ) {}

  async register(registerDto: RegisterDto): Promise<UserProfileDto> {
    // Check if email exists
    const existingUser = await this.usersRepository.findByEmail(
      registerDto.email,
    );
    if (existingUser) {
      throw new ConflictException("Email already exists");
    }

    // Check if username exists
    const existingUsername = await this.usersRepository.findByUsername(
      registerDto.username,
    );
    if (existingUsername) {
      throw new ConflictException("Username already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create user
    const user = await this.usersRepository.create({
      email: registerDto.email,
      username: registerDto.username,
      password_hash: hashedPassword,
      full_name: registerDto.full_name,
    });

    return this.mapUserToProfile(user);
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    // Find user by email
    const user = await this.usersRepository.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password_hash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Generate tokens
    const tokens = this.tokenService.generateAuthTokens(user);

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      user: this.mapUserToProfile(user),
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    try {
      // Verify refresh token
      const decoded = this.tokenService.verifyToken(refreshToken, "refresh");

      // Get user
      const user = await this.usersRepository.findById(decoded.id);
      if (!user) {
        throw new UnauthorizedException("User not found");
      }

      // Generate new tokens
      const tokens = this.tokenService.generateAuthTokens(user);

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        user: this.mapUserToProfile(user),
      };
    } catch (error) {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  async validateUser(userId: number): Promise<UserProfileDto> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException("User not found");
    }
    return this.mapUserToProfile(user);
  }

  private mapUserToProfile(user: any): UserProfileDto {
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

### 6. Auth Controller

```typescript
// modules/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { AuthResponseDto, UserProfileDto } from "./dto/auth-response.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @ApiOperation({ summary: "Register a new user" })
  @ApiResponse({
    status: 201,
    description: "User registered successfully",
    type: UserProfileDto,
  })
  @ApiResponse({ status: 409, description: "Email or username already exists" })
  @ApiResponse({ status: 400, description: "Validation error" })
  async register(@Body() registerDto: RegisterDto): Promise<UserProfileDto> {
    return this.authService.register(registerDto);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Login user and get tokens" })
  @ApiResponse({
    status: 200,
    description: "Login successful",
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Refresh access token using refresh token" })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: "Tokens refreshed successfully",
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: "Invalid refresh token" })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<AuthResponseDto> {
    return this.authService.refreshToken(refreshTokenDto.refresh_token);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user profile" })
  @ApiResponse({
    status: 200,
    description: "Current user profile",
    type: UserProfileDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getProfile(@Req() req): Promise<UserProfileDto> {
    return req.user;
  }
}
```

### 7. Auth Module

```typescript
// modules/auth/auth.module.ts
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

---

## Users Module

### 1. User Entity

```typescript
// modules/users/entities/user.entity.ts
import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  BelongsToMany,
  CreatedAt,
  UpdatedAt,
} from "sequelize-typescript";
import { Follow } from "./follow.entity";
import { Recipe } from "../../recipes/entities/recipe.entity";

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
  full_name: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  bio: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  avatar_url: string;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  created_at: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  updated_at: Date;

  // Associations
  @HasMany(() => Recipe)
  recipes: Recipe[];

  @BelongsToMany(() => User, () => Follow, "follower_id", "following_id")
  following: User[];

  @BelongsToMany(() => User, () => Follow, "following_id", "follower_id")
  followers: User[];

  // Instance methods
  toJSON() {
    const values = { ...this.get() };
    delete values.password_hash;
    return values;
  }
}
```

### 2. Follow Entity

```typescript
// modules/users/entities/follow.entity.ts
import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  CreatedAt,
} from "sequelize-typescript";
import { User } from "./user.entity";

@Table({
  tableName: "follows",
  timestamps: true,
  underscored: true,
  updatedAt: false,
})
export class Follow extends Model<Follow> {
  @Column({
    type: DataType.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER.UNSIGNED,
    allowNull: false,
  })
  follower_id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER.UNSIGNED,
    allowNull: false,
  })
  following_id: number;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  created_at: Date;

  // Associations
  @BelongsTo(() => User, "follower_id")
  follower: User;

  @BelongsTo(() => User, "following_id")
  following_user: User;
}
```

### 3. Users Repository

```typescript
// modules/users/users.repository.ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { User } from "./entities/user.entity";
import { Follow } from "./entities/follow.entity";
import { Op } from "sequelize";

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(Follow)
    private followModel: typeof Follow,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    return this.userModel.create(userData as any);
  }

  async findById(id: number): Promise<User | null> {
    return this.userModel.findByPk(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userModel.findOne({ where: { username } });
  }

  async update(id: number, userData: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    await user.update(userData);
    return user;
  }

  async delete(id: number): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    await user.destroy();
  }

  async searchUsers(query: string, limit = 20): Promise<User[]> {
    return this.userModel.findAll({
      where: {
        [Op.or]: [
          { username: { [Op.like]: `%${query}%` } },
          { full_name: { [Op.like]: `%${query}%` } },
        ],
      },
      limit,
    });
  }

  // Follow/Unfollow methods
  async followUser(followerId: number, followingId: number): Promise<void> {
    // Check if already following
    const existing = await this.followModel.findOne({
      where: { follower_id: followerId, following_id: followingId },
    });

    if (!existing) {
      await this.followModel.create({
        follower_id: followerId,
        following_id: followingId,
      } as any);
    }
  }

  async unfollowUser(followerId: number, followingId: number): Promise<void> {
    await this.followModel.destroy({
      where: { follower_id: followerId, following_id: followingId },
    });
  }

  async isFollowing(followerId: number, followingId: number): Promise<boolean> {
    const follow = await this.followModel.findOne({
      where: { follower_id: followerId, following_id: followingId },
    });
    return !!follow;
  }

  async getFollowers(userId: number, limit = 50): Promise<User[]> {
    const follows = await this.followModel.findAll({
      where: { following_id: userId },
      include: [{ model: User, as: "follower" }],
      limit,
    });

    return follows.map((f) => f.follower);
  }

  async getFollowing(userId: number, limit = 50): Promise<User[]> {
    const follows = await this.followModel.findAll({
      where: { follower_id: userId },
      include: [{ model: User, as: "following_user" }],
      limit,
    });

    return follows.map((f) => f.following_user);
  }

  async getFollowersCount(userId: number): Promise<number> {
    return this.followModel.count({
      where: { following_id: userId },
    });
  }

  async getFollowingCount(userId: number): Promise<number> {
    return this.followModel.count({
      where: { follower_id: userId },
    });
  }
}
```

### 4. Users Service

```typescript
// modules/users/users.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { UsersRepository } from "./users.repository";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { UserProfileResponseDto } from "./dto/user-profile-response.dto";

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getUserProfile(userId: number): Promise<UserProfileResponseDto> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const followersCount = await this.usersRepository.getFollowersCount(userId);
    const followingCount = await this.usersRepository.getFollowingCount(userId);

    return {
      ...user.toJSON(),
      followers_count: followersCount,
      following_count: followingCount,
      recipes_count: 0, // TODO: Get from recipes
    };
  }

  async updateProfile(
    userId: number,
    updateProfileDto: UpdateProfileDto,
  ): Promise<UserProfileResponseDto> {
    // Check if username is taken by another user
    if (updateProfileDto.username) {
      const existingUser = await this.usersRepository.findByUsername(
        updateProfileDto.username,
      );
      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException("Username already taken");
      }
    }

    const user = await this.usersRepository.update(userId, updateProfileDto);
    return this.getUserProfile(user.id);
  }

  async followUser(
    followerId: number,
    followingId: number,
  ): Promise<{ message: string }> {
    if (followerId === followingId) {
      throw new BadRequestException("Cannot follow yourself");
    }

    const userToFollow = await this.usersRepository.findById(followingId);
    if (!userToFollow) {
      throw new NotFoundException("User not found");
    }

    await this.usersRepository.followUser(followerId, followingId);
    return { message: "User followed successfully" };
  }

  async unfollowUser(
    followerId: number,
    followingId: number,
  ): Promise<{ message: string }> {
    if (followerId === followingId) {
      throw new BadRequestException("Cannot unfollow yourself");
    }

    await this.usersRepository.unfollowUser(followerId, followingId);
    return { message: "User unfollowed successfully" };
  }

  async getFollowers(userId: number) {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const followers = await this.usersRepository.getFollowers(userId);
    return followers.map((u) => u.toJSON());
  }

  async getFollowing(userId: number) {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const following = await this.usersRepository.getFollowing(userId);
    return following.map((u) => u.toJSON());
  }

  async searchUsers(query: string) {
    const users = await this.usersRepository.searchUsers(query);
    return users.map((u) => u.toJSON());
  }
}
```

### 5. Users Controller

```typescript
// modules/users/users.controller.ts
import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  ParseIntPipe,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { UserProfileResponseDto } from "./dto/user-profile-response.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("Users")
@Controller("users")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("profile")
  @ApiOperation({ summary: "Get current user profile" })
  @ApiResponse({ status: 200, type: UserProfileResponseDto })
  async getCurrentUserProfile(@Req() req) {
    return this.usersService.getUserProfile(req.user.id);
  }

  @Get("search")
  @ApiOperation({ summary: "Search users by username or name" })
  @ApiQuery({ name: "q", required: true, description: "Search query" })
  @ApiResponse({ status: 200, type: [UserProfileResponseDto] })
  async searchUsers(@Query("q") query: string) {
    return this.usersService.searchUsers(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get user profile by ID" })
  @ApiParam({ name: "id", description: "User ID" })
  @ApiResponse({ status: 200, type: UserProfileResponseDto })
  @ApiResponse({ status: 404, description: "User not found" })
  async getUserProfile(@Param("id", ParseIntPipe) id: number) {
    return this.usersService.getUserProfile(id);
  }

  @Put("profile")
  @ApiOperation({ summary: "Update current user profile" })
  @ApiResponse({ status: 200, type: UserProfileResponseDto })
  async updateProfile(@Req() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.id, updateProfileDto);
  }

  @Post(":id/follow")
  @ApiOperation({ summary: "Follow a user" })
  @ApiParam({ name: "id", description: "User ID to follow" })
  @ApiResponse({ status: 200, description: "User followed successfully" })
  async followUser(@Req() req, @Param("id", ParseIntPipe) followingId: number) {
    return this.usersService.followUser(req.user.id, followingId);
  }

  @Delete(":id/follow")
  @ApiOperation({ summary: "Unfollow a user" })
  @ApiParam({ name: "id", description: "User ID to unfollow" })
  @ApiResponse({ status: 200, description: "User unfollowed successfully" })
  async unfollowUser(
    @Req() req,
    @Param("id", ParseIntPipe) followingId: number,
  ) {
    return this.usersService.unfollowUser(req.user.id, followingId);
  }

  @Get(":id/followers")
  @ApiOperation({ summary: "Get user followers" })
  @ApiParam({ name: "id", description: "User ID" })
  @ApiResponse({ status: 200, type: [UserProfileResponseDto] })
  async getFollowers(@Param("id", ParseIntPipe) userId: number) {
    return this.usersService.getFollowers(userId);
  }

  @Get(":id/following")
  @ApiOperation({ summary: "Get users that user is following" })
  @ApiParam({ name: "id", description: "User ID" })
  @ApiResponse({ status: 200, type: [UserProfileResponseDto] })
  async getFollowing(@Param("id", ParseIntPipe) userId: number) {
    return this.usersService.getFollowing(userId);
  }
}
```

### 6. Users Module

```typescript
// modules/users/users.module.ts
import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { UsersRepository } from "./users.repository";
import { User } from "./entities/user.entity";
import { Follow } from "./entities/follow.entity";

@Module({
  imports: [SequelizeModule.forFeature([User, Follow])],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
```

---

## Common Utilities

### 1. Pagination DTO

```typescript
// common/dto/pagination.dto.ts
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

export class PaginatedResponseDto<T> {
  @ApiPropertyOptional()
  data: T[];

  @ApiPropertyOptional()
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### 2. Response Interceptor

```typescript
// common/interceptors/transform.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

export interface Response<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  Response<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => ({
        statusCode: context.switchToHttp().getResponse().statusCode,
        message: "Success",
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
```

### 3. Logging Interceptor

```typescript
// common/interceptors/logging.interceptor.ts
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
    const { method, url } = request;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const delay = Date.now() - now;
        this.logger.log(`${method} ${url} ${response.statusCode} - ${delay}ms`);
      }),
    );
  }
}
```

### 4. Custom Decorator - Get User

```typescript
// common/decorators/get-user.decorator.ts
import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);

// Usage in controller:
// @Get('profile')
// getProfile(@GetUser() user: any) { return user; }
//
// @Get('email')
// getEmail(@GetUser('email') email: string) { return email; }
```

---

**Tiếp theo, bạn có thể tham khảo thêm các example khác trong tài liệu chính!**

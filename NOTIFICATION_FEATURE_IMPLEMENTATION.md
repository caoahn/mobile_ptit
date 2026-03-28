# TÍNH NĂNG THÔNG BÁO (NOTIFICATION) - LIKE & COMMENT

## 📋 TỔNG QUAN

Tài liệu này hướng dẫn chi tiết cách triển khai tính năng thông báo realtime khi người dùng khác thả tim (like) hoặc bình luận (comment) vào bài viết của mình.

### Các tính năng chính:

- ✅ Thông báo realtime khi có người like bài viết
- ✅ Thông báo realtime khi có người comment vào bài viết
- ✅ Đánh dấu đã đọc/chưa đọc
- ✅ Danh sách thông báo phân trang
- ✅ Socket.IO cho realtime updates
- ✅ Badge hiển thị số thông báo chưa đọc

---

## 🏗️ KIẾN TRÚC TỔNG QUAN

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React Native)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Notification │→ │ Notification │→ │ Socket.IO    │      │
│  │ UI Component │  │    Store     │  │    Client    │      │
│  └──────────────┘  └──────────────┘  └──────┬───────┘      │
└──────────────────────────────────────────────┼──────────────┘
                                               │
                         Socket Events         │ HTTP/REST
                                               │
┌──────────────────────────────────────────────┼──────────────┐
│                     BACKEND (Node.js)        ▼              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Notification │→ │ Notification │→ │ Notification │      │
│  │  Controller  │  │   Service    │  │  Repository  │      │
│  └──────────────┘  └──────┬───────┘  └──────────────┘      │
│                           │                                 │
│  ┌──────────────┐  ┌──────▼───────┐                        │
│  │ Socket.IO    │← │   Recipe     │                        │
│  │   Gateway    │  │   Service    │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                           │
                    ┌──────▼───────┐
                    │   DATABASE   │
                    │  (MySQL)     │
                    └──────────────┘
```

---

## 📦 PHẦN 1: BACKEND IMPLEMENTATION

### 1.1. Cấu Trúc Files Cần Tạo/Sửa

```
backend/src/
├── interfaces/
│   ├── repositories/
│   │   └── notification.repository.ts        # [MỚI] Interface
│   └── services/
│       └── notification.service.ts           # [MỚI] Interface
├── repositories/
│   └── notification.repository.ts            # [MỚI] Implementation
├── services/
│   ├── notification.service.ts               # [MỚI] Service
│   ├── recipe.service.ts                     # [SỬA] Thêm logic tạo notification
│   └── socket.service.ts                     # [SỬA] Thêm notification events
├── controllers/
│   └── notification.controller.ts            # [MỚI] Controller
├── routes/
│   ├── notification.route.ts                 # [MỚI] Routes
│   └── index.ts                              # [SỬA] Import notification routes
├── dto/
│   └── notification/
│       ├── notification.response.ts          # [MỚI] Response DTOs
│       └── notification-list.response.ts     # [MỚI] List response DTO
├── container/
│   └── index.ts                              # [SỬA] Register notification dependencies
├── app.ts                                    # [SỬA] Setup Socket.IO
└── server.ts                                 # [SỬA] Init Socket.IO
```

---

### 1.2. Database Schema

Model `Notification` đã tồn tại tại `models/notification.model.ts`:

```typescript
export interface NotificationAttributes {
  id: number;
  user_id: number; // Người nhận thông báo
  type: "like" | "comment" | "follow" | "rating";
  actor_id: number; // Người thực hiện hành động
  recipe_id?: number; // Bài viết liên quan
  comment_id?: number; // Comment liên quan (nếu type = comment)
  is_read: boolean; // Đã đọc hay chưa
  created_at?: Date;
}
```

**Lưu ý:** Model này đã được định nghĩa sẵn, không cần tạo mới.

---

### 1.3. Interface Definitions

#### 📄 `interfaces/repositories/notification.repository.ts` [MỚI]

```typescript
import {
  Notification,
  NotificationCreationAttributes,
} from "../../models/notification.model";

export interface INotificationRepository {
  /**
   * Tạo thông báo mới
   */
  create(data: NotificationCreationAttributes): Promise<Notification>;

  /**
   * Lấy danh sách thông báo của user (có phân trang)
   */
  findByUserId(
    userId: number,
    page: number,
    limit: number,
  ): Promise<{ rows: Notification[]; count: number }>;

  /**
   * Đánh dấu thông báo đã đọc
   */
  markAsRead(notificationId: number, userId: number): Promise<boolean>;

  /**
   * Đánh dấu tất cả thông báo đã đọc
   */
  markAllAsRead(userId: number): Promise<number>;

  /**
   * Đếm số thông báo chưa đọc
   */
  countUnread(userId: number): Promise<number>;

  /**
   * Xóa thông báo
   */
  delete(notificationId: number, userId: number): Promise<boolean>;
}
```

#### 📄 `interfaces/services/notification.service.ts` [MỚI]

```typescript
import {
  NotificationResponse,
  NotificationListResponse,
} from "../../dto/notification/notification.response";

export interface INotificationService {
  /**
   * Tạo thông báo mới (internal use)
   */
  createNotification(
    userId: number,
    type: "like" | "comment" | "follow" | "rating",
    actorId: number,
    recipeId?: number,
    commentId?: number,
  ): Promise<void>;

  /**
   * Lấy danh sách thông báo
   */
  getUserNotifications(
    userId: number,
    page: number,
    limit: number,
  ): Promise<NotificationListResponse>;

  /**
   * Đánh dấu đã đọc
   */
  markAsRead(notificationId: number, userId: number): Promise<boolean>;

  /**
   * Đánh dấu tất cả đã đọc
   */
  markAllAsRead(userId: number): Promise<number>;

  /**
   * Đếm thông báo chưa đọc
   */
  getUnreadCount(userId: number): Promise<number>;

  /**
   * Xóa thông báo
   */
  deleteNotification(notificationId: number, userId: number): Promise<boolean>;
}
```

---

### 1.4. DTOs (Data Transfer Objects)

#### 📄 `dto/notification/notification.response.ts` [MỚI]

```typescript
export interface NotificationResponse {
  id: number;
  type: "like" | "comment" | "follow" | "rating";
  is_read: boolean;
  created_at: Date;

  // Thông tin người thực hiện
  actor: {
    id: number;
    username: string;
    avatar_url?: string;
  };

  // Thông tin bài viết (nếu có)
  recipe?: {
    id: number;
    title: string;
    image_url?: string;
  };

  // Thông tin comment (nếu type = comment)
  comment?: {
    id: number;
    content: string;
  };
}

export interface NotificationListResponse {
  notifications: NotificationResponse[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  unread_count: number;
}
```

---

### 1.5. Repository Implementation

#### 📄 `repositories/notification.repository.ts` [MỚI]

```typescript
import { INotificationRepository } from "../interfaces/repositories/notification.repository";
import {
  Notification,
  NotificationCreationAttributes,
} from "../models/notification.model";
import { User } from "../models/user.model";
import { Recipe } from "../models/recipe.model";
import { Comment } from "../models/comment.model";

export class NotificationRepository implements INotificationRepository {
  async create(data: NotificationCreationAttributes): Promise<Notification> {
    return await Notification.create(data);
  }

  async findByUserId(
    userId: number,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ rows: Notification[]; count: number }> {
    const offset = (page - 1) * limit;

    const { rows, count } = await Notification.findAndCountAll({
      where: { user_id: userId },
      include: [
        {
          model: User,
          as: "actor",
          attributes: ["id", "username", "avatar_url"],
        },
        {
          model: Recipe,
          as: "recipe",
          attributes: ["id", "title", "image_url"],
          required: false,
        },
        {
          model: Comment,
          as: "comment",
          attributes: ["id", "content"],
          required: false,
        },
      ],
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    return { rows, count };
  }

  async markAsRead(notificationId: number, userId: number): Promise<boolean> {
    const [affectedCount] = await Notification.update(
      { is_read: true },
      {
        where: {
          id: notificationId,
          user_id: userId,
        },
      },
    );
    return affectedCount > 0;
  }

  async markAllAsRead(userId: number): Promise<number> {
    const [affectedCount] = await Notification.update(
      { is_read: true },
      {
        where: {
          user_id: userId,
          is_read: false,
        },
      },
    );
    return affectedCount;
  }

  async countUnread(userId: number): Promise<number> {
    return await Notification.count({
      where: {
        user_id: userId,
        is_read: false,
      },
    });
  }

  async delete(notificationId: number, userId: number): Promise<boolean> {
    const deleted = await Notification.destroy({
      where: {
        id: notificationId,
        user_id: userId,
      },
    });
    return deleted > 0;
  }
}
```

---

### 1.6. Service Implementation

#### 📄 `services/notification.service.ts` [MỚI]

```typescript
import { INotificationService } from "../interfaces/services/notification.service";
import { INotificationRepository } from "../interfaces/repositories/notification.repository";
import {
  NotificationResponse,
  NotificationListResponse,
} from "../dto/notification/notification.response";
import { ISocketService } from "../interfaces/services/socket.service";

export class NotificationService implements INotificationService {
  constructor(
    private readonly notificationRepository: INotificationRepository,
    private readonly socketService: ISocketService,
  ) {}

  async createNotification(
    userId: number,
    type: "like" | "comment" | "follow" | "rating",
    actorId: number,
    recipeId?: number,
    commentId?: number,
  ): Promise<void> {
    // Không tạo notification nếu user tự like/comment bài viết của mình
    if (userId === actorId) {
      return;
    }

    // Tạo notification trong database
    const notification = await this.notificationRepository.create({
      user_id: userId,
      type,
      actor_id: actorId,
      recipe_id: recipeId,
      comment_id: commentId,
      is_read: false,
    });

    // Emit realtime notification qua Socket.IO
    const notificationData = await this.getNotificationById(notification.id);
    if (notificationData) {
      this.socketService.emitToUser(
        userId,
        "new_notification",
        notificationData,
      );
    }
  }

  private async getNotificationById(
    id: number,
  ): Promise<NotificationResponse | null> {
    const notification = await this.notificationRepository.findByUserId(
      id,
      1,
      1,
    );
    if (notification.rows.length === 0) return null;

    return this.toDTO(notification.rows[0]);
  }

  async getUserNotifications(
    userId: number,
    page: number = 1,
    limit: number = 20,
  ): Promise<NotificationListResponse> {
    const { rows, count } = await this.notificationRepository.findByUserId(
      userId,
      page,
      limit,
    );

    const unread_count = await this.notificationRepository.countUnread(userId);

    const notifications = rows.map((n) => this.toDTO(n));

    return {
      notifications,
      total: count,
      page,
      limit,
      hasMore: page * limit < count,
      unread_count,
    };
  }

  async markAsRead(notificationId: number, userId: number): Promise<boolean> {
    return await this.notificationRepository.markAsRead(notificationId, userId);
  }

  async markAllAsRead(userId: number): Promise<number> {
    return await this.notificationRepository.markAllAsRead(userId);
  }

  async getUnreadCount(userId: number): Promise<number> {
    return await this.notificationRepository.countUnread(userId);
  }

  async deleteNotification(
    notificationId: number,
    userId: number,
  ): Promise<boolean> {
    return await this.notificationRepository.delete(notificationId, userId);
  }

  private toDTO(notification: any): NotificationResponse {
    const raw = notification.toJSON ? notification.toJSON() : notification;

    return {
      id: raw.id,
      type: raw.type,
      is_read: raw.is_read,
      created_at: raw.created_at,
      actor: {
        id: raw.actor?.id,
        username: raw.actor?.username,
        avatar_url: raw.actor?.avatar_url,
      },
      recipe: raw.recipe
        ? {
            id: raw.recipe.id,
            title: raw.recipe.title,
            image_url: raw.recipe.image_url,
          }
        : undefined,
      comment: raw.comment
        ? {
            id: raw.comment.id,
            content: raw.comment.content,
          }
        : undefined,
    };
  }
}
```

---

### 1.7. Update RecipeService

#### 📄 `services/recipe.service.ts` [SỬA]

Thêm logic tạo notification khi có like/comment:

```typescript
import { INotificationService } from "../interfaces/services/notification.service";

export class RecipeService implements IRecipeService {
  constructor(
    private readonly recipeRepository: IRecipeRepository,
    private readonly notificationService: INotificationService, // THÊM
  ) {}

  // ... existing code ...

  async toggleLike(userId: number, recipeId: number): Promise<boolean> {
    try {
      await this.recipeRepository.likeRecipe(userId, recipeId);

      // TẠO NOTIFICATION KHI LIKE
      const recipe = await this.recipeRepository.findById(recipeId);
      if (recipe) {
        await this.notificationService.createNotification(
          recipe.user_id, // Người nhận (chủ bài viết)
          "like",
          userId, // Người thực hiện (người like)
          recipeId,
        );
      }

      return true;
    } catch (e) {
      await this.recipeRepository.unlikeRecipe(userId, recipeId);
      return false;
    }
  }

  async createComment(
    userId: number,
    recipeId: number,
    data: { content: string; parent_comment_id?: number },
  ): Promise<CommentResponse> {
    const comment = await Comment.create({
      user_id: userId,
      recipe_id: recipeId,
      content: data.content,
      parent_comment_id: data.parent_comment_id,
    });

    // TẠO NOTIFICATION KHI COMMENT
    const recipe = await this.recipeRepository.findById(recipeId);
    if (recipe) {
      await this.notificationService.createNotification(
        recipe.user_id, // Người nhận
        "comment",
        userId, // Người comment
        recipeId,
        comment.id,
      );
    }

    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [
        {
          model: sequelize.models.User,
          as: "user",
          attributes: ["id", "username", "avatar_url"],
        },
      ],
    });

    const raw = commentWithUser?.toJSON() as any;

    return {
      id: raw.id,
      content: raw.content,
      user: {
        id: raw.user.id,
        username: raw.user.username,
        avatar_url: raw.user.avatar_url,
      },
      parent_comment_id: raw.parent_comment_id,
      created_at: raw.created_at,
      replies: [],
    };
  }
}
```

---

### 1.8. Update SocketService

#### 📄 `services/socket.service.ts` [SỬA]

Thêm method để emit notification đến user cụ thể:

```typescript
import { Server as SocketIOServer, Socket } from "socket.io";
import { ISocketService } from "../interfaces/services/socket.service";

export class SocketService implements ISocketService {
  private io: SocketIOServer | null = null;
  private userSockets: Map<number, string[]> = new Map(); // userId -> [socketIds]

  init(server: any) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    this.io.on("connection", (socket: Socket) => {
      console.log("User connected:", socket.id);

      // User join với userId
      socket.on("join", ({ userId }: { userId: number }) => {
        console.log(`User ${userId} joined with socket ${socket.id}`);

        // Lưu mapping userId -> socketId
        const sockets = this.userSockets.get(userId) || [];
        sockets.push(socket.id);
        this.userSockets.set(userId, sockets);

        // Join vào room của user
        socket.join(`user_${userId}`);
      });

      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);

        // Xóa socket khỏi mapping
        this.userSockets.forEach((sockets, userId) => {
          const index = sockets.indexOf(socket.id);
          if (index > -1) {
            sockets.splice(index, 1);
            if (sockets.length === 0) {
              this.userSockets.delete(userId);
            } else {
              this.userSockets.set(userId, sockets);
            }
          }
        });
      });
    });
  }

  /**
   * Emit notification đến user cụ thể
   */
  emitToUser(userId: number, event: string, data: any): void {
    if (this.io) {
      this.io.to(`user_${userId}`).emit(event, data);
      console.log(`Emitted ${event} to user ${userId}:`, data);
    }
  }

  broadcastTranscript(meetingId: string, transcript: any) {
    if (this.io) {
      this.io.to(meetingId).emit("new_transcript", transcript);
    }
  }
}
```

#### 📄 `interfaces/services/socket.service.ts` [SỬA]

```typescript
export interface ISocketService {
  init(server: any): void;
  broadcastTranscript(meetingId: string, transcript: any): void;
  emitToUser(userId: number, event: string, data: any): void; // THÊM
}
```

---

### 1.9. Controller

#### 📄 `controllers/notification.controller.ts` [MỚI]

```typescript
import { Request, Response, NextFunction } from "express";
import { INotificationService } from "../interfaces/services/notification.service";
import { sendSuccess } from "../utils/response";

export class NotificationController {
  constructor(private readonly notificationService: INotificationService) {}

  /**
   * GET /api/notifications
   * Lấy danh sách thông báo
   */
  getNotifications = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = (req as any).user.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await this.notificationService.getUserNotifications(
        userId,
        page,
        limit,
      );

      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/notifications/unread-count
   * Đếm số thông báo chưa đọc
   */
  getUnreadCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const count = await this.notificationService.getUnreadCount(userId);

      sendSuccess(res, { count });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/notifications/:id/read
   * Đánh dấu đã đọc
   */
  markAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const notificationId = parseInt(req.params.id);

      const success = await this.notificationService.markAsRead(
        notificationId,
        userId,
      );

      if (!success) {
        return res.status(404).json({ message: "Notification not found" });
      }

      sendSuccess(res, { message: "Marked as read" });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/notifications/read-all
   * Đánh dấu tất cả đã đọc
   */
  markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const count = await this.notificationService.markAllAsRead(userId);

      sendSuccess(res, { message: `Marked ${count} notifications as read` });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/notifications/:id
   * Xóa thông báo
   */
  deleteNotification = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = (req as any).user.id;
      const notificationId = parseInt(req.params.id);

      const success = await this.notificationService.deleteNotification(
        notificationId,
        userId,
      );

      if (!success) {
        return res.status(404).json({ message: "Notification not found" });
      }

      sendSuccess(res, { message: "Notification deleted" });
    } catch (error) {
      next(error);
    }
  };
}
```

---

### 1.10. Routes

#### 📄 `routes/notification.route.ts` [MỚI]

```typescript
import { Router } from "express";
import container from "../container";
import { authMiddleware } from "../middlewares/auth.middleware";
import { NotificationController } from "../controllers/notification.controller";

const router = Router();
const notificationController = container.resolve<NotificationController>(
  "notificationController",
);

// Tất cả routes đều cần authentication
router.use(authMiddleware);

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get user notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of notifications
 */
router.get("/", notificationController.getNotifications);

/**
 * @swagger
 * /notifications/unread-count:
 *   get:
 *     summary: Get unread notification count
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count
 */
router.get("/unread-count", notificationController.getUnreadCount);

/**
 * @swagger
 * /notifications/read-all:
 *   put:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All marked as read
 */
router.put("/read-all", notificationController.markAllAsRead);

/**
 * @swagger
 * /notifications/{id}/read:
 *   put:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Marked as read
 */
router.put("/:id/read", notificationController.markAsRead);

/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     summary: Delete notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Notification deleted
 */
router.delete("/:id", notificationController.deleteNotification);

export default router;
```

#### 📄 `routes/index.ts` [SỬA]

```typescript
import { Router } from "express";
import authRoute from "./auth.route";
import userRoute from "./user.route";
import recipeRoute from "./recipe.routes";
import utilRoute from "./util.routes";
import uploadRoute from "./upload.route";
import notificationRoute from "./notification.route"; // THÊM

const router = Router();

router.use("/auth", authRoute);
router.use("/users", userRoute);
router.use("/recipes", recipeRoute);
router.use("/upload", uploadRoute);
router.use("/notifications", notificationRoute); // THÊM
router.use("/", utilRoute);

export default router;
```

---

### 1.11. Dependency Injection

#### 📄 `container/index.ts` [SỬA]

```typescript
import { createContainer, asClass, InjectionMode } from "awilix";

// Repositories
import { UserRepository } from "../repositories/user.repository";
import { TokenRepository } from "../repositories/token.repository";
import { RecipeRepository } from "../repositories/recipe.repository";
import { NotificationRepository } from "../repositories/notification.repository"; // THÊM

// Services
import { UserService } from "../services/user.service";
import { AuthService } from "../services/auth.service";
import { TokenService } from "../services/token.service";
import { SocketService } from "../services/socket.service";
import { RecipeService } from "../services/recipe.service";
import { AIService } from "../services/ai.service";
import { CloudinaryService } from "../services/cloudinary.service";
import { NotificationService } from "../services/notification.service"; // THÊM

// Controllers
import { UserController } from "../controllers/user.controller";
import { AuthController } from "../controllers/auth.controller";
import { HealthController } from "../controllers/health.controller";
import { RecipeController } from "../controllers/recipe.controller";
import { UtilController } from "../controllers/util.controller";
import { UploadController } from "../controllers/upload.controller";
import { NotificationController } from "../controllers/notification.controller"; // THÊM

const container = createContainer({
  injectionMode: InjectionMode.CLASSIC,
});

container.register({
  // Repositories
  userRepository: asClass(UserRepository).scoped(),
  tokenRepository: asClass(TokenRepository).scoped(),
  recipeRepository: asClass(RecipeRepository).scoped(),
  notificationRepository: asClass(NotificationRepository).scoped(), // THÊM

  // Services
  userService: asClass(UserService).scoped(),
  tokenService: asClass(TokenService).scoped(),
  authService: asClass(AuthService).scoped(),
  socketService: asClass(SocketService).singleton(),
  recipeService: asClass(RecipeService).scoped(),
  aiService: asClass(AIService).scoped(),
  cloudinaryService: asClass(CloudinaryService).scoped(),
  notificationService: asClass(NotificationService).scoped(), // THÊM

  // Controllers
  userController: asClass(UserController).scoped(),
  authController: asClass(AuthController).scoped(),
  recipeController: asClass(RecipeController).scoped(),
  healthController: asClass(HealthController).scoped(),
  utilController: asClass(UtilController).scoped(),
  uploadController: asClass(UploadController).scoped(),
  notificationController: asClass(NotificationController).scoped(), // THÊM
});

export default container;
```

---

### 1.12. Setup Socket.IO Server

#### 📄 `server.ts` [SỬA]

```typescript
import { createServer } from "http"; // THÊM
import app from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { connectDB } from "./config/database";
import container from "./container"; // THÊM
import { SocketService } from "./services/socket.service"; // THÊM

const startServer = async () => {
  await connectDB();

  // TẠO HTTP SERVER
  const httpServer = createServer(app);

  // INIT SOCKET.IO
  const socketService = container.resolve<SocketService>("socketService");
  socketService.init(httpServer);

  // LISTEN
  httpServer.listen(Number(env.port), "0.0.0.0", () => {
    logger.info(`Server is running in ${env.nodeEnv} mode on port ${env.port}`);
    logger.info(
      `Swagger documentation available at http://localhost:${env.port}/api`,
    );
    logger.info(`Socket.IO server is ready`);
  });
};

startServer();
```

---

### 1.13. Setup Database Relationships

#### 📄 `models/index.ts` [SỬA]

Thêm relationships cho Notification model:

```typescript
import { User } from "./user.model";
import { Recipe } from "./recipe.model";
import { Comment } from "./comment.model";
import { Notification } from "./notification.model";
import { Like } from "./like.model";
// ... other imports

// ... existing relationships ...

// Notification relationships
Notification.belongsTo(User, {
  foreignKey: "actor_id",
  as: "actor",
});

Notification.belongsTo(Recipe, {
  foreignKey: "recipe_id",
  as: "recipe",
});

Notification.belongsTo(Comment, {
  foreignKey: "comment_id",
  as: "comment",
});

User.hasMany(Notification, {
  foreignKey: "user_id",
  as: "notifications",
});

export {
  User,
  Recipe,
  Comment,
  Notification,
  Like,
  // ... other exports
};
```

---

## 📱 PHẦN 2: FRONTEND IMPLEMENTATION

### 2.1. Cấu Trúc Files Cần Tạo/Sửa

```
my-app/src/
├── features/
│   └── notification/
│       ├── index.ts
│       ├── components/
│       │   ├── NotificationBadge.tsx         # [MỚI] Badge số thông báo
│       │   ├── NotificationItem.tsx          # [MỚI] Item trong list
│       │   └── NotificationList.tsx          # [MỚI] Danh sách thông báo
│       ├── services/
│       │   └── notificationService.ts        # [MỚI] API calls
│       ├── store/
│       │   └── notificationStore.ts          # [MỚI] Zustand store
│       └── types/
│           └── notification.types.ts         # [MỚI] TypeScript types
├── shared/
│   └── services/
│       └── socket/
│           ├── socketClient.ts               # [MỚI] Socket.IO client
│           └── index.ts                      # [MỚI] Export
└── app/
    └── (tabs)/
        └── notifications.tsx                 # [MỚI] Notification screen
```

---

### 2.2. Types

#### 📄 `features/notification/types/notification.types.ts` [MỚI]

```typescript
export type NotificationType = "like" | "comment" | "follow" | "rating";

export interface NotificationActor {
  id: number;
  username: string;
  avatar_url?: string;
}

export interface NotificationRecipe {
  id: number;
  title: string;
  image_url?: string;
}

export interface NotificationComment {
  id: number;
  content: string;
}

export interface Notification {
  id: number;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
  actor: NotificationActor;
  recipe?: NotificationRecipe;
  comment?: NotificationComment;
}

export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  unread_count: number;
}
```

---

### 2.3. Socket.IO Client

#### 📄 `shared/services/socket/socketClient.ts` [MỚI]

```typescript
import { io, Socket } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const API_URL =
  Constants.expoConfig?.extra?.apiUrl ||
  process.env.EXPO_PUBLIC_API_URL ||
  "http://localhost:3000";

class SocketClient {
  private socket: Socket | null = null;
  private userId: number | null = null;

  /**
   * Kết nối Socket.IO
   */
  async connect(userId: number): Promise<void> {
    if (this.socket?.connected) {
      console.log("Socket already connected");
      return;
    }

    this.userId = userId;

    // Lấy token để authenticate
    const token = await AsyncStorage.getItem("access_token");

    this.socket = io(API_URL, {
      transports: ["websocket"],
      auth: {
        token,
      },
    });

    this.socket.on("connect", () => {
      console.log("✅ Socket connected:", this.socket?.id);

      // Join vào room của user
      this.socket?.emit("join", { userId: this.userId });
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });
  }

  /**
   * Ngắt kết nối
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
      console.log("Socket disconnected manually");
    }
  }

  /**
   * Lắng nghe event
   */
  on(event: string, callback: (data: any) => void): void {
    this.socket?.on(event, callback);
  }

  /**
   * Hủy lắng nghe event
   */
  off(event: string, callback?: (data: any) => void): void {
    this.socket?.off(event, callback);
  }

  /**
   * Emit event
   */
  emit(event: string, data: any): void {
    this.socket?.emit(event, data);
  }

  /**
   * Kiểm tra kết nối
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketClient = new SocketClient();
```

#### 📄 `shared/services/socket/index.ts` [MỚI]

```typescript
export { socketClient } from "./socketClient";
```

---

### 2.4. Notification Service

#### 📄 `features/notification/services/notificationService.ts` [MỚI]

```typescript
import apiClient from "@/src/shared/services/api/client";
import {
  Notification,
  NotificationListResponse,
} from "../types/notification.types";

/**
 * Lấy danh sách thông báo
 */
export const getNotifications = async (
  page: number = 1,
  limit: number = 20,
): Promise<NotificationListResponse> => {
  const response = await apiClient.get<{ data: NotificationListResponse }>(
    `/notifications?page=${page}&limit=${limit}`,
  );
  return response.data.data;
};

/**
 * Đếm số thông báo chưa đọc
 */
export const getUnreadCount = async (): Promise<number> => {
  const response = await apiClient.get<{ data: { count: number } }>(
    "/notifications/unread-count",
  );
  return response.data.data.count;
};

/**
 * Đánh dấu thông báo đã đọc
 */
export const markAsRead = async (notificationId: number): Promise<void> => {
  await apiClient.put(`/notifications/${notificationId}/read`);
};

/**
 * Đánh dấu tất cả đã đọc
 */
export const markAllAsRead = async (): Promise<void> => {
  await apiClient.put("/notifications/read-all");
};

/**
 * Xóa thông báo
 */
export const deleteNotification = async (
  notificationId: number,
): Promise<void> => {
  await apiClient.delete(`/notifications/${notificationId}`);
};
```

---

### 2.5. Notification Store (Zustand)

#### 📄 `features/notification/store/notificationStore.ts` [MỚI]

```typescript
import { create } from "zustand";
import { Notification } from "../types/notification.types";
import * as notificationService from "../services/notificationService";
import { socketClient } from "@/src/shared/services/socket";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  page: number;
  hasMore: boolean;

  // Actions
  fetchNotifications: (page?: number) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: number) => Promise<void>;
  addNotification: (notification: Notification) => void;
  initSocketListener: () => void;
  cleanupSocketListener: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  page: 1,
  hasMore: true,

  fetchNotifications: async (page = 1) => {
    set({ isLoading: true });
    try {
      const response = await notificationService.getNotifications(page, 20);

      set({
        notifications:
          page === 1
            ? response.notifications
            : [...get().notifications, ...response.notifications],
        unreadCount: response.unread_count,
        page,
        hasMore: response.hasMore,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      set({ isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const count = await notificationService.getUnreadCount();
      set({ unreadCount: count });
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  },

  markAsRead: async (notificationId: number) => {
    try {
      await notificationService.markAsRead(notificationId);

      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n,
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationService.markAllAsRead();

      set((state) => ({
        notifications: state.notifications.map((n) => ({
          ...n,
          is_read: true,
        })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  },

  deleteNotification: async (notificationId: number) => {
    try {
      await notificationService.deleteNotification(notificationId);

      set((state) => {
        const notification = state.notifications.find(
          (n) => n.id === notificationId,
        );
        const wasUnread = notification && !notification.is_read;

        return {
          notifications: state.notifications.filter(
            (n) => n.id !== notificationId,
          ),
          unreadCount: wasUnread
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount,
        };
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  },

  addNotification: (notification: Notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  initSocketListener: () => {
    // Lắng nghe event thông báo mới từ server
    socketClient.on("new_notification", (notification: Notification) => {
      console.log("📩 New notification received:", notification);
      get().addNotification(notification);

      // Có thể show local notification ở đây
      // showLocalNotification(notification);
    });
  },

  cleanupSocketListener: () => {
    socketClient.off("new_notification");
  },
}));
```

---

### 2.6. UI Components

#### 📄 `features/notification/components/NotificationBadge.tsx` [MỚI]

```typescript
import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useNotificationStore } from "../store/notificationStore";

export const NotificationBadge: React.FC = () => {
  const { unreadCount, fetchUnreadCount } = useNotificationStore();

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  if (unreadCount === 0) return null;

  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>
        {unreadCount > 99 ? "99+" : unreadCount}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
});
```

#### 📄 `features/notification/components/NotificationItem.tsx` [MỚI]

```typescript
import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Notification } from "../types/notification.types";
import { useRouter } from "expo-router";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
}) => {
  const router = useRouter();

  const handlePress = () => {
    // Đánh dấu đã đọc
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }

    // Navigate đến recipe detail
    if (notification.recipe) {
      router.push(`/recipe/${notification.recipe.id}`);
    }
  };

  const getMessage = () => {
    const { actor, type, recipe, comment } = notification;

    switch (type) {
      case "like":
        return `${actor.username} đã thích bài viết "${recipe?.title}"`;
      case "comment":
        return `${actor.username} đã bình luận: "${comment?.content.slice(0, 50)}..."`;
      case "follow":
        return `${actor.username} đã theo dõi bạn`;
      case "rating":
        return `${actor.username} đã đánh giá bài viết "${recipe?.title}"`;
      default:
        return "";
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case "like":
        return "❤️";
      case "comment":
        return "💬";
      case "follow":
        return "👤";
      case "rating":
        return "⭐";
      default:
        return "";
    }
  };

  const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
    locale: vi,
  });

  return (
    <TouchableOpacity
      style={[styles.container, !notification.is_read && styles.unread]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Image
          source={{
            uri: notification.actor.avatar_url || "https://via.placeholder.com/40",
          }}
          style={styles.avatar}
        />
        <Text style={styles.typeIcon}>{getIcon()}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.message}>{getMessage()}</Text>
        <Text style={styles.time}>{timeAgo}</Text>
      </View>

      {notification.recipe?.image_url && (
        <Image
          source={{ uri: notification.recipe.image_url }}
          style={styles.recipeImage}
        />
      )}

      {!notification.is_read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    alignItems: "center",
  },
  unread: {
    backgroundColor: "#F0F8FF",
  },
  iconContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  typeIcon: {
    position: "absolute",
    bottom: -2,
    right: -2,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    width: 20,
    height: 20,
    textAlign: "center",
  },
  content: {
    flex: 1,
    marginRight: 8,
  },
  message: {
    fontSize: 14,
    color: "#333333",
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: "#999999",
  },
  recipeImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#007AFF",
    position: "absolute",
    top: 16,
    left: 8,
  },
});
```

#### 📄 `features/notification/components/NotificationList.tsx` [MỚI]

```typescript
import React, { useEffect } from "react";
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useNotificationStore } from "../store/notificationStore";
import { NotificationItem } from "./NotificationItem";

export const NotificationList: React.FC = () => {
  const {
    notifications,
    isLoading,
    hasMore,
    page,
    fetchNotifications,
    markAsRead,
    deleteNotification,
    markAllAsRead,
  } = useNotificationStore();

  useEffect(() => {
    fetchNotifications(1);
  }, []);

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      fetchNotifications(page + 1);
    }
  };

  const handleRefresh = () => {
    fetchNotifications(1);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Thông báo</Text>
      {notifications.some((n) => !n.is_read) && (
        <TouchableOpacity onPress={markAllAsRead}>
          <Text style={styles.markAllButton}>Đánh dấu tất cả đã đọc</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Chưa có thông báo nào</Text>
    </View>
  );

  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  };

  return (
    <FlatList
      data={notifications}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <NotificationItem
          notification={item}
          onMarkAsRead={markAsRead}
          onDelete={deleteNotification}
        />
      )}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={!isLoading ? renderEmpty : null}
      ListFooterComponent={renderFooter}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      refreshControl={
        <RefreshControl refreshing={isLoading && page === 1} onRefresh={handleRefresh} />
      }
    />
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
  },
  markAllButton: {
    fontSize: 14,
    color: "#007AFF",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#999999",
  },
  footer: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
```

---

### 2.7. Notification Screen

#### 📄 `app/(tabs)/notifications.tsx` [MỚI]

```typescript
import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { NotificationList } from "@/src/features/notification/components/NotificationList";
import { useNotificationStore } from "@/src/features/notification/store/notificationStore";
import { socketClient } from "@/src/shared/services/socket";
import { useAuthStore } from "@/src/features/auth/store/authStore";

export default function NotificationsScreen() {
  const { initSocketListener, cleanupSocketListener } = useNotificationStore();
  const { user } = useAuthStore();

  useEffect(() => {
    // Kết nối socket nếu chưa connected
    if (user?.id && !socketClient.isConnected()) {
      socketClient.connect(user.id);
    }

    // Init socket listener
    initSocketListener();

    return () => {
      cleanupSocketListener();
    };
  }, [user]);

  return (
    <View style={styles.container}>
      <NotificationList />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
});
```

---

### 2.8. Update Tab Layout

#### 📄 `app/(tabs)/_layout.tsx` [SỬA]

Thêm notification tab với badge:

```typescript
import { Tabs } from "expo-router";
import React from "react";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { NotificationBadge } from "@/src/features/notification/components/NotificationBadge";
import { View } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#007AFF",
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? "home" : "home-outline"} color={color} />
          ),
        }}
      />

      {/* THÊM NOTIFICATION TAB */}
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Thông báo",
          tabBarIcon: ({ color, focused }) => (
            <View>
              <TabBarIcon
                name={focused ? "notifications" : "notifications-outline"}
                color={color}
              />
              <NotificationBadge />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? "person" : "person-outline"} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

---

### 2.9. Init Socket on App Launch

#### 📄 `app/_layout.tsx` [SỬA]

Kết nối socket khi app khởi động (sau khi user login):

```typescript
import { useEffect } from "react";
import { Stack } from "expo-router";
import { useAuthStore } from "@/src/features/auth/store/authStore";
import { socketClient } from "@/src/shared/services/socket";

export default function RootLayout() {
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Kết nối socket khi user đã login
    if (isAuthenticated && user?.id) {
      socketClient.connect(user.id);
    }

    // Cleanup khi unmount
    return () => {
      if (socketClient.isConnected()) {
        socketClient.disconnect();
      }
    };
  }, [isAuthenticated, user]);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      {/* Other screens */}
    </Stack>
  );
}
```

---

### 2.10. Export Index Files

#### 📄 `features/notification/index.ts` [MỚI]

```typescript
export * from "./components/NotificationBadge";
export * from "./components/NotificationItem";
export * from "./components/NotificationList";
export * from "./services/notificationService";
export * from "./store/notificationStore";
export * from "./types/notification.types";
```

---

## 🧪 PHẦN 3: TESTING & DEBUGGING

### 3.1. Test Backend APIs với Postman/Thunder Client

#### Test 1: Lấy danh sách thông báo

```http
GET http://localhost:3000/api/notifications?page=1&limit=20
Authorization: Bearer YOUR_ACCESS_TOKEN
```

#### Test 2: Đếm thông báo chưa đọc

```http
GET http://localhost:3000/api/notifications/unread-count
Authorization: Bearer YOUR_ACCESS_TOKEN
```

#### Test 3: Đánh dấu đã đọc

```http
PUT http://localhost:3000/api/notifications/1/read
Authorization: Bearer YOUR_ACCESS_TOKEN
```

#### Test 4: Like bài viết (sẽ tạo notification)

```http
POST http://localhost:3000/api/recipes/1/like
Authorization: Bearer YOUR_ACCESS_TOKEN
```

#### Test 5: Comment vào bài viết (sẽ tạo notification)

```http
POST http://localhost:3000/api/recipes/1/comments
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "content": "Món này trông ngon quá!"
}
```

---

### 3.2. Test Socket Connection

Sử dụng tool như **Socket.IO Client Tool** hoặc code test:

```typescript
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  transports: ["websocket"],
  auth: {
    token: "YOUR_ACCESS_TOKEN",
  },
});

socket.on("connect", () => {
  console.log("Connected:", socket.id);
  socket.emit("join", { userId: 1 });
});

socket.on("new_notification", (data) => {
  console.log("New notification:", data);
});
```

---

### 3.3. Debug Checklist

- [ ] Backend: Model relationships đã setup đúng
- [ ] Backend: Dependency injection đã register đầy đủ
- [ ] Backend: Socket.IO server đã khởi động
- [ ] Backend: Notification được tạo khi like/comment
- [ ] Backend: Socket emit notification đến đúng user
- [ ] Frontend: Socket client kết nối thành công
- [ ] Frontend: Socket listener được setup
- [ ] Frontend: Notification store cập nhật khi có notification mới
- [ ] Frontend: UI hiển thị đúng số thông báo chưa đọc
- [ ] Frontend: Navigation hoạt động khi click vào notification

---

## 📊 PHẦN 4: DATABASE MIGRATIONS (Optional)

Nếu bạn chưa có bảng `notifications`, tạo migration:

### SQL Migration

```sql
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `type` ENUM('like', 'comment', 'follow', 'rating') NOT NULL,
  `actor_id` INT UNSIGNED NOT NULL,
  `recipe_id` INT UNSIGNED NULL,
  `comment_id` INT UNSIGNED NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_is_read` (`is_read`),
  INDEX `idx_created_at` (`created_at`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`recipe_id`) REFERENCES `recipes`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`comment_id`) REFERENCES `comments`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 🚀 PHẦN 5: DEPLOYMENT

### 5.1. Environment Variables

#### Backend `.env`

```env
PORT=3000
NODE_ENV=production
DATABASE_URL=mysql://user:password@host:3306/dbname
JWT_SECRET=your-secret-key
SOCKET_PORT=3000
```

#### Frontend `.env`

```env
EXPO_PUBLIC_API_URL=https://your-api-domain.com/api
```

---

### 5.2. Production Considerations

1. **Socket.IO với Load Balancer**
   - Sử dụng Redis adapter cho Socket.IO khi scale horizontally
   - Sticky sessions nếu không dùng Redis

2. **Rate Limiting**
   - Limit số request create notification để tránh spam

3. **Notification Retention**
   - Tự động xóa notification cũ hơn 30 ngày
   - Cron job cleanup

4. **Push Notifications**
   - Tích hợp Expo Push Notifications cho native notifications
   - FCM (Firebase Cloud Messaging) cho Android/iOS

---

## 📝 PHẦN 6: CHECKLIST TRIỂN KHAI

### Backend

- [ ] Tạo `NotificationRepository`
- [ ] Tạo `NotificationService`
- [ ] Tạo `NotificationController`
- [ ] Tạo notification routes
- [ ] Update `RecipeService` với notification logic
- [ ] Update `SocketService` với `emitToUser`
- [ ] Setup Socket.IO trong `server.ts`
- [ ] Register dependencies trong container
- [ ] Setup model relationships
- [ ] Test APIs

### Frontend

- [ ] Install `socket.io-client`: `npm install socket.io-client`
- [ ] Install `date-fns`: `npm install date-fns`
- [ ] Tạo notification types
- [ ] Tạo socket client
- [ ] Tạo notification service
- [ ] Tạo notification store
- [ ] Tạo notification components
- [ ] Tạo notification screen
- [ ] Add notification tab
- [ ] Init socket on app launch
- [ ] Test realtime notifications

---

## 🎯 KẾT LUẬN

Tài liệu này cung cấp hướng dẫn đầy đủ để implement tính năng thông báo realtime. Các điểm chính:

✅ **Backend**: API RESTful cho CRUD notifications + Socket.IO cho realtime  
✅ **Frontend**: Zustand store + Socket client + React Native components  
✅ **Realtime**: Socket.IO bidirectional communication  
✅ **UX**: Badge, unread count, mark as read, navigation

**Thời gian ước tính**: 1-2 ngày development + testing

Chúc bạn triển khai thành công! 🚀

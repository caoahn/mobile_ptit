/**
 * Seed Script - Tạo 20 accounts + 5 recipes mỗi account = 100 recipes
 * Sau mỗi recipe, tự động gọi POST /post/embedding lên AI service
 * Phase 3: Mô phỏng tương tác (follow, like, save, comment) để seed recommendation
 *
 * Cách chạy:
 *   cd backend
 *   npx ts-node src/scripts/seed-data.ts
 *
 * Requires: .env file với BASE_URL (hoặc mặc định http://localhost:3000/api)
 *           AI_SERVICE_URL trong .env
 */

import axios, { AxiosInstance } from "axios";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const BASE_URL = process.env.BASE_URL || "http://localhost:3000/api";
const AI_BASE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";
const AI_API_KEY = process.env.AI_API_KEY || "";

const TOTAL_ACCOUNTS = 20;
const RECIPES_PER_ACCOUNT = 5; // 20 × 5 = 100 recipes

// Interaction simulation config
const FOLLOWS_PER_USER = 6; // Mỗi user follow ~6 user khác
const LIKES_PER_USER = 15; // Mỗi user like ~15 recipe của người khác
const SAVES_PER_USER = 8; // Mỗi user save ~8 recipe
const COMMENTS_PER_USER = 5; // Mỗi user comment ~5 recipe

// ─── SAMPLE DATA ─────────────────────────────────────────────────────────────

const RECIPE_TEMPLATES = [
  {
    title: "Phở Bò Hà Nội",
    description:
      "Phở bò truyền thống Hà Nội với nước dùng trong vắt, thơm ngon.",
    category: "Món chính",
    difficulty: "Medium" as const,
    cook_time: 180,
    servings: 4,
    image_url:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Pho_bo.jpg/1200px-Pho_bo.jpg",
    tags: ["Việt Nam", "Món nước", "Bò"],
    ingredients: [
      { name: "Bánh phở", amount: "500", unit: "g" },
      { name: "Thịt bò tái", amount: "300", unit: "g" },
      { name: "Xương bò", amount: "1", unit: "kg" },
      { name: "Hành tây", amount: "2", unit: "củ" },
      { name: "Gừng", amount: "50", unit: "g" },
      { name: "Hồi", amount: "5", unit: "cái" },
    ],
    steps: [
      {
        order: 1,
        title: "Hầm xương",
        description: "Ninh xương bò với hành tây, gừng nướng trong 4 tiếng.",
        duration: 240,
      },
      {
        order: 2,
        title: "Nêm gia vị",
        description: "Thêm muối, nước mắm, đường phèn cho vừa miệng.",
        duration: 10,
      },
      {
        order: 3,
        title: "Trụng bánh phở",
        description: "Trụng bánh phở qua nước sôi, cho vào tô.",
        duration: 5,
      },
      {
        order: 4,
        title: "Hoàn thiện",
        description: "Chan nước dùng nóng, thêm thịt bò tái, hành lá.",
        duration: 5,
      },
    ],
  },
  {
    title: "Bún Bò Huế",
    description: "Bún bò Huế đậm đà với sả, mắm ruốc đặc trưng xứ Huế.",
    category: "Món chính",
    difficulty: "Medium" as const,
    cook_time: 120,
    servings: 4,
    image_url:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Bun-bo-hue.jpg/1200px-Bun-bo-hue.jpg",
    tags: ["Việt Nam", "Huế", "Bún"],
    ingredients: [
      { name: "Bún tươi", amount: "500", unit: "g" },
      { name: "Thịt bò", amount: "400", unit: "g" },
      { name: "Giò heo", amount: "500", unit: "g" },
      { name: "Mắm ruốc", amount: "3", unit: "muỗng" },
      { name: "Sả", amount: "5", unit: "cây" },
    ],
    steps: [
      {
        order: 1,
        title: "Luộc thịt",
        description: "Luộc bò và giò heo chín mềm, vớt ra thái lát.",
        duration: 60,
      },
      {
        order: 2,
        title: "Làm nước dùng",
        description: "Phi sả, ớt, thêm mắm ruốc pha loãng vào nồi nước hầm.",
        duration: 30,
      },
      {
        order: 3,
        title: "Trình bày",
        description: "Xếp bún vào tô, thêm thịt, chan nước dùng nóng.",
        duration: 5,
      },
    ],
  },
  {
    title: "Cơm Tấm Sườn Bì",
    description: "Cơm tấm Sài Gòn với sườn nướng thơm lừng, bì giòn.",
    category: "Món chính",
    difficulty: "Easy" as const,
    cook_time: 60,
    servings: 2,
    image_url:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Com_tam_suon_bi_cha.jpg/1200px-Com_tam_suon_bi_cha.jpg",
    tags: ["Việt Nam", "Cơm", "Sài Gòn"],
    ingredients: [
      { name: "Gạo tấm", amount: "300", unit: "g" },
      { name: "Sườn heo", amount: "400", unit: "g" },
      { name: "Bì heo", amount: "200", unit: "g" },
      { name: "Nước mắm", amount: "50", unit: "ml" },
      { name: "Tỏi", amount: "5", unit: "tép" },
    ],
    steps: [
      {
        order: 1,
        title: "Ướp sườn",
        description: "Ướp sườn với tỏi, sả, nước mắm 2 tiếng.",
        duration: 120,
      },
      {
        order: 2,
        title: "Nướng sườn",
        description: "Nướng sườn ở 200°C hoặc than hoa cho vàng đều.",
        duration: 30,
      },
      {
        order: 3,
        title: "Nấu cơm tấm",
        description: "Vo gạo, nấu cơm tấm dẻo.",
        duration: 25,
      },
      {
        order: 4,
        title: "Trình bày",
        description: "Xới cơm, xếp sườn và bì, chan nước mắm pha.",
        duration: 5,
      },
    ],
  },
  {
    title: "Bánh Mì Thịt Nướng",
    description:
      "Bánh mì Việt Nam giòn rụm với thịt nướng thơm và rau sống tươi.",
    category: "Bánh",
    difficulty: "Easy" as const,
    cook_time: 30,
    servings: 2,
    image_url:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Banh_mi_Vietnam.jpg/1200px-Banh_mi_Vietnam.jpg",
    tags: ["Bánh mì", "Việt Nam", "Nhanh"],
    ingredients: [
      { name: "Bánh mì", amount: "2", unit: "ổ" },
      { name: "Thịt ba chỉ", amount: "300", unit: "g" },
      { name: "Dưa chua", amount: "100", unit: "g" },
      { name: "Rau mùi", amount: "50", unit: "g" },
      { name: "Tương ớt", amount: "2", unit: "muỗng" },
    ],
    steps: [
      {
        order: 1,
        title: "Ướp thịt",
        description: "Ướp thịt với sả, tỏi, mật ong, nước mắm.",
        duration: 30,
      },
      {
        order: 2,
        title: "Nướng thịt",
        description: "Nướng thịt vàng đều hai mặt.",
        duration: 15,
      },
      {
        order: 3,
        title: "Hoàn thiện",
        description: "Xẻ bánh mì, kẹp thịt, rau, dưa vào.",
        duration: 5,
      },
    ],
  },
  {
    title: "Gà Rang Gừng",
    description: "Gà rang gừng vàng ươm, đậm đà, ăn với cơm trắng cực ngon.",
    category: "Món chính",
    difficulty: "Easy" as const,
    cook_time: 40,
    servings: 3,
    image_url:
      "https://images.unsplash.com/photo-1598514983318-2f64f8f4796c?w=1200",
    tags: ["Gà", "Việt Nam", "Rang"],
    ingredients: [
      { name: "Gà", amount: "1", unit: "con" },
      { name: "Gừng", amount: "100", unit: "g" },
      { name: "Nước mắm", amount: "3", unit: "muỗng" },
      { name: "Đường", amount: "1", unit: "muỗng" },
    ],
    steps: [
      {
        order: 1,
        title: "Sơ chế",
        description: "Chặt gà, chà gừng, ướp 20 phút.",
        duration: 25,
      },
      {
        order: 2,
        title: "Rang gà",
        description: "Phi tỏi, cho gà vào rang vàng, thêm gừng, nêm vừa.",
        duration: 20,
      },
    ],
  },
  {
    title: "Canh Chua Cá Lóc",
    description: "Canh chua miền Nam với cá lóc tươi, me, cà chua và dứa.",
    category: "Món canh",
    difficulty: "Easy" as const,
    cook_time: 35,
    servings: 4,
    image_url:
      "https://images.unsplash.com/photo-1547592180-85f173990554?w=1200",
    tags: ["Canh", "Miền Nam", "Cá"],
    ingredients: [
      { name: "Cá lóc", amount: "600", unit: "g" },
      { name: "Me chua", amount: "50", unit: "g" },
      { name: "Cà chua", amount: "3", unit: "quả" },
      { name: "Dứa", amount: "1/2", unit: "quả" },
      { name: "Giá đỗ", amount: "100", unit: "g" },
    ],
    steps: [
      {
        order: 1,
        title: "Nấu nước me",
        description: "Hòa me với nước nóng, lọc lấy nước chua.",
        duration: 10,
      },
      {
        order: 2,
        title: "Nấu canh",
        description: "Đun sôi nước me, thêm cà chua, dứa, cá lóc vào nấu chín.",
        duration: 20,
      },
      {
        order: 3,
        title: "Nêm và hoàn thiện",
        description: "Nêm nước mắm, đường, thêm giá đỗ, rau. Tắt bếp.",
        duration: 5,
      },
    ],
  },
  {
    title: "Mì Quảng",
    description:
      "Mì Quảng đặc sản xứ Quảng với nước nhưn vàng óng, thịt gà và tôm.",
    category: "Món chính",
    difficulty: "Medium" as const,
    cook_time: 90,
    servings: 4,
    image_url:
      "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=1200",
    tags: ["Việt Nam", "Mì", "Đà Nẵng"],
    ingredients: [
      { name: "Mì Quảng khô", amount: "400", unit: "g" },
      { name: "Thịt gà", amount: "400", unit: "g" },
      { name: "Tôm", amount: "200", unit: "g" },
      { name: "Trứng cút", amount: "10", unit: "quả" },
      { name: "Nghệ tươi", amount: "30", unit: "g" },
    ],
    steps: [
      {
        order: 1,
        title: "Làm nhân",
        description: "Xào gà, tôm với nghệ, hành, nêm vừa miệng.",
        duration: 30,
      },
      {
        order: 2,
        title: "Trụng mì",
        description: "Trụng mì Quảng qua nước sôi.",
        duration: 5,
      },
      {
        order: 3,
        title: "Trình bày",
        description: "Cho mì vào bát, xếp nhân, trứng cút, chan nước nhưn.",
        duration: 5,
      },
    ],
  },
  {
    title: "Bò Kho Bánh Mì",
    description: "Bò kho đậm đà, thơm hương hoa hồi, ăn với bánh mì giòn.",
    category: "Món chính",
    difficulty: "Medium" as const,
    cook_time: 120,
    servings: 4,
    image_url:
      "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=1200",
    tags: ["Bò", "Việt Nam", "Kho"],
    ingredients: [
      { name: "Thịt bò bắp", amount: "600", unit: "g" },
      { name: "Cà rốt", amount: "3", unit: "củ" },
      { name: "Sả", amount: "3", unit: "cây" },
      { name: "Hoa hồi", amount: "4", unit: "cái" },
      { name: "Bột cà ri", amount: "2", unit: "muỗng" },
    ],
    steps: [
      {
        order: 1,
        title: "Ướp thịt",
        description: "Ướp bò với sả, bột cà ri, nước mắm ít nhất 1 tiếng.",
        duration: 60,
      },
      {
        order: 2,
        title: "Xào và kho",
        description:
          "Phi sả, cho bò vào xào thơm, thêm nước kho mềm với cà rốt.",
        duration: 90,
      },
    ],
  },
  {
    title: "Chả Giò Rán",
    description: "Chả giò giòn tan, nhân thịt heo, tôm, miến đặc trưng.",
    category: "Món khai vị",
    difficulty: "Medium" as const,
    cook_time: 50,
    servings: 30,
    image_url:
      "https://images.unsplash.com/photo-1548943487-a2e4e43b4853?w=1200",
    tags: ["Chiên", "Việt Nam", "Khai vị"],
    ingredients: [
      { name: "Vỏ cuốn chả giò", amount: "30", unit: "tờ" },
      { name: "Thịt heo xay", amount: "300", unit: "g" },
      { name: "Tôm bóc vỏ", amount: "200", unit: "g" },
      { name: "Miến", amount: "50", unit: "g" },
      { name: "Cà rốt", amount: "1", unit: "củ" },
    ],
    steps: [
      {
        order: 1,
        title: "Làm nhân",
        description: "Trộn thịt heo, tôm, miến ngâm, cà rốt bào, nêm gia vị.",
        duration: 15,
      },
      {
        order: 2,
        title: "Cuốn chả giò",
        description: "Đặt nhân vào vỏ, cuốn chắc tay.",
        duration: 20,
      },
      {
        order: 3,
        title: "Chiên vàng",
        description: "Chiên dầu ở lửa vừa đến chả giò vàng đều, giòn.",
        duration: 15,
      },
    ],
  },
  {
    title: "Bánh Xèo Miền Nam",
    description:
      "Bánh xèo giòn xèo xèo với tôm, thịt và giá đỗ, cuốn rau thơm.",
    category: "Bánh",
    difficulty: "Medium" as const,
    cook_time: 45,
    servings: 6,
    image_url:
      "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=1200",
    tags: ["Bánh", "Miền Nam", "Giòn"],
    ingredients: [
      { name: "Bột gạo", amount: "400", unit: "g" },
      { name: "Nước cốt dừa", amount: "200", unit: "ml" },
      { name: "Tôm tươi", amount: "200", unit: "g" },
      { name: "Thịt ba chỉ", amount: "200", unit: "g" },
      { name: "Giá đỗ", amount: "200", unit: "g" },
    ],
    steps: [
      {
        order: 1,
        title: "Pha bột",
        description:
          "Hòa bột gạo với nước cốt dừa, nước lọc, nghệ, để nghỉ 15 phút.",
        duration: 20,
      },
      {
        order: 2,
        title: "Đổ bánh",
        description: "Đổ bột mỏng lên chảo nóng có dầu, xếp nhân, gập bánh.",
        duration: 20,
      },
    ],
  },
  // ── Thêm 20 template mới ──────────────────────────────────────────────────
  {
    title: "Bún Chả Hà Nội",
    description: "Bún chả đặc trưng Hà Nội với chả viên, chả miếng nướng than.",
    category: "Món chính",
    difficulty: "Medium" as const,
    cook_time: 60,
    servings: 4,
    image_url:
      "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=1200",
    tags: ["Hà Nội", "Bún", "Nướng"],
    ingredients: [
      { name: "Bún tươi", amount: "500", unit: "g" },
      { name: "Thịt heo xay", amount: "300", unit: "g" },
      { name: "Ba chỉ heo", amount: "300", unit: "g" },
      { name: "Nước mắm", amount: "50", unit: "ml" },
      { name: "Tỏi", amount: "5", unit: "tép" },
      { name: "Ớt", amount: "2", unit: "quả" },
    ],
    steps: [
      {
        order: 1,
        title: "Ướp thịt",
        description:
          "Trộn thịt xay với hành, tỏi, nước mắm, đường rồi viên tròn.",
        duration: 20,
      },
      {
        order: 2,
        title: "Nướng chả",
        description: "Nướng chả trên than hoa cho thơm, vàng đều.",
        duration: 25,
      },
      {
        order: 3,
        title: "Pha nước chấm",
        description: "Pha nước mắm loãng với đường, giấm, ớt, tỏi, cà rốt bào.",
        duration: 10,
      },
      {
        order: 4,
        title: "Trình bày",
        description: "Bày bún, chả kèm rau sống và bát nước chấm.",
        duration: 5,
      },
    ],
  },
  {
    title: "Gỏi Cuốn Tôm Thịt",
    description: "Gỏi cuốn tươi mát với tôm luộc, thịt heo, bún và rau thơm.",
    category: "Món khai vị",
    difficulty: "Easy" as const,
    cook_time: 30,
    servings: 4,
    image_url:
      "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=1200",
    tags: ["Cuốn", "Việt Nam", "Tươi mát"],
    ingredients: [
      { name: "Bánh tráng", amount: "20", unit: "tờ" },
      { name: "Tôm sú", amount: "200", unit: "g" },
      { name: "Thịt ba chỉ luộc", amount: "200", unit: "g" },
      { name: "Bún sợi nhỏ", amount: "150", unit: "g" },
      { name: "Xà lách, tía tô", amount: "100", unit: "g" },
    ],
    steps: [
      {
        order: 1,
        title: "Luộc nguyên liệu",
        description: "Luộc tôm và thịt chín, để nguội, thái lát.",
        duration: 15,
      },
      {
        order: 2,
        title: "Cuốn gỏi",
        description:
          "Nhúng bánh tráng ướt, đặt rau, bún, tôm, thịt rồi cuốn chặt.",
        duration: 15,
      },
    ],
  },
  {
    title: "Cá Kho Tộ",
    description: "Cá kho tộ đậm đà vị nước dừa, ăn với cơm trắng nóng hổi.",
    category: "Món chính",
    difficulty: "Easy" as const,
    cook_time: 45,
    servings: 3,
    image_url:
      "https://images.unsplash.com/photo-1559847844-5315695dadae?w=1200",
    tags: ["Cá", "Kho", "Miền Nam"],
    ingredients: [
      { name: "Cá basa hoặc cá thu", amount: "500", unit: "g" },
      { name: "Nước dừa tươi", amount: "200", unit: "ml" },
      { name: "Nước màu (caramen)", amount: "2", unit: "muỗng" },
      { name: "Tiêu", amount: "1", unit: "muỗng" },
      { name: "Gừng", amount: "30", unit: "g" },
    ],
    steps: [
      {
        order: 1,
        title: "Ướp cá",
        description: "Ướp cá với nước mắm, tiêu, gừng 30 phút.",
        duration: 30,
      },
      {
        order: 2,
        title: "Kho cá",
        description:
          "Cho cá vào nồi đất, thêm nước dừa, nước màu, kho lửa nhỏ đến sền sệt.",
        duration: 40,
      },
    ],
  },
  {
    title: "Xôi Gà",
    description: "Xôi dẻo thơm ăn kèm gà xé, hành phi vàng ươm.",
    category: "Món phụ",
    difficulty: "Easy" as const,
    cook_time: 60,
    servings: 4,
    image_url:
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=1200",
    tags: ["Xôi", "Gà", "Sáng"],
    ingredients: [
      { name: "Gạo nếp", amount: "400", unit: "g" },
      { name: "Gà ta", amount: "1/2", unit: "con" },
      { name: "Hành phi", amount: "50", unit: "g" },
      { name: "Nước mắm", amount: "2", unit: "muỗng" },
    ],
    steps: [
      {
        order: 1,
        title: "Ngâm gạo nếp",
        description: "Ngâm gạo nếp 4–6 tiếng, đồ chín.",
        duration: 40,
      },
      {
        order: 2,
        title: "Luộc gà",
        description: "Luộc gà với gừng sả, xé sợi, nêm nước mắm.",
        duration: 30,
      },
      {
        order: 3,
        title: "Hoàn thiện",
        description: "Xới xôi ra đĩa, xếp gà xé, rắc hành phi.",
        duration: 5,
      },
    ],
  },
  {
    title: "Bánh Cuốn Thanh Trì",
    description:
      "Bánh cuốn Hà Nội nhân mộc nhĩ thịt xay, chấm nước mắm chua ngọt.",
    category: "Bánh",
    difficulty: "Hard" as const,
    cook_time: 60,
    servings: 3,
    image_url:
      "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=1200",
    tags: ["Bánh cuốn", "Hà Nội", "Hấp"],
    ingredients: [
      { name: "Bột gạo xay", amount: "300", unit: "g" },
      { name: "Thịt heo xay", amount: "200", unit: "g" },
      { name: "Mộc nhĩ", amount: "50", unit: "g" },
      { name: "Hành khô", amount: "3", unit: "củ" },
    ],
    steps: [
      {
        order: 1,
        title: "Pha bột",
        description: "Pha bột gạo loãng, để nghỉ 30 phút.",
        duration: 35,
      },
      {
        order: 2,
        title: "Xào nhân",
        description: "Xào thịt với mộc nhĩ, hành, nêm vừa.",
        duration: 15,
      },
      {
        order: 3,
        title: "Tráng bánh",
        description: "Tráng bột lên chảo hơi, cho nhân rồi cuộn.",
        duration: 20,
      },
    ],
  },
  {
    title: "Lẩu Thái Hải Sản",
    description: "Lẩu Thái chua cay thơm nồng sả, gừng với hải sản tươi sống.",
    category: "Lẩu",
    difficulty: "Medium" as const,
    cook_time: 50,
    servings: 4,
    image_url:
      "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=1200",
    tags: ["Lẩu", "Hải sản", "Chua cay"],
    ingredients: [
      { name: "Tôm sú", amount: "300", unit: "g" },
      { name: "Mực tươi", amount: "300", unit: "g" },
      { name: "Sả", amount: "4", unit: "cây" },
      { name: "Riềng", amount: "50", unit: "g" },
      { name: "Lá chanh", amount: "10", unit: "lá" },
      { name: "Nấm rơm", amount: "200", unit: "g" },
    ],
    steps: [
      {
        order: 1,
        title: "Nấu nước dùng",
        description: "Nấu sả, riềng, lá chanh, thêm nước dùng xương.",
        duration: 20,
      },
      {
        order: 2,
        title: "Nêm gia vị",
        description: "Thêm nước cốt me, ớt, nước mắm, đường cho cân bằng.",
        duration: 10,
      },
      {
        order: 3,
        title: "Nhúng hải sản",
        description: "Nhúng tôm, mực, nấm vào lẩu sôi ăn kèm rau.",
        duration: 20,
      },
    ],
  },
  {
    title: "Thịt Kho Trứng",
    description:
      "Thịt ba chỉ kho trứng vịt với nước dừa, vị béo ngọt đặc trưng.",
    category: "Món chính",
    difficulty: "Easy" as const,
    cook_time: 90,
    servings: 4,
    image_url:
      "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=1200",
    tags: ["Thịt heo", "Kho", "Tết"],
    ingredients: [
      { name: "Thịt ba chỉ", amount: "700", unit: "g" },
      { name: "Trứng vịt", amount: "6", unit: "quả" },
      { name: "Nước dừa tươi", amount: "500", unit: "ml" },
      { name: "Nước màu", amount: "2", unit: "muỗng" },
    ],
    steps: [
      {
        order: 1,
        title: "Luộc trứng",
        description: "Luộc trứng vịt chín, bóc vỏ.",
        duration: 15,
      },
      {
        order: 2,
        title: "Thắng nước màu",
        description: "Thắng đường đến nâu cánh gián, cho thịt vào đảo.",
        duration: 10,
      },
      {
        order: 3,
        title: "Kho thịt",
        description: "Thêm nước dừa, trứng, kho lửa nhỏ đến khi thịt mềm.",
        duration: 70,
      },
    ],
  },
  {
    title: "Salad Cá Ngừ Kiểu Mới",
    description:
      "Salad cá ngừ đóng hộp tươi ngon với rau xanh, sốt mù tạt mật ong.",
    category: "Salad",
    difficulty: "Easy" as const,
    cook_time: 15,
    servings: 2,
    image_url:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200",
    tags: ["Salad", "Healthy", "Nhanh"],
    ingredients: [
      { name: "Cá ngừ đóng hộp", amount: "2", unit: "hộp" },
      { name: "Xà lách romain", amount: "200", unit: "g" },
      { name: "Cà chua bi", amount: "100", unit: "g" },
      { name: "Dưa chuột", amount: "1", unit: "quả" },
      { name: "Mù tạt Dijon", amount: "1", unit: "muỗng" },
      { name: "Mật ong", amount: "1", unit: "muỗng" },
    ],
    steps: [
      {
        order: 1,
        title: "Chuẩn bị rau",
        description: "Rửa sạch, thái rau, xếp vào bát.",
        duration: 5,
      },
      {
        order: 2,
        title: "Pha sốt",
        description: "Trộn mù tạt, mật ong, dầu olive, chanh.",
        duration: 5,
      },
      {
        order: 3,
        title: "Hoàn thiện",
        description: "Cho cá ngừ lên trên, rưới sốt, trộn đều.",
        duration: 5,
      },
    ],
  },
  {
    title: "Súp Bí Đỏ",
    description:
      "Súp bí đỏ mịn màng, béo nhẹ từ kem tươi, thơm hạt tiêu và nutmeg.",
    category: "Súp",
    difficulty: "Easy" as const,
    cook_time: 35,
    servings: 3,
    image_url:
      "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=1200",
    tags: ["Súp", "Healthy", "Chay"],
    ingredients: [
      { name: "Bí đỏ", amount: "500", unit: "g" },
      { name: "Hành tây", amount: "1", unit: "củ" },
      { name: "Kem tươi", amount: "100", unit: "ml" },
      { name: "Nước dùng gà", amount: "500", unit: "ml" },
      { name: "Nutmeg", amount: "1/4", unit: "muỗng" },
    ],
    steps: [
      {
        order: 1,
        title: "Hầm bí",
        description: "Xào hành, thêm bí đỏ và nước dùng, hầm mềm.",
        duration: 25,
      },
      {
        order: 2,
        title: "Xay mịn",
        description: "Xay nhuyễn hỗn hợp bằng máy xay.",
        duration: 5,
      },
      {
        order: 3,
        title: "Hoàn thiện",
        description: "Thêm kem tươi, nutmeg, nêm muối tiêu.",
        duration: 5,
      },
    ],
  },
  {
    title: "Pizza Margherita",
    description:
      "Pizza Ý kinh điển với sốt cà chua tươi, phô mai Mozzarella và lá húng.",
    category: "Món chính",
    difficulty: "Medium" as const,
    cook_time: 40,
    servings: 2,
    image_url:
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=1200",
    tags: ["Pizza", "Ý", "Phô mai"],
    ingredients: [
      { name: "Bột mì", amount: "300", unit: "g" },
      { name: "Phô mai Mozzarella", amount: "250", unit: "g" },
      { name: "Cà chua xay", amount: "200", unit: "g" },
      { name: "Lá húng quế", amount: "20", unit: "lá" },
      { name: "Dầu olive", amount: "2", unit: "muỗng" },
    ],
    steps: [
      {
        order: 1,
        title: "Nhào bột",
        description: "Trộn bột, men, muối, nhào đến mịn, ủ 1 tiếng.",
        duration: 70,
      },
      {
        order: 2,
        title: "Trải bột",
        description: "Cán mỏng đế pizza, phết sốt cà chua.",
        duration: 10,
      },
      {
        order: 3,
        title: "Nướng pizza",
        description: "Xếp phô mai, nướng 230°C 12 phút. Thêm húng sau nướng.",
        duration: 15,
      },
    ],
  },
  {
    title: "Pasta Carbonara",
    description:
      "Pasta carbonara Ý chuẩn vị: trứng, Parmesan, guanciale, hạt tiêu đen.",
    category: "Món chính",
    difficulty: "Medium" as const,
    cook_time: 25,
    servings: 2,
    image_url:
      "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=1200",
    tags: ["Pasta", "Ý", "Trứng"],
    ingredients: [
      { name: "Spaghetti", amount: "200", unit: "g" },
      { name: "Bacon hoặc thịt xông khói", amount: "150", unit: "g" },
      { name: "Trứng gà", amount: "3", unit: "quả" },
      { name: "Phô mai Parmesan", amount: "80", unit: "g" },
      { name: "Tiêu đen xay", amount: "1", unit: "muỗng" },
    ],
    steps: [
      {
        order: 1,
        title: "Luộc pasta",
        description: "Luộc al dente trong nước muối.",
        duration: 10,
      },
      {
        order: 2,
        title: "Áp chảo bacon",
        description: "Áp chảo bacon đến giòn.",
        duration: 8,
      },
      {
        order: 3,
        title: "Trộn sốt",
        description:
          "Trộn trứng + Parmesan + tiêu, đổ vào pasta còn nóng. Không dùng nhiệt.",
        duration: 5,
      },
    ],
  },
  {
    title: "Burger Bò Phô Mai",
    description:
      "Burger bò nhà làm với patty dày, cheddar chảy, rau sạch và sốt đặc biệt.",
    category: "Món chính",
    difficulty: "Medium" as const,
    cook_time: 30,
    servings: 2,
    image_url:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200",
    tags: ["Burger", "Bò", "Phô mai"],
    ingredients: [
      { name: "Thịt bò xay", amount: "400", unit: "g" },
      { name: "Bánh burger bun", amount: "2", unit: "cái" },
      { name: "Phô mai Cheddar", amount: "4", unit: "lát" },
      { name: "Xà lách, cà chua, dưa chuột", amount: "200", unit: "g" },
      { name: "Sốt mayo, tương cà", amount: "50", unit: "ml" },
    ],
    steps: [
      {
        order: 1,
        title: "Tạo hình patty",
        description: "Trộn thịt bò với muối tiêu, viên tròn dẹp.",
        duration: 10,
      },
      {
        order: 2,
        title: "Nướng patty",
        description:
          "Áp chảo hoặc vỉ 4 phút mỗi mặt, đặt phô mai lên trước khi tắt bếp.",
        duration: 10,
      },
      {
        order: 3,
        title: "Lắp burger",
        description: "Phết sốt lên bánh, xếp rau, patty và đậy nắp.",
        duration: 5,
      },
    ],
  },
  {
    title: "Cơm Chiên Dương Châu",
    description:
      "Cơm chiên Dương Châu đủ màu với tôm, thịt xá xíu, trứng và rau củ.",
    category: "Món chính",
    difficulty: "Easy" as const,
    cook_time: 20,
    servings: 2,
    image_url:
      "https://images.unsplash.com/photo-1512058454905-6b841e7ad132?w=1200",
    tags: ["Cơm chiên", "Trung Hoa", "Nhanh"],
    ingredients: [
      { name: "Cơm nguội", amount: "400", unit: "g" },
      { name: "Tôm bóc vỏ", amount: "150", unit: "g" },
      { name: "Thịt xá xíu", amount: "100", unit: "g" },
      { name: "Trứng gà", amount: "2", unit: "quả" },
      { name: "Ngô, đậu Hà Lan, cà rốt", amount: "150", unit: "g" },
    ],
    steps: [
      {
        order: 1,
        title: "Chiên trứng",
        description: "Đánh trứng, đổ chảo nóng dầu, khuấy nhanh.",
        duration: 3,
      },
      {
        order: 2,
        title: "Xào nhân",
        description: "Xào tôm, xá xíu, rau củ chín.",
        duration: 7,
      },
      {
        order: 3,
        title: "Chiên cơm",
        description: "Cho cơm vào, đảo đều trên lửa to, nêm xì dầu, dầu hào.",
        duration: 8,
      },
    ],
  },
  {
    title: "Sườn Xào Chua Ngọt",
    description: "Sườn heo chiên giòn sốt chua ngọt màu đẹp, ăn kèm cơm trắng.",
    category: "Món chính",
    difficulty: "Medium" as const,
    cook_time: 45,
    servings: 3,
    image_url:
      "https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=1200",
    tags: ["Sườn", "Chua ngọt", "Trung Hoa"],
    ingredients: [
      { name: "Sườn heo non", amount: "600", unit: "g" },
      { name: "Dứa", amount: "1/4", unit: "quả" },
      { name: "Ớt chuông", amount: "2", unit: "quả" },
      { name: "Cà chua", amount: "2", unit: "quả" },
      { name: "Sốt cà chua, giấm, đường", amount: "50", unit: "ml" },
    ],
    steps: [
      {
        order: 1,
        title: "Chiên sườn",
        description: "Chiên sườn vàng giòn, để ráo dầu.",
        duration: 20,
      },
      {
        order: 2,
        title: "Làm sốt",
        description:
          "Phi tỏi, thêm cà chua, dứa, ớt chuông, nêm sốt chua ngọt.",
        duration: 10,
      },
      {
        order: 3,
        title: "Kết hợp",
        description: "Cho sườn vào sốt, đảo đều 5 phút.",
        duration: 10,
      },
    ],
  },
  {
    title: "Ramen Trứng Soy",
    description:
      "Ramen Nhật với nước dùng tonkotsu đậm vị, trứng ngâm tương và chashu.",
    category: "Món chính",
    difficulty: "Hard" as const,
    cook_time: 240,
    servings: 2,
    image_url:
      "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=1200",
    tags: ["Ramen", "Nhật Bản", "Mì"],
    ingredients: [
      { name: "Mì ramen tươi", amount: "200", unit: "g" },
      { name: "Xương heo", amount: "1", unit: "kg" },
      { name: "Ba chỉ cuộn chashu", amount: "300", unit: "g" },
      { name: "Trứng gà", amount: "4", unit: "quả" },
      { name: "Tương soy, mirin", amount: "50", unit: "ml" },
    ],
    steps: [
      {
        order: 1,
        title: "Hầm xương",
        description: "Hầm xương heo 4 giờ đến khi nước trắng đục.",
        duration: 240,
      },
      {
        order: 2,
        title: "Làm chashu",
        description:
          "Cuộn ba chỉ, buộc dây, kho trong dashi, soy, mirin 1 giờ.",
        duration: 60,
      },
      {
        order: 3,
        title: "Ngâm trứng",
        description: "Luộc trứng ramen 6,5 phút, bóc vỏ, ngâm soy 4 tiếng.",
        duration: 20,
      },
      {
        order: 4,
        title: "Lắp bát ramen",
        description: "Xếp mì, chan nước dùng, xếp chashu và trứng.",
        duration: 10,
      },
    ],
  },
  {
    title: "Bánh Flan Caramel",
    description: "Bánh flan mềm mịn, bóng đẹp với lớp caramel đắng nhẹ ở trên.",
    category: "Tráng miệng",
    difficulty: "Medium" as const,
    cook_time: 60,
    servings: 6,
    image_url:
      "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=1200",
    tags: ["Tráng miệng", "Flan", "Caramel"],
    ingredients: [
      { name: "Trứng gà", amount: "4", unit: "quả" },
      { name: "Sữa tươi", amount: "500", unit: "ml" },
      { name: "Đường", amount: "150", unit: "g" },
      { name: "Vani", amount: "1", unit: "muỗng cà phê" },
    ],
    steps: [
      {
        order: 1,
        title: "Làm caramel",
        description:
          "Thắng 80g đường với 2 muỗng nước đến màu cánh gián, đổ vào khuôn.",
        duration: 10,
      },
      {
        order: 2,
        title: "Trộn hỗn hợp flan",
        description: "Đánh trứng với sữa, đường, vani, lọc qua rây.",
        duration: 10,
      },
      {
        order: 3,
        title: "Hấp cách thủy",
        description: "Đổ vào khuôn, hấp lửa nhỏ 35–40 phút.",
        duration: 40,
      },
    ],
  },
  {
    title: "Chè Ba Màu",
    description:
      "Chè ba màu miền Nam với đậu đỏ, đậu xanh, thạch trắng và nước cốt dừa.",
    category: "Tráng miệng",
    difficulty: "Easy" as const,
    cook_time: 60,
    servings: 6,
    image_url:
      "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=1200",
    tags: ["Chè", "Miền Nam", "Tráng miệng"],
    ingredients: [
      { name: "Đậu đỏ", amount: "150", unit: "g" },
      { name: "Đậu xanh cà", amount: "150", unit: "g" },
      { name: "Bột năng", amount: "100", unit: "g" },
      { name: "Nước cốt dừa", amount: "200", unit: "ml" },
      { name: "Đường", amount: "100", unit: "g" },
    ],
    steps: [
      {
        order: 1,
        title: "Nấu đậu",
        description: "Nấu đậu đỏ và đậu xanh riêng biệt với đường.",
        duration: 40,
      },
      {
        order: 2,
        title: "Làm thạch",
        description: "Nấu bột năng với nước đường, đổ khuôn đợi đông.",
        duration: 15,
      },
      {
        order: 3,
        title: "Trình bày",
        description: "Xếp 3 lớp màu vào ly, chan nước cốt dừa, thêm đá.",
        duration: 5,
      },
    ],
  },
  {
    title: "Smoothie Bơ Chuối",
    description: "Smoothie bơ chuối béo ngậy, bổ dưỡng, chỉ 5 phút là xong.",
    category: "Đồ uống",
    difficulty: "Easy" as const,
    cook_time: 5,
    servings: 2,
    image_url:
      "https://images.unsplash.com/photo-1553530979-fbb9e4aee36f?w=1200",
    tags: ["Sinh tố", "Healthy", "Nhanh"],
    ingredients: [
      { name: "Bơ chín", amount: "1", unit: "quả" },
      { name: "Chuối", amount: "1", unit: "quả" },
      { name: "Sữa tươi", amount: "200", unit: "ml" },
      { name: "Mật ong", amount: "1", unit: "muỗng" },
      { name: "Đá lạnh", amount: "100", unit: "g" },
    ],
    steps: [
      {
        order: 1,
        title: "Xay tất cả",
        description: "Cho tất cả vào máy xay, xay đến mịn.",
        duration: 3,
      },
      {
        order: 2,
        title: "Rót ra ly",
        description: "Rót ra ly cao, trang trí thêm lát chuối.",
        duration: 2,
      },
    ],
  },
  {
    title: "Đậu Hũ Sốt Cà Chua",
    description:
      "Món chay đơn giản, đậu hũ non sốt cà chua tươi, ăn cơm rất hao.",
    category: "Món chay",
    difficulty: "Easy" as const,
    cook_time: 20,
    servings: 3,
    image_url:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200",
    tags: ["Chay", "Đậu hũ", "Nhanh"],
    ingredients: [
      { name: "Đậu hũ non", amount: "400", unit: "g" },
      { name: "Cà chua", amount: "4", unit: "quả" },
      { name: "Hành lá", amount: "30", unit: "g" },
      { name: "Nước tương", amount: "2", unit: "muỗng" },
    ],
    steps: [
      {
        order: 1,
        title: "Chiên đậu hũ",
        description: "Cắt miếng đậu hũ, chiên vàng đều.",
        duration: 10,
      },
      {
        order: 2,
        title: "Làm sốt",
        description: "Xào tỏi, thêm cà chua bóp nát, nêm nước tương, đường.",
        duration: 8,
      },
      {
        order: 3,
        title: "Hoàn thiện",
        description: "Cho đậu hũ vào sốt, rắc hành lá.",
        duration: 2,
      },
    ],
  },
  {
    title: "Cánh Gà Chiên Nước Mắm",
    description: "Cánh gà chiên giòn rụm, phủ sốt nước mắm tỏi ớt đậm đà.",
    category: "Món chính",
    difficulty: "Easy" as const,
    cook_time: 35,
    servings: 3,
    image_url:
      "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=1200",
    tags: ["Gà", "Chiên", "Nước mắm"],
    ingredients: [
      { name: "Cánh gà", amount: "800", unit: "g" },
      { name: "Tỏi", amount: "6", unit: "tép" },
      { name: "Nước mắm", amount: "3", unit: "muỗng" },
      { name: "Đường", amount: "2", unit: "muỗng" },
      { name: "Ớt", amount: "3", unit: "quả" },
    ],
    steps: [
      {
        order: 1,
        title: "Ướp gà",
        description: "Ướp cánh gà với muối, tiêu, bột ngô 15 phút.",
        duration: 15,
      },
      {
        order: 2,
        title: "Chiên giòn",
        description: "Chiên ngập dầu ở 170°C đến vàng giòn.",
        duration: 15,
      },
      {
        order: 3,
        title: "Làm sốt",
        description: "Phi tỏi ớt, thêm nước mắm + đường, cho gà vào đảo đều.",
        duration: 5,
      },
    ],
  },
];

// ─── HTTP CLIENT FACTORY ──────────────────────────────────────────────────────

function createClient(token?: string): AxiosInstance {
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    timeout: 30_000,
  });
}

function createAiClient(): AxiosInstance {
  return axios.create({
    baseURL: AI_BASE_URL,
    headers: {
      "Content-Type": "application/json",
      ...(AI_API_KEY ? { "X-API-Key": AI_API_KEY } : {}),
    },
    timeout: 30_000,
  });
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function log(msg: string) {
  const time = new Date().toLocaleTimeString("vi-VN");
  console.log(`[${time}] ${msg}`);
}

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

// ─── STEP 1: Register + Login ─────────────────────────────────────────────────

async function registerAndLogin(
  index: number,
): Promise<{ token: string; userId: number; email: string }> {
  const email = `seeduser${index}@dishgram.test`;
  const password = "Seed@123456";
  const full_name = `Seed User ${index}`;

  const client = createClient();

  // Try register (may fail if already exists)
  try {
    await client.post("/auth/register", { email, password, full_name });
    log(`  ✓ Đăng ký thành công: ${email}`);
  } catch {
    log(`  ~ Tài khoản đã tồn tại: ${email}, bỏ qua đăng ký`);
  }

  // Login
  const loginRes = await client.post("/auth/login", { email, password });
  const token: string = loginRes.data.accessToken || loginRes.data.access_token;
  const userId: number = loginRes.data.user?.id;

  if (!token) throw new Error(`Không lấy được token cho ${email}`);

  log(`  ✓ Đăng nhập thành công: ${email} (userId=${userId})`);
  return { token, userId, email };
}

// ─── STEP 2: Create Recipe ────────────────────────────────────────────────────

async function createRecipe(
  token: string,
  templateIndex: number,
): Promise<number> {
  const client = createClient(token);
  const template = RECIPE_TEMPLATES[templateIndex % RECIPE_TEMPLATES.length];

  // Append a small suffix to make title unique per user
  const payload = {
    ...template,
    title: `${template.title} (seed)`,
  };

  const res = await client.post("/recipes", payload);
  const recipeId: number = res.data.id || res.data.recipe?.id;
  if (!recipeId) throw new Error("Không lấy được recipe ID từ response");
  return recipeId;
}

// ─── PHASE 3: Simulate interactions ──────────────────────────────────────────

/** Chọn k phần tử ngẫu nhiên không trùng từ mảng */
function sampleRandom<T>(arr: T[], k: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(k, copy.length));
}

const COMMENT_TEXTS = [
  "Trông ngon quá! Mình sẽ thử nấu cuối tuần.",
  "Cảm ơn bạn đã chia sẻ công thức tuyệt vời!",
  "Mình đã thử rồi, ngon thật sự!",
  "Gia đình mình rất thích món này.",
  "Có thể giảm lượng muối không nhỉ?",
  "Lần đầu nấu mà thành công, cảm ơn!",
  "Nhìn hình ảnh đã thấy thèm rồi 😍",
  "Công thức đơn giản mà hiệu quả!",
  "Mình hay làm món này cho bữa sáng.",
  "Thêm một chút gừng nữa sẽ ngon hơn đấy.",
];

async function simulateFollow(
  fromToken: string,
  fromUserId: number,
  toUserId: number,
): Promise<void> {
  const client = createClient(fromToken);
  try {
    await client.post(`/users/${toUserId}/follow`);
    log(`    → Follow: user ${fromUserId} → user ${toUserId}`);
  } catch {
    // Ignore nếu đã follow hoặc follow chính mình
  }
}

async function simulateLike(
  token: string,
  userId: number,
  recipeId: number,
): Promise<void> {
  const client = createClient(token);
  try {
    await client.post(`/recipes/${recipeId}/like`);
    log(`    → Like: user ${userId} → recipe ${recipeId}`);
  } catch {
    // Ignore duplicate
  }
}

async function simulateSave(
  token: string,
  userId: number,
  recipeId: number,
): Promise<void> {
  const client = createClient(token);
  try {
    await client.post(`/recipes/${recipeId}/save`);
    log(`    → Save: user ${userId} → recipe ${recipeId}`);
  } catch {
    // Ignore duplicate
  }
}

async function simulateComment(
  token: string,
  userId: number,
  recipeId: number,
): Promise<void> {
  const client = createClient(token);
  const text = COMMENT_TEXTS[Math.floor(Math.random() * COMMENT_TEXTS.length)];
  try {
    await client.post(`/recipes/${recipeId}/comments`, { content: text });
    log(`    → Comment: user ${userId} → recipe ${recipeId}`);
  } catch {
    // Ignore
  }
}

async function trackInteraction(
  token: string,
  userId: number,
  recipeId: number,
  event: string,
): Promise<void> {
  const client = createClient(token);
  try {
    await client.post("/recommendations/track", {
      recipe_id: recipeId,
      event,
      duration_s: event === "dwell_10s" ? 35 : undefined,
    });
  } catch {
    // Ignore
  }
}

// ─── STEP 3: Call /post/embedding ────────────────────────────────────────────

async function sendEmbedding(
  recipeId: number,
  imageUrl: string,
  title: string,
): Promise<void> {
  const aiClient = createAiClient();
  try {
    const res = await aiClient.post("/post/embedding", {
      post_id: recipeId,
      image_url: imageUrl,
      text: title,
    });
    log(`    → Embedding queued: job_id=${res.data?.job_id ?? "N/A"}`);
  } catch (err: any) {
    const msg = err?.response?.data?.detail ?? err.message;
    log(`    ⚠ Embedding lỗi (recipe ${recipeId}): ${msg}`);
  }
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("═══════════════════════════════════════════════════");
  console.log("  SEED SCRIPT - DishGram Recommendation System     ");
  console.log(`  Backend : ${BASE_URL}`);
  console.log(`  AI      : ${AI_BASE_URL}`);
  console.log("═══════════════════════════════════════════════════\n");

  let totalRecipes = 0;
  let totalEmbeddings = 0;
  const errors: string[] = [];

  // Lưu lại để dùng cho Phase 3
  const accounts: { token: string; userId: number }[] = [];
  const allRecipeIds: number[] = [];

  // ── PHASE 1 + 2: Tạo accounts & recipes ────────────────────────────────────
  console.log("─── PHASE 1+2: Tạo tài khoản & recipes ───────────\n");

  for (let i = 1; i <= TOTAL_ACCOUNTS; i++) {
    log(`\n[Account ${i}/${TOTAL_ACCOUNTS}]`);

    let token: string;
    let userId: number;

    try {
      ({ token, userId } = await registerAndLogin(i));
      accounts.push({ token, userId });
    } catch (err: any) {
      const msg = `Account ${i}: ${err.message}`;
      log(`  ✗ ${msg}`);
      errors.push(msg);
      continue;
    }

    for (let r = 0; r < RECIPES_PER_ACCOUNT; r++) {
      const templateIndex = (i - 1) * RECIPES_PER_ACCOUNT + r;
      const template =
        RECIPE_TEMPLATES[templateIndex % RECIPE_TEMPLATES.length];

      try {
        log(`  [Recipe ${r + 1}/${RECIPES_PER_ACCOUNT}] "${template.title}"`);
        const recipeId = await createRecipe(token, templateIndex);
        totalRecipes++;
        allRecipeIds.push(recipeId);
        log(`    ✓ Recipe tạo thành công: id=${recipeId}`);

        // Gọi embedding ngay sau khi tạo
        await sendEmbedding(recipeId, template.image_url ?? "", template.title);
        totalEmbeddings++;

        await sleep(300);
      } catch (err: any) {
        const msg = `Account ${i}, Recipe ${r + 1}: ${err?.response?.data?.message ?? err.message}`;
        log(`    ✗ ${msg}`);
        errors.push(msg);
      }
    }
  }

  // ── PHASE 3: Mô phỏng tương tác ────────────────────────────────────────────
  console.log("\n─── PHASE 3: Mô phỏng tương tác ─────────────────\n");
  log(
    `Tổng accounts: ${accounts.length}, tổng recipes: ${allRecipeIds.length}`,
  );

  let totalFollows = 0;
  let totalLikes = 0;
  let totalSaves = 0;
  let totalComments = 0;

  for (const { token, userId } of accounts) {
    log(`\n[Interactions for user ${userId}]`);

    // Follow ngẫu nhiên các user khác
    const otherUsers = accounts
      .map((a) => a.userId)
      .filter((id) => id !== userId);
    const usersToFollow = sampleRandom(otherUsers, FOLLOWS_PER_USER);
    for (const targetId of usersToFollow) {
      await simulateFollow(token, userId, targetId);
      await sleep(100);
      totalFollows++;
    }

    // Like ngẫu nhiên
    const recipesToLike = sampleRandom(allRecipeIds, LIKES_PER_USER);
    for (const recipeId of recipesToLike) {
      await simulateLike(token, userId, recipeId);
      await trackInteraction(token, userId, recipeId, "like");
      await sleep(100);
      totalLikes++;
    }

    // Save ngẫu nhiên
    const recipesToSave = sampleRandom(allRecipeIds, SAVES_PER_USER);
    for (const recipeId of recipesToSave) {
      await simulateSave(token, userId, recipeId);
      await trackInteraction(token, userId, recipeId, "save");
      await sleep(100);
      totalSaves++;
    }

    // Comment ngẫu nhiên
    const recipesToComment = sampleRandom(allRecipeIds, COMMENTS_PER_USER);
    for (const recipeId of recipesToComment) {
      await simulateComment(token, userId, recipeId);
      await trackInteraction(token, userId, recipeId, "dwell_10s");
      await sleep(150);
      totalComments++;
    }
  }

  // ─── SUMMARY ───────────────────────────────────────────────────────────────
  console.log("\n═══════════════════════════════════════════════════");
  console.log("  KẾT QUẢ");
  console.log("═══════════════════════════════════════════════════");
  console.log(`  ✓ Accounts tạo thành công    : ${accounts.length}`);
  console.log(`  ✓ Recipes tạo thành công     : ${totalRecipes}`);
  console.log(`  ✓ Embedding đã gửi           : ${totalEmbeddings}`);
  console.log(`  ✓ Follows                    : ${totalFollows}`);
  console.log(`  ✓ Likes                      : ${totalLikes}`);
  console.log(`  ✓ Saves                      : ${totalSaves}`);
  console.log(`  ✓ Comments                   : ${totalComments}`);

  if (errors.length > 0) {
    console.log(`\n  ✗ Lỗi (${errors.length}):`);
    errors.forEach((e) => console.log(`     - ${e}`));
  } else {
    console.log("  ✓ Không có lỗi nào!");
  }

  console.log("═══════════════════════════════════════════════════\n");
}

main().catch((err) => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});

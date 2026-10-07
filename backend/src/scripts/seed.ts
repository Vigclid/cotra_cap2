/**
 * Script seed dữ liệu: `npm run seed`
 *  1. Xoá sạch collection `lessons` rồi nạp lại 10 chặng SGK Ngữ Văn 6 (lessonsData).
 *  2. Tạo (lại) 3 tài khoản mẫu admin / teacher / student để test API.
 * Chạy lại bao nhiêu lần cũng được, không sinh dữ liệu trùng.
 */
import { connectDB, disconnectDB } from "../config/db";
import { Lesson } from "../models/Lesson";
import { QuizQuestion } from "../models/QuizQuestion";
import { SpellingQuestion } from "../models/SpellingQuestion";
import { StudentProgress } from "../models/StudentProgress";
import { TypingText } from "../models/TypingText";
import { User, type Role } from "../models/User";
import { quizSeed, spellingSeed, typingSeed } from "./gamesData";
import { lessonsData } from "./lessonsData";

const SAMPLE_USERS: { username: string; password: string; fullName: string; role: Role }[] = [
  { username: "admin", password: "admin123", fullName: "Quản trị viên", role: "admin" },
  { username: "teacher", password: "teacher123", fullName: "Cô Nguyễn Thị Văn", role: "teacher" },
  { username: "student", password: "student123", fullName: "Trần Minh An", role: "student" },
];

async function seedLessons() {
  const { deletedCount } = await Lesson.deleteMany({});
  console.log(`🧹 Đã xoá ${deletedCount} bài học cũ`);

  // Frontend dùng `id`, DB dùng `lessonId`.
  const docs = lessonsData.map(({ id, ...lesson }) => ({ lessonId: id, ...lesson }));
  const inserted = await Lesson.insertMany(docs);
  console.log(`📚 Đã thêm ${inserted.length} bài học`);
}

async function seedUsers() {
  const usernames = SAMPLE_USERS.map((u) => u.username);
  const oldUsers = await User.find({ username: { $in: usernames } }).select("_id").lean();
  await StudentProgress.deleteMany({ studentId: { $in: oldUsers.map((u) => u._id) } });
  await User.deleteMany({ username: { $in: usernames } });

  for (const data of SAMPLE_USERS) {
    // Dùng create() (không dùng insertMany) để hook pre("save") hash mật khẩu.
    const user = await User.create(data);
    if (user.role === "student") await StudentProgress.create({ studentId: user._id });
  }

  console.log("👤 Tài khoản mẫu:");
  console.table(SAMPLE_USERS.map(({ username, password, role }) => ({ username, password, role })));
}

/** Chỉ thêm đề mẫu khi collection còn trống – chạy seed lại không xoá đề giáo viên đã sửa. */
async function seedIfEmpty(label: string, count: () => Promise<number>, insert: () => Promise<unknown[]>) {
  const existing = await count();
  if (existing > 0) {
    console.log(`🎮 ${label}: giữ ${existing} câu đã có`);
    return;
  }
  const inserted = await insert();
  console.log(`🎮 ${label}: đã thêm ${inserted.length} câu mẫu`);
}

async function seedGames() {
  await seedIfEmpty(
    "Cảnh sát chính tả",
    () => SpellingQuestion.countDocuments(),
    () => SpellingQuestion.insertMany(spellingSeed),
  );
  await seedIfEmpty(
    "Bàn phím siêu tốc",
    () => TypingText.countDocuments(),
    () => TypingText.insertMany(typingSeed),
  );
  await seedIfEmpty(
    "Tác giả – Tác phẩm",
    () => QuizQuestion.countDocuments(),
    () => QuizQuestion.insertMany(quizSeed),
  );
}

async function main() {
  await connectDB();
  const gamesOnly = process.argv.includes("--games");
  if (!gamesOnly) {
    await seedLessons();
    await seedUsers();
  }
  await seedGames();
  console.log("✅ Seed hoàn tất");
}

main()
  .catch((err) => {
    console.error("❌ Seed thất bại:", err);
    process.exitCode = 1;
  })
  .finally(disconnectDB);

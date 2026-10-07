import bcrypt from "bcrypt";
import { Schema, model, type Model } from "mongoose";
import { getLevel } from "../utils/levels";

export const ROLES = ["student", "teacher", "admin"] as const;
export type Role = (typeof ROLES)[number];

const SALT_ROUNDS = 10;

export interface IUser {
  username: string;
  /** Luôn là chuỗi đã hash bằng bcrypt – không bao giờ lưu mật khẩu thô. */
  password: string;
  fullName: string;
  role: Role;
  // ----- Các trường gamification, chỉ có ý nghĩa với role "student" -----
  exp: number;
  /** Chỉ số cấp độ (0 → 4), tự tính lại từ `exp` mỗi khi lưu. */
  level: number;
  badges: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface IUserMethods {
  comparePassword(candidate: string): Promise<boolean>;
}

type UserModel = Model<IUser, object, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    username: {
      type: String,
      required: [true, "Vui lòng nhập tên đăng nhập"],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 32,
      match: [/^[a-z0-9_.]+$/, "Tên đăng nhập chỉ gồm chữ thường, số, dấu chấm hoặc gạch dưới"],
    },
    // select: false → mặc định mọi truy vấn KHÔNG trả về password, phải gọi .select("+password") khi cần.
    password: { type: String, required: true, minlength: 6, select: false },
    fullName: { type: String, required: [true, "Vui lòng nhập họ tên"], trim: true, maxlength: 100 },
    role: { type: String, enum: ROLES, default: "student" },
    exp: { type: Number, default: 0, min: 0 },
    level: { type: Number, default: 0, min: 0 },
    badges: { type: [String], default: [] },
  },
  { timestamps: true },
);

userSchema.index({ role: 1, exp: -1 });

/**
 * Hook chạy trước khi save():
 *  - Hash lại mật khẩu nếu nó vừa được tạo/đổi.
 *  - Đồng bộ `level` theo `exp` để không bao giờ lệch nhau.
 * Lưu ý: hook KHÔNG chạy với insertMany/updateOne, nên tạo user luôn dùng create()/save().
 */
userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
  }
  if (this.isModified("exp")) {
    this.level = getLevel(this.exp).index;
  }
});

userSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export const User = model<IUser, UserModel>("User", userSchema);

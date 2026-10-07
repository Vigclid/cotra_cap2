import mongoose from "mongoose";
import { env } from "./env";

/** Kết nối MongoDB. Ném lỗi để nơi gọi (server/seed) quyết định thoát tiến trình. */
export async function connectDB(): Promise<void> {
  mongoose.connection.on("disconnected", () => console.warn("⚠️  MongoDB đã ngắt kết nối"));
  await mongoose.connect(env.mongoUri);
  console.log(`✅ Đã kết nối MongoDB: ${mongoose.connection.name}`);
}

export async function disconnectDB(): Promise<void> {
  mongoose.connection.removeAllListeners("disconnected");
  await mongoose.disconnect();
}

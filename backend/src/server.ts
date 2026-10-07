import cors from "cors";
import express from "express";
import helmet from "helmet";
import { connectDB, disconnectDB } from "./config/db";
import { env, isAllowedOrigin } from "./config/env";
import { errorHandler, notFound } from "./middlewares/errorHandler";
import apiRoutes from "./routes";

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors({
    origin(origin, callback) {
      callback(null, isAllowedOrigin(origin));
    },
  }),
);
app.use(express.json({ limit: "1mb" }));

app.use("/api", apiRoutes);

// Hai middleware này phải đứng cuối cùng.
app.use(notFound);
app.use(errorHandler);

async function bootstrap() {
  await connectDB();
  const server = app.listen(env.port, () => {
    console.log(`🚀 Trạm Sạc Ngữ Văn API chạy tại http://localhost:${env.port}/api`);
  });

  // Tắt êm: ngừng nhận request mới, đóng kết nối DB rồi mới thoát.
  const shutdown = (signal: string) => {
    console.log(`\n${signal} → đang tắt server...`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

bootstrap().catch((err) => {
  console.error("❌ Không thể khởi động server:", err);
  process.exit(1);
});

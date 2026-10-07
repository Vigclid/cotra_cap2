const path = require("path");
const { spawnSync } = require("child_process");

function run(command, args, env = process.env) {
  const result = spawnSync(command, args, { stdio: "inherit", env });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

// Render's image includes a global `tsc`. The build can hit that binary when
// this package's own node_modules has no @types/node. Reinstall here, then
// compile with the local TypeScript.
if (process.env.RENDER === "true") {
  run("npm", ["ci", "--include=dev"], {
    ...process.env,
    npm_config_production: "false",
  });
}

const tsc = path.join(__dirname, "..", "node_modules", "typescript", "bin", "tsc");
run(process.execPath, [tsc]);

import os from "os";
import { spawn } from "child_process";

function getLocalIp() {
  const nets = os.networkInterfaces();

  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }

  return "localhost";
}

const ip = getLocalIp();

console.log("");
console.log(`Local:   http://localhost:3000`);
console.log(`Network: http://${ip}:3000`);
console.log("");

spawn("npx", ["next", "dev", "-H", "0.0.0.0"], {
  stdio: "inherit",
  shell: true,
});
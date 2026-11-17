// Prints the values for ADMIN_PASSWORD_HASH and ADMIN_SESSION_SECRET.
// Usage: npm run admin:hash   (you are asked for the password; nothing is saved)
import { randomBytes, scryptSync } from "node:crypto";
import { createInterface } from "node:readline";

function ask(question) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    // Hide what is typed.
    rl._writeToOutput = (s) => {
      if (s.startsWith(question)) process.stdout.write(question);
    };
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
  });
}

const pw = process.argv[2] ?? (await ask("Admin password: "));
if (!pw || pw.length < 12) {
  console.error("Use a password of at least 12 characters.");
  process.exit(1);
}
const salt = randomBytes(16);
const hash = `${salt.toString("hex")}:${scryptSync(pw, salt, 64).toString("hex")}`;
console.log(`\nADMIN_PASSWORD_HASH=${hash}`);
console.log(`ADMIN_SESSION_SECRET=${randomBytes(32).toString("base64url")}`);
console.log("\nAdd both (plus ADMIN_USERNAME) to .env.local and to Vercel, then redeploy.");

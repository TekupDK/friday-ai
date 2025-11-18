import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { promisify } from "util";

const execAsync = promisify(exec);

type LogoConfig = {
  companyName: string;
  colors?: string;
  style?: string;
  industry?: string;
  steps?: number;
  cfg?: number;
  height?: number;
  width?: number;
  baseDir?: string;
  loraPath?: string;
};

export async function generateLogoWithQwen(config: LogoConfig): Promise<string> {
  const script = path.join(process.cwd(), "scripts", "python", "generate_logo.py");
  const outName = `${config.companyName.toLowerCase().replace(/\s+/g, "-")}-logo.png`;
  const args = [
    `--company "${config.companyName}"`,
    config.colors ? `--colors "${config.colors}"` : "",
    config.style ? `--style "${config.style}"` : "",
    config.industry ? `--industry "${config.industry}"` : "",
    config.steps ? `--steps ${config.steps}` : "",
    config.cfg ? `--cfg ${config.cfg}` : "",
    config.height ? `--height ${config.height}` : "",
    config.width ? `--width ${config.width}` : "",
    config.baseDir ? `--base_dir "${config.baseDir}"` : "",
    config.loraPath ? `--lora_path "${config.loraPath}"` : "",
    `--output "${outName}"`,
  ]
    .filter(Boolean)
    .join(" ");

  const cmd = `python "${script}" ${args}`;
  const { stdout, stderr } = await execAsync(cmd, { cwd: process.cwd() });
  if (stderr) {
    // Non-blocking: diffusers often prints to stderr; rely on exit code for failure
    // Keep for operator visibility
    console.warn(stderr);
  }
  const outPath = path.join(process.cwd(), "client", "public", outName);
  if (!fs.existsSync(outPath)) {
    throw new Error(`Logo not found at ${outPath}. Output:\n${stdout}`);
  }
  return outPath;
}
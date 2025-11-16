import argparse
import os
import sys
from pathlib import Path

def _eprint(msg: str):
    print(msg, file=sys.stderr)

def _has_cuda():
    try:
        import torch
        return torch.cuda.is_available()
    except Exception:
        return False

def build_prompt(company: str, colors: str, style: str, industry: str) -> str:
    palette = ", ".join([c.strip() for c in colors.split(",") if c.strip()]) if colors else "blue and teal"
    base = (
        f"professional {industry} company logo, {style} design, "
        f"colors {palette}, text \"{company}\" in modern sans-serif font, "
        "clean vector style, white background, centered composition, high quality"
    )
    return base

def main():
    parser = argparse.ArgumentParser(prog="generate_logo", add_help=True)
    parser.add_argument("--company", required=True)
    parser.add_argument("--colors", default="#00897b,#00acc1")
    parser.add_argument("--style", default="minimalist")
    parser.add_argument("--industry", default="cleaning")
    parser.add_argument("--prompt", default=None)
    parser.add_argument("--steps", type=int, default=4)
    parser.add_argument("--cfg", type=float, default=1.0)
    parser.add_argument("--height", type=int, default=1024)
    parser.add_argument("--width", type=int, default=1024)
    parser.add_argument("--device", default="auto")
    parser.add_argument("--base_dir", default=str(Path("models/Qwen-Image-base")))
    parser.add_argument("--lora_path", default=str(Path("models/Lightning/Qwen-Image-Lightning-4steps-V2.0.safetensors")))
    parser.add_argument("--output", default=None)

    args = parser.parse_args()

    try:
        from diffusers import DiffusionPipeline
        import torch
    except Exception:
        _eprint("diffusers/torch is not installed. Run: pip install diffusers transformers accelerate safetensors torch")
        sys.exit(1)

    device = (
        "cuda" if (args.device == "auto" and _has_cuda()) else (args.device if args.device != "auto" else "cpu")
    )

    base_dir = Path(args.base_dir)
    lora_path = Path(args.lora_path)
    if not base_dir.exists():
        _eprint(f"Base model not found: {base_dir}. Download with huggingface-cli or set --base_dir.")
        sys.exit(2)
    if not lora_path.exists():
        _eprint(f"Lightning LoRA not found: {lora_path}. Download with huggingface-cli or set --lora_path.")
        sys.exit(3)

    dtype = torch.float16 if device == "cuda" else torch.float32

    try:
        pipe = DiffusionPipeline.from_pretrained(str(base_dir), torch_dtype=dtype)
        pipe = pipe.to(device)
        pipe.load_lora_weights(str(lora_path))
    except Exception as e:
        _eprint(f"Failed to load pipeline: {e}")
        sys.exit(4)

    prompt = args.prompt or build_prompt(args.company, args.colors, args.style, args.industry)

    try:
        image = pipe(
            prompt=prompt,
            num_inference_steps=int(args.steps),
            guidance_scale=float(args.cfg),
            height=int(args.height),
            width=int(args.width),
        ).images[0]
    except Exception as e:
        _eprint(f"Generation failed: {e}")
        sys.exit(5)

    out_name = args.output or f"{args.company.lower().replace(' ', '-')}-logo.png"
    out_path = Path.cwd() / "client" / "public" / out_name
    out_path.parent.mkdir(parents=True, exist_ok=True)
    try:
        image.save(str(out_path))
        print(f"✅ Logo saved: {out_path}")
    except Exception as e:
        _eprint(f"Saving failed: {e}")
        sys.exit(6)

if __name__ == "__main__":
    main()
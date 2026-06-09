from __future__ import annotations

import json
import shutil
from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parent
DIST = ROOT / "dist"
ASSETS = ROOT / "assets"
UPLOADS = ASSETS / "uploads"
DIST_ASSETS = DIST / "assets"
IMAGE_EXTS = {".jpg", ".jpeg", ".png"}
PAGES_MAX_ASSET_BYTES = 25 * 1024 * 1024
YOUTUBE_VIDEO_FILES = {
    "0-02-05-0e3bcc38283e486b1e62cbc6c1ee06d15fdbdb0a59d511de591992d7a8d4e192_f6c8a18682fe0a7.mp4",
    "0-02-05-51a56697fc37d08e3a5f8d3547777e3406f0767d361a8669b8906d7d84ffbb88_46d17df1a6a3a7a8.mp4",
    "0-02-05-64fa666c0efa64c32db3089c87491c7f5364d7c1bbe9a18fbd7b7b00c6a6ddb6_1083a4ebf27f21a5.mp4",
    "0-02-05-d78b2bc10969a9ee527e8b4f17301a67d35b8c0c67bffae766fab5122ffa24c4_3e523bd8aacf29c1.mp4",
}
EXTERNAL_ORIGINAL_URLS = {
    "Топ 10 най мащабнипожари.pptx": "https://docs.google.com/presentation/d/1r7AgWpYV_waWXQzWFBUL4h57-1V_Thfr/edit?usp=drive_link&ouid=115949256847589915994&rtpof=true&sd=true",
    "КАК ДА ОПАЗИМ РЕКИТЕ(1).pptx": "https://docs.google.com/presentation/d/1GWJ6wHkEuPmKqefywkxANtdT7pkLbYJy/edit?usp=drive_link&ouid=115949256847589915994&rtpof=true&sd=true",
    "как да опазим гоо.pdf": "https://drive.google.com/file/d/1CnTHKTu1oiYmSi4_nWSIeZvK2omRzIQe/view?usp=drive_link",
}


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def write_json(path: Path, data) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def file_size(path: Path) -> int:
    return path.stat().st_size if path.exists() else 0


def optimize_image(src: Path, dest: Path, max_width: int = 1800, quality: int = 78) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(src) as im:
        im = ImageOps.exif_transpose(im)
        if im.mode not in ("RGB", "RGBA"):
            im = im.convert("RGB")
        if im.width > max_width:
            ratio = max_width / im.width
            im = im.resize((max_width, max(1, int(im.height * ratio))), Image.Resampling.LANCZOS)
        if im.mode == "RGBA":
            background = Image.new("RGB", im.size, "white")
            background.paste(im, mask=im.split()[-1])
            im = background
        im.save(dest, "WEBP", quality=quality, method=6)


def copy_tree_filtered() -> None:
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir()
    for item in ["index.html", "styles.css", "script.js"]:
        shutil.copy2(ROOT / item, DIST / item)
    for folder in ["scratch", "water-resources", "forest-fires", "healthy-eating", "gallery", "presentations", "downloads", "contacts"]:
        shutil.copytree(ROOT / folder, DIST / folder)
    if (ASSETS / "vendor").exists():
        shutil.copytree(ASSETS / "vendor", DIST_ASSETS / "vendor")
    shutil.copytree(ASSETS / "rendered-pdfs", DIST_ASSETS / "rendered-pdfs")


def build_uploads() -> dict:
    original_manifest = read_json(UPLOADS / "manifest.json")
    new_manifest = []
    stats = {
        "originalImageBytes": 0,
        "optimizedImageBytes": 0,
        "copiedBytes": 0,
        "images": 0,
        "files": 0,
        "skippedPagesLimitFiles": 0,
    }
    for item in original_manifest:
        src_rel = item["path"].lstrip("/")
        src = ROOT / src_rel
        ext = item["ext"].lower()
        new_item = dict(item)
        if ext in IMAGE_EXTS:
            rel = Path(src_rel).relative_to("assets/uploads")
            dest = DIST_ASSETS / "uploads" / rel.with_suffix(".webp")
            optimize_image(src, dest)
            new_item["path"] = "/" + dest.relative_to(DIST).as_posix()
            new_item["file"] = dest.name
            new_item["ext"] = ".webp"
            new_item["originalPath"] = item["path"]
            new_item["originalSize"] = item["size"]
            new_item["size"] = file_size(dest)
            stats["originalImageBytes"] += item["size"]
            stats["optimizedImageBytes"] += new_item["size"]
            stats["images"] += 1
        elif ext == ".mp4" and item["file"] in YOUTUBE_VIDEO_FILES:
            new_item["external"] = "youtube"
        elif item["size"] > PAGES_MAX_ASSET_BYTES:
            new_item["external"] = "cloudflare-pages-limit"
            new_item["originalPath"] = item["path"]
            if item["file"] in EXTERNAL_ORIGINAL_URLS:
                new_item["externalUrl"] = EXTERNAL_ORIGINAL_URLS[item["file"]]
            stats["skippedPagesLimitFiles"] += 1
        else:
            rel = Path(src_rel).relative_to("assets/uploads")
            dest = DIST_ASSETS / "uploads" / rel
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, dest)
            new_item["path"] = "/" + dest.relative_to(DIST).as_posix()
            new_item["size"] = file_size(dest)
            stats["copiedBytes"] += new_item["size"]
        new_manifest.append(new_item)
        stats["files"] += 1
    write_json(DIST_ASSETS / "uploads" / "manifest.json", new_manifest)
    return stats


def folder_size(path: Path) -> int:
    return sum(file.stat().st_size for file in path.rglob("*") if file.is_file())


def main() -> None:
    copy_tree_filtered()
    stats = build_uploads()
    stats["distBytes"] = folder_size(DIST)
    stats["sourceBytes"] = folder_size(ROOT) - stats["distBytes"]
    write_json(DIST / "optimization-report.json", stats)
    print(json.dumps({
        "distMB": round(stats["distBytes"] / 1024 / 1024, 2),
        "images": stats["images"],
        "originalImagesMB": round(stats["originalImageBytes"] / 1024 / 1024, 2),
        "optimizedImagesMB": round(stats["optimizedImageBytes"] / 1024 / 1024, 2),
        "files": stats["files"],
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

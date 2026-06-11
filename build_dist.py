from __future__ import annotations

import json
import shutil
import hashlib
import subprocess
import tempfile
from pathlib import Path

from PIL import Image, ImageOps

try:
    import pillow_heif

    pillow_heif.register_heif_opener()
except Exception:
    pillow_heif = None


ROOT = Path(__file__).resolve().parent
DIST = ROOT / "dist"
ASSETS = ROOT / "assets"
UPLOADS = ASSETS / "uploads"
RENDERED_PDFS = ASSETS / "rendered-pdfs"
DIST_ASSETS = DIST / "assets"
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".heic", ".heif"}
OFFICE_EXTS = {".docx", ".pptx"}
PAGES_MAX_ASSET_BYTES = 25 * 1024 * 1024
SOFFICE = Path(r"C:\Program Files\LibreOffice\program\soffice.exe")
FFMPEG_CANDIDATES = [
    Path(r"C:\Users\halor\AppData\Local\Microsoft\WinGet\Packages\yt-dlp.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-N-124716-g054dffd133-win64-gpl\bin\ffmpeg.exe"),
]
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


def clean_stem(path: Path) -> str:
    return path.stem.strip()


def make_upload_manifest() -> list[dict]:
    items = []
    for src in sorted(UPLOADS.rglob("*"), key=lambda p: p.as_posix().lower()):
        if not src.is_file() or src.name.lower() == "manifest.json":
            continue
        rel = src.relative_to(ROOT).as_posix()
        stat = src.stat()
        items.append({
            "path": "/" + rel,
            "name": clean_stem(src),
            "file": src.name,
            "ext": src.suffix.lower(),
            "size": stat.st_size,
        })
    write_json(UPLOADS / "manifest.json", items)
    return items


def rendered_name(original_path: str) -> str:
    digest = hashlib.sha1(original_path.encode("utf-8")).hexdigest()[:12]
    return f"rendered-{digest}.pdf"


def companion_pdf(item: dict, manifest: list[dict]) -> str:
    original = Path(item["path"])
    folder = original.parent.as_posix().lower()
    stem = original.stem.lower()
    candidates = []
    for candidate in manifest:
        if candidate["ext"] != ".pdf":
            continue
        candidate_path = Path(candidate["path"])
        if candidate_path.parent.as_posix().lower() != folder:
            continue
        candidate_stem = candidate_path.stem.lower()
        if candidate_stem == stem or candidate_stem.startswith(stem) or stem.startswith(candidate_stem):
            candidates.append(candidate)
    if not candidates:
        return ""
    candidates.sort(key=lambda pdf: (abs(len(pdf["name"]) - len(item["name"])), pdf["size"]))
    return candidates[0]["path"]


def convert_office_to_pdf(src: Path, original_path: str) -> str:
    if not SOFFICE.exists():
        return ""
    RENDERED_PDFS.mkdir(parents=True, exist_ok=True)
    dest = RENDERED_PDFS / rendered_name(original_path)
    if dest.exists() and dest.stat().st_mtime >= src.stat().st_mtime:
        return "/" + dest.relative_to(ROOT).as_posix()
    with tempfile.TemporaryDirectory() as tmp:
        tmpdir = Path(tmp)
        result = subprocess.run([
            str(SOFFICE),
            "--headless",
            "--convert-to",
            "pdf",
            "--outdir",
            str(tmpdir),
            str(src),
        ], cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=120)
        if result.returncode != 0:
            return ""
        outputs = list(tmpdir.glob("*.pdf"))
        if not outputs:
            return ""
        shutil.copy2(outputs[0], dest)
    return "/" + dest.relative_to(ROOT).as_posix()


def compress_pdf_preview(src: Path, original_path: str) -> str:
    try:
        import fitz
    except Exception:
        return ""
    RENDERED_PDFS.mkdir(parents=True, exist_ok=True)
    dest = RENDERED_PDFS / rendered_name(original_path)
    if dest.exists() and dest.stat().st_mtime >= src.stat().st_mtime and dest.stat().st_size <= PAGES_MAX_ASSET_BYTES:
        return "/" + dest.relative_to(ROOT).as_posix()
    doc = fitz.open(src)
    out = fitz.open()
    matrix = fitz.Matrix(2, 2)
    for page in doc:
        pix = page.get_pixmap(matrix=matrix, alpha=False)
        image = pix.tobytes("jpeg", jpg_quality=72)
        new_page = out.new_page(width=page.rect.width, height=page.rect.height)
        new_page.insert_image(new_page.rect, stream=image)
    out.save(dest, garbage=4, deflate=True)
    out.close()
    doc.close()
    if dest.stat().st_size > PAGES_MAX_ASSET_BYTES:
        dest.unlink(missing_ok=True)
        return ""
    return "/" + dest.relative_to(ROOT).as_posix()


def sync_rendered_pdfs(manifest: list[dict]) -> None:
    entries = []
    for item in manifest:
        if item["ext"] not in OFFICE_EXTS:
            continue
        pdf_path = companion_pdf(item, manifest)
        note = "Matching PDF supplied in uploads."
        if not pdf_path:
            src = ROOT / item["path"].lstrip("/")
            pdf_path = convert_office_to_pdf(src, item["path"])
            note = "Rendered by LibreOffice headless export."
        if not pdf_path:
            continue
        entries.append({
            "originalPath": item["path"],
            "pdfPath": pdf_path,
            "title": item["name"],
            "note": note,
        })
    for item in manifest:
        if item["ext"] != ".pdf" or item["size"] <= PAGES_MAX_ASSET_BYTES:
            continue
        if item["file"] in EXTERNAL_ORIGINAL_URLS:
            continue
        src = ROOT / item["path"].lstrip("/")
        pdf_path = compress_pdf_preview(src, item["path"])
        if not pdf_path:
            continue
        entries.append({
            "originalPath": item["path"],
            "pdfPath": pdf_path,
            "title": item["name"],
            "note": "Compressed web-view PDF generated from oversized original.",
        })
    write_json(RENDERED_PDFS / "manifest.json", entries)


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


def ffmpeg_path() -> Path | None:
    for candidate in FFMPEG_CANDIDATES:
        if candidate.exists():
            return candidate
    return None


def convert_heic_with_ffmpeg(src: Path, dest: Path) -> bool:
    ffmpeg = ffmpeg_path()
    if not ffmpeg:
        return False
    dest.parent.mkdir(parents=True, exist_ok=True)
    result = subprocess.run([
        str(ffmpeg),
        "-y",
        "-i",
        str(src),
        "-vf",
        "scale='min(1800,iw)':-2",
        "-compression_level",
        "6",
        "-quality",
        "78",
        str(dest),
    ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=90)
    return result.returncode == 0 and dest.exists()


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
    shutil.copytree(RENDERED_PDFS, DIST_ASSETS / "rendered-pdfs")


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
            if ext in {".heic", ".heif"} and pillow_heif is None:
                rel = Path(src_rel).relative_to("assets/uploads")
                dest = DIST_ASSETS / "uploads" / rel.with_suffix(".webp")
                if not convert_heic_with_ffmpeg(src, dest):
                    new_item["external"] = "unsupported-image-format"
                    new_manifest.append(new_item)
                    stats["files"] += 1
                    continue
                new_item["path"] = "/" + dest.relative_to(DIST).as_posix()
                new_item["file"] = dest.name
                new_item["ext"] = ".webp"
                new_item["originalPath"] = item["path"]
                new_item["originalSize"] = item["size"]
                new_item["size"] = file_size(dest)
                stats["originalImageBytes"] += item["size"]
                stats["optimizedImageBytes"] += new_item["size"]
                stats["images"] += 1
                new_manifest.append(new_item)
                stats["files"] += 1
                continue
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
    manifest = make_upload_manifest()
    sync_rendered_pdfs(manifest)
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

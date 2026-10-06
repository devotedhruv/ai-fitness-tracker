#!/usr/bin/env python3
"""
Bulk Exercise Media Offline Downloader Utility
===============================================
Downloads animated 3D movement guide GIFs and thumbnails from the exercises dataset
into a local folder for offline bundling or archiving.

Usage:
  python scripts/download_exercise_media.py --limit 10
  python scripts/download_exercise_media.py --output-dir ../frontend/assets/exercise_media/
"""

import os
import sys
import json
import argparse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Dict, Any, Tuple

CDN_BASE = "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/"


def download_single_asset(url: str, dest_path: str) -> Tuple[bool, str, int]:
    """Download single remote asset to local disk if not already present."""
    if os.path.exists(dest_path) and os.path.getsize(dest_path) > 0:
        return True, dest_path, os.path.getsize(dest_path)

    os.makedirs(os.path.dirname(os.path.abspath(dest_path)), exist_ok=True)
    temp_path = f"{dest_path}.tmp"

    try:
        req = urllib.request.Request(url, headers={"User-Agent": "FitTrack-OfflineDownloader/1.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            if resp.status == 200:
                with open(temp_path, "wb") as f:
                    content = resp.read()
                    f.write(content)
                os.replace(temp_path, dest_path)
                return True, dest_path, len(content)
            else:
                return False, f"HTTP {resp.status}", 0
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        return False, str(e), 0


def main():
    parser = argparse.ArgumentParser(description="Download exercise demonstration videos/GIFs for offline use.")
    parser.add_argument("--catalog", default="data/exercises.json", help="Path to exercises.json")
    parser.add_argument("--output-dir", default="data/media", help="Destination folder for offline media")
    parser.add_argument("--limit", type=int, default=None, help="Limit number of exercises to download (for testing)")
    parser.add_argument("--concurrency", type=int, default=8, help="Number of concurrent download threads")
    parser.add_argument("--media-type", choices=["all", "gifs", "images"], default="gifs", help="Type of assets to download")

    args = parser.parse_args()

    if not os.path.exists(args.catalog):
        print(f"[-] Catalog file not found: {args.catalog}", file=sys.stderr)
        sys.exit(1)

    with open(args.catalog, "r", encoding="utf-8") as f:
        exercises = json.load(f)

    if args.limit:
        exercises = exercises[:args.limit]

    print(f"[*] Loaded {len(exercises)} exercises from catalog.")
    print(f"[*] Target media type : {args.media_type}")
    print(f"[*] Destination dir   : {os.path.abspath(args.output_dir)}")
    print(f"[*] Concurrency       : {args.concurrency} worker threads\n")

    tasks = []
    for ex in exercises:
        ext_id = ex.get("id", "0000")
        name = ex.get("name", "unknown")

        if args.media_type in ["all", "gifs"]:
            gif_rel = ex.get("gif_url")
            if gif_rel:
                filename = os.path.basename(gif_rel)
                full_url = f"{CDN_BASE}{gif_rel}" if not gif_rel.startswith("http") else gif_rel
                dest = os.path.join(args.output_dir, "videos", filename)
                tasks.append((full_url, dest, f"{name} (GIF)"))

        if args.media_type in ["all", "images"]:
            img_rel = ex.get("image")
            if img_rel:
                filename = os.path.basename(img_rel)
                full_url = f"{CDN_BASE}{img_rel}" if not img_rel.startswith("http") else img_rel
                dest = os.path.join(args.output_dir, "images", filename)
                tasks.append((full_url, dest, f"{name} (Thumb)"))

    total_tasks = len(tasks)
    print(f"[*] Total download tasks queued: {total_tasks}")

    completed = 0
    failed = 0
    total_bytes = 0

    with ThreadPoolExecutor(max_workers=args.concurrency) as executor:
        future_map = {
            executor.submit(download_single_asset, url, dest): (url, dest, desc)
            for url, dest, desc in tasks
        }

        for future in as_completed(future_map):
            url, dest, desc = future_map[future]
            try:
                success, msg, size = future.result()
                if success:
                    completed += 1
                    total_bytes += size
                else:
                    failed += 1
                    print(f"    [!] Failed {desc} ({url}): {msg}")
            except Exception as e:
                failed += 1
                print(f"    [!] Exception on {desc}: {e}")

            if (completed + failed) % 25 == 0 or (completed + failed) == total_tasks:
                progress = ((completed + failed) / total_tasks) * 100
                mb_downloaded = total_bytes / (1024 * 1024)
                print(f"    -> Progress: {completed + failed}/{total_tasks} ({progress:.1f}%) | {mb_downloaded:.2f} MB")

    total_mb = total_bytes / (1024 * 1024)
    print("\n================ OFFLINE DOWNLOAD SUMMARY ================")
    print(f"Total Tasks Completed : {completed} / {total_tasks}")
    print(f"Failed Downloads      : {failed}")
    print(f"Total Size on Disk    : {total_mb:.2f} MB")
    print(f"Destination Directory : {os.path.abspath(args.output_dir)}")
    print("==========================================================\n")


if __name__ == "__main__":
    main()

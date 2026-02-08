import shutil
import sys
from pathlib import Path
import os

# Add current directory to sys.path to allow importing convert_builtin_md
current_dir = Path(__file__).parent
sys.path.append(str(current_dir))

from convert_builtin_md import convert_markdown


def main():
    base_dir = Path(r"c:\Users\How\OneDrive\Documents\XQ chatbot\說明")

    # Only process these files
    files_to_process = [
        "系統.md",
        "報價.md",
        "資料.md",
        "選股.md",
        "關鍵字.md",
        "內建.md",
    ]

    print("🚀 Starting batch documentation refactoring...")

    for filename in files_to_process:
        file_path = base_dir / filename
        backup_path = file_path.with_suffix(".md.backup")

        print(f"\n📂 Processing {filename}...")

        # 1. Backup Handling (Safety First!)
        # Check if we have a valid backup. If so, USE IT.
        # If not, try to create one from the original, BUT ONLY IF original is healthy.

        has_valid_backup = False
        if backup_path.exists() and backup_path.stat().st_size > 100:
            has_valid_backup = True
            print(f"  ✅ Found existing valid backup: {backup_path.name}")

        if not has_valid_backup:
            if file_path.exists() and file_path.stat().st_size > 100:
                try:
                    shutil.copy2(file_path, backup_path)
                    print(f"  ✅ Created new backup from original: {backup_path.name}")
                    has_valid_backup = True
                except Exception as e:
                    print(f"  ❌ Backup creation failed: {e}")
                    continue
            else:
                print(
                    f"  ⚠️ Original file {filename} seems empty/missing and no backup exists. Skipping."
                )
                continue

        # 2. Convert
        # Always read from BACKUP (source truth)
        temp_output_path = base_dir / f"{file_path.stem}_refactored_temp.md"

        try:
            convert_markdown(backup_path, temp_output_path)

            # 3. Validation & Update
            if temp_output_path.exists() and temp_output_path.stat().st_size > 0:
                # Basic check: did we produce something substantial?
                if temp_output_path.stat().st_size < 100:
                    print(
                        f"  ⚠️ Conversion result too small ({temp_output_path.stat().st_size} bytes). Discarding."
                    )
                    temp_output_path.unlink()
                else:
                    # Move temp to original (Replace)
                    if file_path.exists():
                        file_path.unlink()
                    shutil.move(temp_output_path, file_path)
                    print(f"  ✅ Converted and updated {filename}")
            else:
                print(f"  ❌ Conversion produced empty/missing file for {filename}")

        except Exception as e:
            print(f"  ❌ Error converting {filename}: {e}")
            if temp_output_path.exists():
                temp_output_path.unlink()

    print("\n✨ Batch processing complete!")


if __name__ == "__main__":
    main()

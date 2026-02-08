#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
清理 Markdown 中的行號殘留
這些行號來自爬蟲抓取時的網站渲染效果，不應該出現在原始 Markdown 中
"""

import re


def clean_line_numbers(filepath: str, output_path: str = None):
    """
    清理 Markdown 檔案中的行號殘留

    主要清理模式:
    1. 注意事項區塊中的行號 (如 "> 2 SetPosition...")
    2. 獨立成行的純數字 (通常是行號)
    """
    if output_path is None:
        output_path = filepath

    with open(filepath, "r", encoding="utf-8") as f:
        lines = f.readlines()

    cleaned_lines = []
    changes_count = 0

    for i, line in enumerate(lines):
        original_line = line

        # 模式1: 移除引用區塊中的行號
        # 例如: "> 2 SetPosition..." -> "> SetPosition..."
        # 例如: "> 4 SetPosition..." -> "> SetPosition..."
        if re.match(r"^>\s+\d+\s+[A-Za-z]", line):
            line = re.sub(r"^(>\s+)\d+\s+", r"\1", line)
            changes_count += 1
            print(f"Line {i+1}: 移除引用區塊行號")

        # 模式2: 移除獨立的純數字行（但保留在程式碼區塊內的）
        # 檢查前後文，確保不是在 ```xs 程式碼區塊內
        elif re.match(r"^\d+\s*$", line.strip()):
            # 檢查是否在程式碼區塊內
            in_code_block = False
            for j in range(max(0, i - 10), i):
                if "```xs" in lines[j] or "```" in lines[j]:
                    in_code_block = not in_code_block

            if not in_code_block:
                # 這是一個獨立的行號，移除它
                line = ""
                changes_count += 1
                print(f"Line {i+1}: 移除獨立行號: {original_line.strip()}")

        cleaned_lines.append(line)

    # 寫入檔案
    with open(output_path, "w", encoding="utf-8") as f:
        f.writelines(cleaned_lines)

    print(f"\n清理完成！")
    print(f"總共移除 {changes_count} 個行號殘留")

    return changes_count


if __name__ == "__main__":
    filepath = r"c:\Users\How\OneDrive\Documents\XQ chatbot\說明\內建.md"

    # 先備份
    import shutil

    backup_path = filepath + ".before_cleanup"
    shutil.copy(filepath, backup_path)
    print(f"已備份至: {backup_path}\n")

    # 執行清理
    changes = clean_line_numbers(filepath)

    if changes > 0:
        print(f"\n請檢查 {filepath} 確認清理結果")
    else:
        print("\n未發現需要清理的行號殘留")

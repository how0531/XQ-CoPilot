#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批次重構所有混合內容函數
基於官方 XS 文檔格式標準
"""

import re
import os
import glob
from typing import List, Dict, Tuple, Optional
from refactor_mixed_functions import (
    parse_mixed_content,
    format_function_doc,
    find_mixed_content_sections,
)


class FunctionDocRefactor:
    """函數文檔重構器"""

    def __init__(self):
        self.processed_count = 0
        self.failed_functions = []

    def process_function(self, func_name: str, content: str) -> str:
        """處理單個函數內容"""
        try:
            parsed = parse_mixed_content(content)
            formatted = format_function_doc(func_name, parsed)
            self.processed_count += 1
            return formatted
        except Exception as e:
            self.failed_functions.append((func_name, str(e)))
            return content


def batch_refactor_file(filepath: str, output_path: str = None, dry_run: bool = False):
    """
    處理單個檔案
    """
    if output_path is None:
        output_path = filepath

    # 找出所有需要處理的區段
    sections = find_mixed_content_sections(filepath)

    if not sections:
        print(f"  在 {os.path.basename(filepath)} 中未找到需要重構的函數")
        return

    print(f"  找到 {len(sections)} 個需要重構的函數")

    if dry_run:
        print("  (測試運行，不實際修改檔案)")
        return

    # 讀取檔案內容
    with open(filepath, "r", encoding="utf-8") as f:
        lines = f.readlines()

    # 初始化重構器
    refactor = FunctionDocRefactor()

    # 由後往前處理（避免行號變動影響之後的代碼替換）
    sections.sort(key=lambda x: x[0], reverse=True)

    for start_line, end_line, func_name in sections:
        # 提取該區段的完整內容
        block_content = "".join(lines[start_line:end_line])

        # 識別出說明部分
        content_match = re.search(
            r"\*\*說明:\*\*\s*(.+?)(?=\r?\n---|\r?\n###|\Z)", block_content, re.DOTALL
        )
        if not content_match:
            continue

        old_description = content_match.group(1).strip()

        # 生成新內容
        new_markdown = refactor.process_function(func_name, old_description)

        # 找到 **說明:** 所在的行索引
        desc_line_idx = None
        for i in range(start_line, min(len(lines), end_line)):
            if "**說明:**" in lines[i]:
                desc_line_idx = i
                break

        if desc_line_idx is not None:
            # 找到下一個分隔標記
            next_marker = end_line
            for i in range(desc_line_idx + 1, min(len(lines), end_line)):
                if lines[i].strip().startswith("---") or lines[i].strip().startswith(
                    "###"
                ):
                    next_marker = i
                    break

            # 解析新生成的 Markdown
            new_lines = new_markdown.splitlines()

            # 找到新 Markdown 中 **說明:** 之後的部分內容（通常包含語法、範例等）
            new_desc_idx = None
            for idx, line in enumerate(new_lines):
                if "**說明:**" in line:
                    new_desc_idx = idx
                    break

            if new_desc_idx is not None:
                # 準備要插入的行，並確保每行結尾有 \n
                replacement_lines = [l + "\n" for l in new_lines[new_desc_idx + 1 :]]
                # 替換！
                lines[desc_line_idx + 1 : next_marker] = replacement_lines

    # 寫入檔案
    with open(output_path, "w", encoding="utf-8") as f:
        f.writelines(lines)

    print(f"  處理完成！成功重構 {refactor.processed_count} 個函數")
    if refactor.failed_functions:
        print(f"  失敗: {len(refactor.failed_functions)} 個函數")


def batch_refactor_all_files(directory_path: str, dry_run: bool = False):
    """
    批次重構目錄下所有的 Markdown 檔案
    """
    files = glob.glob(os.path.join(directory_path, "*.md"))

    for filepath in files:
        if filepath.endswith(".backup") or filepath.endswith(".before_batch"):
            continue
        print(f"\n處理檔案: {filepath}")
        batch_refactor_file(filepath, dry_run=dry_run)


if __name__ == "__main__":
    dir_path = r"c:\Users\How\OneDrive\Documents\XQ chatbot\說明"
    batch_refactor_all_files(dir_path, dry_run=True)

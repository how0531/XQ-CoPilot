#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
智能解析器：自動拆分並重構混合內容的函數文檔
處理包含 \\n 跳脫字符的超長段落，將其轉換為結構化的 Markdown
"""

import re
from typing import List, Dict, Tuple


def parse_mixed_content(content: str) -> Dict[str, any]:
    """
    解析混合內容，提取語法、說明、範例等區塊
    """
    result = {
        "category": "",
        "syntax": [],
        "description": [],
        "parameters": [],
        "return_values": [],
        "examples": [],
        "notes": [],
    }

    # 處理字串轉義問題：有些內容可能是已經轉義過的 \\n
    content = content.replace("\\\\n", "\n").replace("\\n", "\n")
    lines = content.split("\n")

    current_block = "description"  # 開放：description, examples, notes
    code_buffer = []
    text_buffer = []

    # 擴展程式碼特徵
    xs_keywords = [
        "Var:",
        "Array:",
        "Variable:",
        "input:",
        "Value\\d+",
        "arr[A-Z]",
        "If ",
        "Then",
        "Else",
        "Begin",
        "End",
        "For ",
        "To ",
        "While ",
        "Plot\\d+",
        "SetPosition",
        "Buy",
        "Sell",
        "Short",
        "Cover",
        "Print\\(",
        "Average\\(",
        "Highest\\(",
        "Lowest\\(",
        "GetField",
        "Ret =",
        "Return",
        "Break",
        "Continu",
        "Condition\\d+",
        "//",
        "{",
        "}",
        "numeric",
        "string",
        "bool",
        "simple",
        "series",
    ]
    code_pattern = re.compile(f"({'|'.join(xs_keywords)})", re.IGNORECASE)

    # 選股欄位特徵 (Metadata)
    categories = [
        "常用",
        "基本",
        "獲利",
        "營收",
        "資產",
        "負債",
        "股東權益",
        "現金流量",
        "股利",
        "籌碼",
        "交易",
        "技術",
        "事件",
    ]
    units = ["元", "千元", "百萬", "億", "％", "次", "張", "股", "天", "bps"]
    formats = ["數值", "字串", "布林值", "日期"]
    scripts = ["指標", "選股", "警示", "交易", "函數"]
    freqs = ["即時", "Tick", "分", "日", "週", "月", "季", "半年", "年"]
    symbols = ["台股", "港股", "美股", "期貨", "選擇權", "大盤"]

    metadata = {
        "category": "",
        "unit": "",
        "format": "",
        "scripts": [],
        "frequency": "",
        "symbols": [],
    }

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # 1. 優先匹配 Metadata
        if line in categories:
            metadata["category"] = line
            continue
        if line in units:
            metadata["unit"] = line
            continue
        if line in formats:
            metadata["format"] = line
            continue
        if line in scripts:
            metadata["scripts"].append(line)
            continue
        if line in freqs:
            metadata["frequency"] = line
            continue
        if line in symbols:
            metadata["symbols"].append(line)
            continue

        # 原有的類別識別（保留相容性）
        if re.match(
            r"^(陣列|交易|欄位|數學|字串|日期|一般|系統|報價|選股|資料)函數$", line
        ):
            result["category"] = line
            continue

        # 識別範例/舉例標籤
        if "範例" in line or "舉例" in line or "例如" in line:
            if code_buffer:
                if not result["syntax"]:
                    result["syntax"] = code_buffer.copy()
                else:
                    result["examples"].extend(code_buffer)
                code_buffer = []
            current_block = "examples"
            if len(line) > 10:  # 如果這行不只是標籤，也包含內容
                text_buffer.append(line)
            continue

        # 識別注意事項
        if "注意" in line or "備註" in line or "限制" in line:
            current_block = "notes"
            text_buffer.append(line)
            continue

        # 判斷是否為程式碼
        is_code = (
            code_pattern.search(line)
            or (line.endswith(";") and not line.endswith("。"))
            or (line.count("(") > 0 and line.count(")") > 0 and ";" in line)
            or re.match(r"^[a-zA-Z0-9_]+\s*=", line)  # 賦值語句
        )

        # 識別純數字行（通常是行號殘留）
        if re.match(r"^\d+$", line):
            continue

        if is_code:
            code_buffer.append(line)
        else:
            if code_buffer:
                if current_block == "description" and not result["syntax"]:
                    result["syntax"] = code_buffer.copy()
                else:
                    result["examples"].extend(code_buffer)
                code_buffer = []

            # 將文字根據當前區塊分類
            if current_block == "examples":
                # 即使在範例區塊，如果不是程式碼，也當作範例的說明
                result["examples"].append(f"// {line}")
            elif current_block == "notes":
                result["notes"].append(line)
            else:
                text_buffer.append(line)

    if code_buffer:
        if current_block == "description" and not result["syntax"]:
            result["syntax"] = code_buffer.copy()
        else:
            result["examples"].extend(code_buffer)

    result["description"] = text_buffer
    result["metadata"] = metadata

    return result


def format_function_doc(func_name: str, parsed_data: Dict) -> str:
    """
    將解析後的資料格式化為標準 Markdown
    """
    lines = [f"### {func_name}", ""]

    # 1. 語法區塊
    syntax = parsed_data.get("syntax", [])
    if not syntax and parsed_data["description"]:
        first_line = parsed_data["description"][0]
        if "(" in first_line and ")" in first_line and len(first_line) < 100:
            syntax = [first_line]
            parsed_data["description"] = parsed_data["description"][1:]

    if syntax:
        lines.append("**語法:**")
        lines.append("")
        lines.append("```xs")
        for s in syntax:
            s = s.replace("```xs", "").replace("```", "").strip()
            if s:
                lines.append(s)
        lines.append("```")
        lines.append("")

    # 2. Metadata 表格 (針對選股欄位優化)
    meta = parsed_data.get("metadata", {})
    has_meta = any(
        [
            meta["category"],
            meta["unit"],
            meta["format"],
            meta["scripts"],
            meta["frequency"],
            meta["symbols"],
        ]
    )

    if has_meta:
        lines.append("| 項目 | 內容 |")
        lines.append("| :--- | :--- |")
        if meta["category"]:
            lines.append(f"| **欄位分類** | {meta['category']} |")
        if meta["unit"]:
            lines.append(f"| **單位** | {meta['unit']} |")
        if meta["format"]:
            lines.append(f"| **格式** | {meta['format']} |")
        if meta["scripts"]:
            lines.append(f"| **支援腳本** | {', '.join(meta['scripts'])} |")
        if meta["frequency"]:
            lines.append(f"| **可用頻率** | {meta['frequency']} |")
        if meta["symbols"]:
            lines.append(f"| **支援商品** | {', '.join(meta['symbols'])} |")
        lines.append("")

    # 3. 說明區塊
    desc_lines = [
        l for l in parsed_data["description"] if l != parsed_data.get("category", "")
    ]
    if desc_lines:
        lines.append("**說明:**")
        lines.append("")
        # 處理字串轉義問題：非常強勢地清理各種形式的 \n
        for l in desc_lines:
            # 處理可能存在的標記
            l = l.replace("```xs", "").replace("```", "").strip()
            if l:
                lines.append(
                    l.replace("\\\\n", "\n").replace("\\n", "\n").replace("\\ n", "\n")
                )
        lines.append("")

    # 4. 範例區塊
    if parsed_data.get("examples"):
        lines.append("**範例:**")
        lines.append("")
        lines.append("```xs")
        for line in parsed_data["examples"]:
            # 移除行號殘留與重複標記
            cleaned = re.sub(r"^\d+\s+", "", line)
            cleaned = cleaned.replace("```xs", "").replace("```", "").strip()
            if cleaned:
                lines.append(cleaned)
        lines.append("```")
        lines.append("")

    # 5. 注意事項
    if parsed_data.get("notes"):
        lines.append("**注意事項:**")
        lines.append("")
        for n in parsed_data["notes"]:
            lines.append(f"> {n}")
        lines.append("")

    return "\n".join(lines)


def find_mixed_content_sections(filepath: str) -> List[Tuple[int, int, str]]:
    """
    掃描檔案，找出所有包含混合內容的區塊

    Args:
        filepath: 檔案路徑

    Returns:
        包含 (start_line, end_line, content) 的列表
    """
    sections = []

    with open(filepath, "r", encoding="utf-8") as f:
        lines = f.readlines()

    i = 0
    while i < len(lines):
        line = lines[i]

        # 檢查是否為函數標題
        if line.startswith("### "):
            func_name = line.replace("### ", "").strip()
            start_line = i + 1

            # 尋找下一個函數或分隔線
            j = i + 1
            while (
                j < len(lines)
                and not lines[j].startswith("### ")
                and not lines[j].startswith("---")
            ):
                j += 1

            # 檢查這個區塊是否包含 \\n 或 選股特有的 Metadata 關鍵字
            block_content = "".join(lines[i:j])

            # 定義 Metadata 關鍵字
            meta_keywords = [
                "常用",
                "基本",
                "獲利",
                "營收",
                "資產",
                "負債",
                "股東權益",
                "現金流量",
                "股利",
                "籌碼",
                "技術",
                "事件",
                "％",
                "數值",
                "選股",
                "台股",
            ]
            has_meta = any(kw in block_content for kw in meta_keywords)

            if ("\\n" in block_content or has_meta) and (
                "函數" in block_content
                or "Array" in block_content
                or "GetField" in block_content
            ):
                sections.append((i, j, func_name))

            i = j
        else:
            i += 1

    return sections


def refactor_file(input_path: str, output_path: str = None):
    """
    重構整個檔案

    Args:
        input_path: 輸入檔案路徑
        output_path: 輸出檔案路徑（如為 None，則覆蓋原檔案）
    """
    if output_path is None:
        output_path = input_path

    with open(input_path, "r", encoding="utf-8") as f:
        content = f.read()

    # 找出所有需要處理的區塊
    sections = find_mixed_content_sections(input_path)

    print(f"找到 {len(sections)} 個需要重構的函數")

    # 這裡我們需要更精細的處理
    # 暫時先輸出找到的區塊資訊
    for start, end, func_name in sections:
        print(f"  - {func_name} (行 {start}-{end})")

    return sections


if __name__ == "__main__":
    filepath = r"c:\Users\How\OneDrive\Documents\XQ chatbot\說明\內建.md"
    sections = refactor_file(filepath)

    print(f"\n總計找到 {len(sections)} 個需要處理的函數區塊")

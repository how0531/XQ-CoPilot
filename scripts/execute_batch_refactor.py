#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
執行批次重構
"""
from batch_refactor_all import batch_refactor_all_files

if __name__ == "__main__":
    dir_path = r"c:\Users\How\OneDrive\Documents\XQ chatbot\說明"

    print("開始全面批次重構...")
    print("=" * 60)

    batch_refactor_all_files(dir_path, dry_run=False)

    print("=" * 60)
    print("全面批次重構完成！")

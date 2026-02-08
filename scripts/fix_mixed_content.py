import re
import os


def is_code_line(line):
    stripped = line.strip()
    if not stripped:
        return True  # Treat empty lines as neutral/code for now, will merge later

    # Comments
    if stripped.startswith("//") or stripped.startswith("{"):
        return True

    # Remove potential line numbers "1    Code" or "1| Code"
    # Regex: Start with digits, optional |, then whitespace, then english char
    # Or just check if it LOOKS like code (starts with english char, number, or symbol)

    # Check for Chinese characters at the start (excluding punctuation)
    # Range \u4e00-\u9fff is CJK Unified Ideographs
    first_char = stripped[0]
    if "\u4e00" <= first_char <= "\u9fff":
        return False

    # Check for specific keywords that might start a text line but look like something else?
    # Actually, most text lines start with Chinese or "範例", "規則" which are Chinese.

    # Special case: "2    condition..."
    # If line starts with digit, check what follows.
    if first_char.isdigit():
        # Clean line number logic check
        # If it looks like "123. Text", it might be text.
        # If it looks like "123 condition = ...", it's code.
        # Heuristic: If it contains Chinese outside of quotes, highly likely text?
        # But comments can have Chinese.
        pass

    # Stronger heuristic:
    # If a line contains Chinese characters NOT inside quotes "" and NOT in a comment // or {}
    # Then it is likely text.

    # Simple parser to remove strings and comments
    temp_line = stripped
    temp_line = re.sub(r'".*?"', "", temp_line)  # Remove strings
    temp_line = re.sub(r"//.*", "", temp_line)  # Remove // comments
    temp_line = re.sub(r"\{.*?\}", "", temp_line)  # Remove {} comments

    # Check for remaining Chinese
    if re.search(r"[\u4e00-\u9fff]", temp_line):
        return False

    return True


def clean_code_line(line):
    # Remove leading line numbers like "1    Code" or "1| Code"
    # But be careful not to remove "100" in "100;"
    # Heuristic: usually strictly followed by spaces.

    # Regex: ^\d+(\s+|\|)
    match = re.match(r"^(\d+)([\s\|]+)(.*)", line)
    if match:
        number = match.group(1)
        separator = match.group(2)
        rest = match.group(3)
        # If the number is small (line number) vs large (constant)??
        # Usually line numbers are 1, 2, 3...
        # Constants in code usually part of expression.
        # Real code line rarely starts with just a number unless it's a label? form "100: "?
        # XS doesn't use line numbers for navigation usually.
        # But wait, "2 condition1 = ..."
        # "100" -> SetPosition(1, 100);
        # Inside the block, lines starting with numbers are likely line numbers.
        return rest + "\n"
    return line


def process_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        lines = f.readlines()

    new_lines = []
    in_block = False
    block_buffer = []

    i = 0
    while i < len(lines):
        line = lines[i]

        if line.strip().startswith("```xs") or line.strip().startswith("```"):
            if not in_block:
                in_block = True
                new_lines.append(line)
                i += 1
                continue
            else:
                # End of block
                in_block = False

                # Process the buffered block
                processed_content = process_block(block_buffer)
                new_lines.extend(processed_content)
                block_buffer = []

                new_lines.append(line)  # closing ```
                i += 1
                continue

        if in_block:
            block_buffer.append(line)
        else:
            new_lines.append(line)
        i += 1

    return "".join(new_lines)


def process_block(buffer):
    # Group lines into Code/Text type
    groups = []
    current_type = None
    current_lines = []

    for line in buffer:
        is_code = is_code_line(line)
        line_type = "code" if is_code else "text"

        if line_type != current_type:
            if current_type is not None:
                groups.append({"type": current_type, "lines": current_lines})
            current_type = line_type
            current_lines = []

        current_lines.append(line)

    if current_lines:
        groups.append({"type": current_type, "lines": current_lines})

    # Reconstruct
    # If we have multiple groups, we need to close the original block (which is already open in main loop?)
    # Wait, the main loop appends the OPENING ```.
    # So if we output text, we must CLOSE the code block first, output text, then OPEN code block again.

    # Exception: The main loop assumes it printed ````xs`.
    # If the first group is Text, we have a problem: empty code block at start.
    # If the last group is Text, we have a problem: empty code block at end (before closing ```).

    # Better approach: return a list of lines that REPLACES the content INSIDE the ````xs ... ````
    # BUT we might need to introduce new ```` lines.

    result = []

    # We are inside an OPEN ````xs block.

    for idx, group in enumerate(groups):
        if group["type"] == "code":
            # Clean code lines
            cleaned_lines = []
            for l in group["lines"]:
                # strip line numbers
                cleaned = clean_code_line(l)
                # If checking empty lines, careful not to strip indentation?
                # clean_code_line should preserve indentation of 'rest'
                cleaned_lines.append(cleaned)

            # Add to result
            if idx > 0 and groups[idx - 1]["type"] == "text":
                # Previous was text, so we need to open a block
                result.append("```xs\n")

            result.extend(cleaned_lines)

        else:  # Text
            # We need to CLOSE the current block
            # But only if we are "inside" one.
            # We start logic assuming we are inside one.

            # If this is the FIRST group, we are inside the initial ````xs
            # So we should close it immediately if we don't want an empty block?
            # Or just close it.

            result.append("```\n")  # Close the block
            result.extend(group["lines"])  # Add the text

            # If this is NOT the last group, formatting will be needed for next code block.
            # handled by 'code' branch check.

    # Handle the end
    # The main loop prints the closing ````.
    # If the last group was Text, we have closed the block.
    # So the main loop's closing ```` will be dangling?
    # OR create an empty block?

    # Let's adjust.
    # This function is too coupled with the main loop.
    # Let's change this function to return the FULL replacement for the block including delimiters?
    # No, main loop structure is simpler.

    # Let's check status at end:
    last_group_type = groups[-1]["type"] if groups else "code"

    if last_group_type == "text":
        # We closed the block in the loop.
        # But main loop appends closing ```.
        # We should reopen it so main loop closes it empty? No that's ugly.
        # We should tell main loop to SKIP closing ```?
        pass

    return result, last_group_type


# RETHINK: Text processing inside block
# We are converting:
# ```xs
# Code
# Text
# Code
# ```
# Into:
# ```xs
# Code
# ```
# Text
# ```xs
# Code
# ```

# Revised logic:
# process_file finds the full chunk ````...````
# passes to process_full_block
# returns list of lines


def process_full_block(full_block_lines):
    # full_block_lines includes the opening ```xs and closing ```

    opening = full_block_lines[0]
    closing = full_block_lines[-1]
    content_lines = full_block_lines[1:-1]

    groups = []
    current_type = None
    current_lines = []

    for line in content_lines:
        is_code = is_code_line(line)
        line_type = "code" if is_code else "text"

        if line_type != current_type:
            if current_type is not None:
                groups.append({"type": current_type, "lines": current_lines})
            current_type = line_type
            current_lines = []

        current_lines.append(line)

    if current_lines:
        groups.append({"type": current_type, "lines": current_lines})

    result = []

    for idx, group in enumerate(groups):
        if group["type"] == "code":
            # Clean lines
            cleaned_lines = []
            for l in group["lines"]:
                cl = clean_code_line(l)
                # Only add if not just a generic "1" line number on empty line?
                # Actually clean_code_line handles numbers.
                cleaned_lines.append(cl)

            # If previous group was text OR this is first group, need header
            # Actually simplest is: Wrap EVERY code group in ```xs ... ```

            # Start block
            result.append(opening)
            result.extend(cleaned_lines)
            result.append(closing)

        else:
            # Text group
            result.extend(group["lines"])

    return result


import argparse
import sys
import os  # Added for os.path.isfile and os.path.isdir


def main():
    parser = argparse.ArgumentParser(
        description="Fix mixed code/text content in markdown XS blocks."
    )
    parser.add_argument("start_dir", nargs="?", help="Directory or file to process")
    parser.add_argument(
        "--overwrite", action="store_true", help="Overwrite the original file"
    )

    args = parser.parse_args()

    target_files = []
    if args.start_dir and os.path.isfile(args.start_dir):
        target_files.append(args.start_dir)
    elif args.start_dir and os.path.isdir(args.start_dir):
        # Scan for md files? Or specific list?
        # User only cared about 說明/*.md usually
        # But let's just let user pass specific file
        pass
    else:
        # Default behavior: hardcoded list if no args?
        # Let's just default to the original file for backward compat testing
        if not args.start_dir:
            target_files = [r"c:\Users\How\OneDrive\Documents\XQ chatbot\說明\內建.md"]

    for filepath in target_files:
        print(f"Processing {filepath}...")
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                lines = f.readlines()
        except Exception as e:
            print(f"Error reading {filepath}: {e}")
            continue

        # new_lines = []
        # i = 0

        # while i < len(lines):
        #     line = lines[i]

        #     if line.strip().startswith('```'):
        #         # Found block start
        #         block_lines = [line]
        #         i += 1
        #         while i < len(lines):
        #             block_lines.append(lines[i])
        #             if lines[i].strip().startswith('```'):
        #                 break
        #             i += 1

        #         # Check for closed block
        #         if i < len(lines) and lines[i].strip().startswith('```'):
        #              pass # block_lines already includes the last line if we append inside loop?
        #              # Wait, loop breaks on ```. We didn't append it in loop?
        #              # Let's fix loop logic
        #              pass

        #         # Revised loop logic for robustness
        #         # Reset i to start of block
        #         # Already consumed opening line
        #         # Wait, my previous logic was:
        #         # opening line in block_lines.
        #         # loop until closing line found.
        #         # closing line NOT in block_lines?
        #         pass

        # Rewrite the main loop to be safer
        new_content = process_file_content(lines)

        output_path = filepath if args.overwrite else filepath + ".fixed"
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(new_content)

        print(f"Saved to {output_path}")


def process_file_content(lines):
    new_lines = []
    i = 0
    while i < len(lines):
        line = lines[i]

        if line.strip().startswith("```") and not line.strip().startswith("```xs"):
            # generic block, skip? Or treat as code/text?
            # User files use ```xs.
            # Sometimes ``` is used for text in original bad parsing?
            pass

        if line.strip().startswith("```"):
            # It is a block
            block_lines = [line]
            i += 1
            while i < len(lines):
                block_lines.append(lines[i])
                if lines[i].strip().startswith("```"):
                    break
                i += 1

            processed = process_full_block(block_lines)
            new_lines.extend(processed)
            i += 1
        else:
            new_lines.append(line)
            i += 1
    return "".join(new_lines)


if __name__ == "__main__":
    main()

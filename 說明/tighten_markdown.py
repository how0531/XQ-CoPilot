import re
import sys


def tighten_file(filepath):
    print(f"Tightening {filepath}...")
    with open(filepath, "r", encoding="utf-8") as f:
        lines = f.readlines()

    new_lines = []
    in_code_block = False
    in_table = False

    i = 0
    while i < len(lines):
        line = lines[i]

        # Toggle code block
        if line.strip().startswith("```"):
            in_code_block = not in_code_block
            new_lines.append(line)

            # If entering, skip immediate next blank lines
            if in_code_block:
                while i + 1 < len(lines) and not lines[i + 1].strip():
                    i += 1
            i += 1
            continue

        # Table detection
        is_table_row = line.strip().startswith("|")

        if is_table_row:
            in_table = True
            new_lines.append(line)
            # Skip subsequent blank lines if they are followed by another table row
            while i + 1 < len(lines):
                next_line = lines[i + 1]
                if not next_line.strip():
                    # Check what follows the blank(s)
                    j = i + 2
                    found_next_row = False
                    while j < len(lines):
                        if lines[j].strip().startswith("|"):
                            found_next_row = True
                            break
                        if lines[j].strip():  # Found some other text
                            break
                        j += 1

                    if found_next_row:
                        i = j - 1  # Jump to the line before the next row
                    else:
                        break
                else:
                    break
        else:
            in_table = False

            # Regular blank line collapse
            if not line.strip():
                # Collapse multiple blanks to one
                if new_lines and not new_lines[-1].strip():
                    i += 1
                    continue

                # Special Case: Don't keep blank line before a closing code block ```
                j = i + 1
                while j < len(lines) and not lines[j].strip():
                    j += 1
                if (
                    j < len(lines)
                    and lines[j].strip().startswith("```")
                    and in_code_block
                ):
                    i = j
                    continue

                new_lines.append("\n")
            else:
                new_lines.append(line)

        i += 1

    with open(filepath, "w", encoding="utf-8") as f:
        f.writelines(new_lines)


if __name__ == "__main__":
    for arg in sys.argv[1:]:
        tighten_file(arg)

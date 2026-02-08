import re
import sys


def aggressive_cleanup(filepath):
    print(f"Aggressively cleaning {filepath}...")
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Remove trailing whitespace from each line
    content = re.sub(r"[ \t]+$", "", content, flags=re.MULTILINE)

    # 2. Collapse 3 or more newlines to 2 (max one blank line)
    content = re.sub(r"\n{3,}", "\n\n", content)

    # 3. Specific fix: remove blank lines between pipe characters (tables)
    # This regex looks for a | followed by one or more blank lines and then another |
    content = re.sub(r"\|\n+\|", "|\n|", content)

    # 4. Remove blank lines at the start and end of code blocks
    content = re.sub(r"```([a-z]*)\n\n+", r"```\1\n", content)
    content = re.sub(r"\n\n+```", r"\n```", content)

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\n")


if __name__ == "__main__":
    for arg in sys.argv[1:]:
        aggressive_cleanup(arg)

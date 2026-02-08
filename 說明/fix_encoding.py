import sys


def fix_encoding(filepath):
    print(f"Fixing encoding for {filepath}...")
    try:
        with open(filepath, "rb") as f:
            content = f.read()

        # Check for UTF-16LE BOM or null bytes
        if b"\x00" in content:
            print("  Detected null bytes. Attempting to strip them.")
            # Replace null bytes
            fixed_content = content.replace(b"\x00", b"")

            # Try decoding as utf-8
            text = fixed_content.decode("utf-8")

            # Write back
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(text)
            print("  Fixed successfully.")
        else:
            print("  No null bytes found. File might be okay or have different issue.")

    except Exception as e:
        print(f"  ERROR: {e}")


if __name__ == "__main__":
    for arg in sys.argv[1:]:
        fix_encoding(arg)

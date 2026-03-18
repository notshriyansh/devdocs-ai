def clean_text(text: str):

    lines = text.split("\n")

    cleaned = []

    for line in lines:

        line = line.strip()

        if len(line) < 40:
            continue

        if "INFO" in line or "http://" in line:
            continue

        cleaned.append(line)

    return "\n".join(cleaned)
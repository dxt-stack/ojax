from pathlib import Path
import re

root = Path('/home/ubuntu/ojax-work/client/src')
pattern = re.compile('[\\U0001F000-\\U0001FAFF\\u2600-\\u27BF\\ufe0f\\u200d]')
for path in root.rglob('*.tsx'):
    text = path.read_text()
    cleaned = pattern.sub('', text)
    if cleaned != text:
        path.write_text(cleaned)
        print(path)

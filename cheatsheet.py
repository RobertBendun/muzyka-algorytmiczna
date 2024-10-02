#!/usr/bin/env python3
import os.path

basename, _ = os.path.splitext(__file__)
source = f"{basename}.txt"
target = f"{basename}.html"

def gen():
    with open(source) as f:
        lines = f.readlines()

    inside_table = False

    state = 'title'
    if lines[-1] != '':
        lines.append('')

    for line in lines:
        line = line.rstrip().replace('\t', '  ')
        if state == 'title':
            if line == '---':
                if inside_table:
                    yield "</table>"
                yield "<table><tr><th>Python</th><th>Ruby</th></tr>"
                inside_table = True
            else:
                yield f"<tr><th colspan=2>{line}</th></tr>"
                state = ('print', 0)
        elif state == ('print', 0):
            yield f"<tr><td><code><pre>{line}"
            state = ('print', 1)
        elif state == ('print', 1):
            if line:
                yield line
            else:
                yield "</pre></code></td><td><code><pre>"
                state = ('print', 2)
        elif state == ('print', 2):
            if line:
                yield line
            else:
                yield "</pre></code></td></tr>"
                state = 'title'
        else:
            assert False, f"unknown state: {state}"


if os.stat(source).st_mtime < os.stat(target).st_mtime:
    print(f"skipping {source} -> {target}, target newer")
else:
    with open(target, 'w') as f:
        print("""<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow,nosnippet,noodp,noarchive,noimageindex">
		<title>Python - Ruby cheatsheet</title>
        <style>
        html {{
            color-scheme: light dark;
        }}
        body {{
            font-family: system-ui, sans-serif;
            line-height: 1.6;
            display: flex;
            align-items: flex-start;
            justify-content: center;
            gap: 1em;
            flex-wrap: wrap;
        }}
        </style>
	</head>
	<body>
      {content}
	</body>
</html>
""".format(content='\n'.join(gen())), file=f)


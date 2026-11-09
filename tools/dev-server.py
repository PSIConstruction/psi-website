#!/usr/bin/env python3
"""Local preview server that never lets the browser cache anything.

    python3 tools/dev-server.py 8790

Python's stock http.server sends no Cache-Control header, and Chromium then
caches HTML heuristically — so after a rebuild a reload could still show the
previous page, the old hero, the removed photo strip. Here every response is
no-store. (GitHub Pages serves with max-age=600 regardless; the content-hashed
asset names exist for that.)
"""
import http.server, os, sys

os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))


class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, *a):
        pass


port = int(sys.argv[1]) if len(sys.argv) > 1 else 8790
http.server.ThreadingHTTPServer(("", port), H).serve_forever()

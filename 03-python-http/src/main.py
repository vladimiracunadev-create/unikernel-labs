from http.server import BaseHTTPRequestHandler, HTTPServer

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "application/json; charset=utf-8")
        self.end_headers()
        payload = b'{"lab":"03-python-http","status":"ok"}'
        self.wfile.write(payload)

server = HTTPServer(("0.0.0.0", 8081), Handler)
print("python-http ready on :8081")
server.serve_forever()

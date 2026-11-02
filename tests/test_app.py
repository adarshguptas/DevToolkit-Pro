import unittest
from app import app

class AppRoutesTest(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_homepage_loads(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"DevToolkit Pro", response.data)

    def test_health_endpoint(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["status"], "ok")
        self.assertEqual(data["version"], "1.0.0")

    def test_unknown_route_returns_json_404(self):
        response = self.client.get("/not-a-real-route")
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.get_json()["error"], "Not found")

if __name__ == "__main__":
    unittest.main()

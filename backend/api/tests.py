from django.test import TestCase
from django.contrib.auth.models import User
from .models import Building

class CampusApiTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password123')
        self.building = Building.objects.create(
            name="Test Building",
            code="TB",
            category="facility",
            latitude=1.0,
            longitude=1.0,
            description="Test Description",
            image_url="http://example.com/image.jpg",
            opening_hours="9-5"
        )

    def test_building_list(self):
        response = self.client.get('/api/buildings/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)

    def test_login(self):
        response = self.client.post('/api/auth/login/', {'username': 'testuser', 'password': 'password123'}, content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.json())

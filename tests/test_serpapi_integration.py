"""
Test suite for SerpAPI integration and price alert features
Tests: Product search, cache, alerts check, and alert history
"""

import pytest
import requests
import os
import uuid
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestProductSearch:
    """Tests for product search via SerpAPI"""
    
    def test_get_popular_products(self):
        """GET /api/products - Returns popular products from SerpAPI"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0, "Should return at least one product"
        
        # Validate product structure
        product = data[0]
        assert "id" in product
        assert "name" in product
        assert "best_price" in product
        assert "stores" in product
        assert isinstance(product["stores"], list)
        
    def test_search_products_with_query(self):
        """GET /api/products/search?q=<term> - Search products via SerpAPI"""
        response = requests.get(f"{BASE_URL}/api/products/search", params={"q": "iphone"})
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0, "Should return search results for 'iphone'"
        
        # Validate product structure from search
        product = data[0]
        assert "id" in product
        assert "name" in product
        assert "price" in product
        assert "store" in product
        assert "image" in product
        
    def test_search_products_with_category(self):
        """GET /api/products?category=smartphones - Filter by category"""
        response = requests.get(f"{BASE_URL}/api/products", params={"category": "smartphones"})
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        
    def test_get_product_categories(self):
        """GET /api/products/categories/list - Returns available categories"""
        response = requests.get(f"{BASE_URL}/api/products/categories/list")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        
        # Validate category structure
        category = data[0]
        assert "id" in category
        assert "name" in category
        assert "query" in category


class TestProductCache:
    """Tests for product cache functionality"""
    
    def test_get_cache_stats(self):
        """GET /api/products/cache/stats - Returns cache statistics"""
        response = requests.get(f"{BASE_URL}/api/products/cache/stats")
        assert response.status_code == 200
        
        data = response.json()
        assert "total_cache_entries" in data
        assert "valid_entries" in data
        assert "expired_entries" in data
        assert "total_cached_products" in data
        assert "cache_duration_hours" in data
        
        # Validate cache duration is 24 hours
        assert data["cache_duration_hours"] == 24
        
    def test_cache_is_being_used(self):
        """Verify cache is populated after search"""
        # First search to populate cache
        requests.get(f"{BASE_URL}/api/products/search", params={"q": "samsung"})
        
        # Check cache stats
        response = requests.get(f"{BASE_URL}/api/products/cache/stats")
        data = response.json()
        
        assert data["total_cache_entries"] >= 1, "Cache should have at least one entry"


class TestPriceAlertCheck:
    """Tests for price alert check functionality"""
    
    def test_trigger_price_alert_check(self):
        """POST /api/alerts/check - Triggers background price check"""
        response = requests.post(f"{BASE_URL}/api/alerts/check")
        assert response.status_code == 200
        
        data = response.json()
        assert "message" in data
        assert "Verificação de alertas iniciada" in data["message"]
        
    def test_trigger_favorite_check(self):
        """POST /api/alerts/check-favorites - Triggers favorite price check"""
        response = requests.post(f"{BASE_URL}/api/alerts/check-favorites")
        assert response.status_code == 200
        
        data = response.json()
        assert "message" in data
        
    def test_get_alert_check_history(self):
        """GET /api/alerts/check-history - Returns check history"""
        response = requests.get(f"{BASE_URL}/api/alerts/check-history")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        
        # If there are entries, validate structure
        if len(data) > 0:
            entry = data[0]
            assert "checked_at" in entry
            assert "results" in entry


class TestAuthenticatedAlerts:
    """Tests for authenticated alert creation"""
    
    @pytest.fixture
    def test_user(self):
        """Create a test user and return credentials"""
        unique_email = f"test_alert_{uuid.uuid4().hex[:8]}@test.com"
        user_data = {
            "name": "Test Alert User",
            "email": unique_email,
            "password": "testpass123"
        }
        
        # Register user
        response = requests.post(f"{BASE_URL}/api/auth/register", json=user_data)
        if response.status_code == 200:
            return response.json()
        elif response.status_code == 400:
            # User might exist, try login
            login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
                "email": unique_email,
                "password": "testpass123"
            })
            if login_response.status_code == 200:
                return login_response.json()
        
        pytest.skip("Could not create or login test user")
        
    def test_create_price_alert(self, test_user):
        """POST /api/alerts - Create a price alert (authenticated)"""
        token = test_user.get("token")
        headers = {"Authorization": f"Bearer {token}"}
        
        alert_data = {
            "product_id": "test_product_123",
            "product_name": "iPhone 15 Pro Test",
            "product_image": "https://example.com/image.jpg",
            "target_price": 5000.00,
            "current_price": 6500.00
        }
        
        response = requests.post(f"{BASE_URL}/api/alerts", json=alert_data, headers=headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "id" in data
        assert "message" in data
        
        # Verify alert was created by fetching alerts
        get_response = requests.get(f"{BASE_URL}/api/alerts", headers=headers)
        assert get_response.status_code == 200
        
        alerts = get_response.json()
        assert isinstance(alerts, list)
        assert len(alerts) > 0
        
        # Find our created alert
        created_alert = next((a for a in alerts if a["product_id"] == "test_product_123"), None)
        assert created_alert is not None
        assert created_alert["target_price"] == 5000.00
        
    def test_get_user_alerts(self, test_user):
        """GET /api/alerts - Get user's price alerts"""
        token = test_user.get("token")
        headers = {"Authorization": f"Bearer {token}"}
        
        response = requests.get(f"{BASE_URL}/api/alerts", headers=headers)
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        
    def test_update_price_alert(self, test_user):
        """PUT /api/alerts/{id} - Update a price alert"""
        token = test_user.get("token")
        headers = {"Authorization": f"Bearer {token}"}
        
        # First create an alert
        alert_data = {
            "product_id": f"test_update_{uuid.uuid4().hex[:8]}",
            "product_name": "Test Update Product",
            "product_image": "https://example.com/image.jpg",
            "target_price": 1000.00,
            "current_price": 1500.00
        }
        
        create_response = requests.post(f"{BASE_URL}/api/alerts", json=alert_data, headers=headers)
        assert create_response.status_code == 200
        alert_id = create_response.json()["id"]
        
        # Update the alert
        update_data = {"target_price": 900.00}
        update_response = requests.put(f"{BASE_URL}/api/alerts/{alert_id}", json=update_data, headers=headers)
        assert update_response.status_code == 200
        
        # Verify update
        get_response = requests.get(f"{BASE_URL}/api/alerts", headers=headers)
        alerts = get_response.json()
        updated_alert = next((a for a in alerts if a["id"] == alert_id), None)
        assert updated_alert is not None
        assert updated_alert["target_price"] == 900.00
        
    def test_delete_price_alert(self, test_user):
        """DELETE /api/alerts/{id} - Delete a price alert"""
        token = test_user.get("token")
        headers = {"Authorization": f"Bearer {token}"}
        
        # First create an alert
        alert_data = {
            "product_id": f"test_delete_{uuid.uuid4().hex[:8]}",
            "product_name": "Test Delete Product",
            "product_image": "https://example.com/image.jpg",
            "target_price": 500.00,
            "current_price": 800.00
        }
        
        create_response = requests.post(f"{BASE_URL}/api/alerts", json=alert_data, headers=headers)
        assert create_response.status_code == 200
        alert_id = create_response.json()["id"]
        
        # Delete the alert
        delete_response = requests.delete(f"{BASE_URL}/api/alerts/{alert_id}", headers=headers)
        assert delete_response.status_code == 200
        
        # Verify deletion
        get_response = requests.get(f"{BASE_URL}/api/alerts", headers=headers)
        alerts = get_response.json()
        deleted_alert = next((a for a in alerts if a["id"] == alert_id), None)
        assert deleted_alert is None


class TestMockedPlans:
    """Tests for mocked plans endpoints (still using mock data)"""
    
    def test_get_internet_plans(self):
        """GET /api/plans/internet - Returns mocked internet plans"""
        response = requests.get(f"{BASE_URL}/api/plans/internet")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        
    def test_get_mobile_plans(self):
        """GET /api/plans/mobile - Returns mocked mobile plans"""
        response = requests.get(f"{BASE_URL}/api/plans/mobile")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        
    def test_get_streaming_plans(self):
        """GET /api/plans/streaming - Returns mocked streaming plans"""
        response = requests.get(f"{BASE_URL}/api/plans/streaming")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0


class TestHealthAndBasics:
    """Basic health and API tests"""
    
    def test_health_endpoint(self):
        """GET /api/health - Health check"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "healthy"
        
    def test_root_endpoint(self):
        """GET /api/ - Root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        
        data = response.json()
        assert "message" in data
        assert "version" in data


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

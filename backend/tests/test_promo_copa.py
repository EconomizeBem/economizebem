"""
Backend API tests for PromoCopaPage (/promocoes-copa)
Tests the /api/products/search endpoint with various Copa-related queries

Categories tested:
- TVs (smart tv 4k 50)
- Caixas de Som (caixa de som bluetooth potente)  
- Bolas de Futebol (bola de futebol oficial)
- Petiscos (petiscos para festa)
- Cerveja e Bebidas (cerveja lata pack)
- Churrasco e Utensílios (kit churrasco grelha)
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthCheck:
    """Health check endpoint test"""
    
    def test_api_health(self):
        """Verify API is healthy"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print(f"✓ Health check passed: {data}")


class TestProductSearchAPI:
    """Tests for /api/products/search endpoint"""
    
    def test_search_smart_tv_4k(self):
        """Test TVs category search: smart tv 4k 50"""
        response = requests.get(
            f"{BASE_URL}/api/products/search",
            params={"q": "smart tv 4k 50", "page": 1, "page_size": 8}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Validate response structure
        assert "products" in data
        assert "page" in data
        assert "page_size" in data
        assert "has_more" in data
        
        products = data["products"]
        print(f"✓ Smart TV search returned {len(products)} products")
        
        if len(products) > 0:
            # Validate product structure
            product = products[0]
            assert "id" in product
            assert "name" in product
            assert "image" in product
            assert "best_price" in product
            assert "offer_url" in product
            
            # Validate offer_url contains google.com/search
            assert "google.com" in product["offer_url"], f"offer_url should contain google.com: {product['offer_url']}"
            print(f"  Sample product: {product['name'][:50]}... - R$ {product['best_price']}")
    
    def test_search_caixa_som(self):
        """Test Caixas de Som category search: caixa de som bluetooth potente"""
        response = requests.get(
            f"{BASE_URL}/api/products/search",
            params={"q": "caixa de som bluetooth potente", "page": 1, "page_size": 8}
        )
        assert response.status_code == 200
        data = response.json()
        
        products = data["products"]
        print(f"✓ Caixa de Som search returned {len(products)} products")
        
        if len(products) > 0:
            product = products[0]
            assert "offer_url" in product
            assert product["offer_url"].startswith("http")
    
    def test_search_bola_futebol(self):
        """Test Bolas de Futebol category search: bola de futebol oficial"""
        response = requests.get(
            f"{BASE_URL}/api/products/search",
            params={"q": "bola de futebol oficial", "page": 1, "page_size": 8}
        )
        assert response.status_code == 200
        data = response.json()
        
        products = data["products"]
        print(f"✓ Bola de Futebol search returned {len(products)} products")
        
        if len(products) > 0:
            product = products[0]
            assert product.get("best_price") is not None or product.get("best_price") == 0
            assert "stores" in product
    
    def test_search_petiscos(self):
        """Test Petiscos category search: petiscos para festa"""
        response = requests.get(
            f"{BASE_URL}/api/products/search",
            params={"q": "petiscos para festa", "page": 1, "page_size": 8}
        )
        assert response.status_code == 200
        data = response.json()
        
        products = data["products"]
        print(f"✓ Petiscos search returned {len(products)} products")
    
    def test_search_cerveja(self):
        """Test Cerveja e Bebidas category search: cerveja lata pack"""
        response = requests.get(
            f"{BASE_URL}/api/products/search",
            params={"q": "cerveja lata pack", "page": 1, "page_size": 8}
        )
        assert response.status_code == 200
        data = response.json()
        
        products = data["products"]
        print(f"✓ Cerveja search returned {len(products)} products")
    
    def test_search_churrasco(self):
        """Test Churrasco e Utensílios category search: kit churrasco grelha"""
        response = requests.get(
            f"{BASE_URL}/api/products/search",
            params={"q": "kit churrasco grelha", "page": 1, "page_size": 8}
        )
        assert response.status_code == 200
        data = response.json()
        
        products = data["products"]
        print(f"✓ Kit Churrasco search returned {len(products)} products")
        
        if len(products) > 0:
            # Validate complete product structure
            product = products[0]
            required_fields = ["id", "name", "image", "best_price", "offer_url", "stores"]
            for field in required_fields:
                assert field in product, f"Missing field: {field}"
    
    def test_search_minimum_length(self):
        """Test that search with <3 characters returns appropriate message"""
        response = requests.get(
            f"{BASE_URL}/api/products/search",
            params={"q": "ab", "page": 1, "page_size": 8}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Should return empty products with message
        assert data["products"] == []
        assert data.get("message") is not None
        print(f"✓ Short query handled correctly: {data.get('message')}")
    
    def test_search_pagination(self):
        """Test pagination works correctly"""
        response = requests.get(
            f"{BASE_URL}/api/products/search",
            params={"q": "smart tv 4k 50", "page": 1, "page_size": 8}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["page"] == 1
        assert data["page_size"] <= 8
        assert "has_more" in data
        assert "total_pages" in data
        print(f"✓ Pagination info: page={data['page']}, has_more={data['has_more']}, total_pages={data['total_pages']}")


class TestProductResponseFormat:
    """Tests for product response format validation"""
    
    def test_product_structure(self):
        """Validate complete product structure"""
        response = requests.get(
            f"{BASE_URL}/api/products/search",
            params={"q": "smart tv 4k 50", "page": 1, "page_size": 8}
        )
        assert response.status_code == 200
        data = response.json()
        
        if len(data["products"]) > 0:
            product = data["products"][0]
            
            # Required fields
            assert isinstance(product.get("id"), str)
            assert isinstance(product.get("name"), str)
            assert isinstance(product.get("image"), str)
            assert product.get("offer_url") is not None
            
            # Validate stores structure
            stores = product.get("stores", [])
            if len(stores) > 0:
                store = stores[0]
                assert "store" in store
                assert "price" in store
            
            print(f"✓ Product structure validated: {product['name'][:40]}...")
    
    def test_offer_url_format(self):
        """Validate offer_url contains Google Shopping link"""
        response = requests.get(
            f"{BASE_URL}/api/products/search",
            params={"q": "bola de futebol oficial", "page": 1, "page_size": 8}
        )
        assert response.status_code == 200
        data = response.json()
        
        for product in data["products"]:
            offer_url = product.get("offer_url", "")
            # offer_url should be a Google Shopping search URL
            assert "google.com" in offer_url, f"Invalid offer_url: {offer_url}"
        
        print(f"✓ All {len(data['products'])} products have valid Google Shopping URLs")
    
    def test_price_format(self):
        """Validate price is numeric"""
        response = requests.get(
            f"{BASE_URL}/api/products/search",
            params={"q": "kit churrasco grelha", "page": 1, "page_size": 8}
        )
        assert response.status_code == 200
        data = response.json()
        
        for product in data["products"]:
            best_price = product.get("best_price")
            if best_price is not None:
                assert isinstance(best_price, (int, float)), f"Price should be numeric: {best_price}"
        
        print(f"✓ All prices are in valid numeric format")


class TestHomepageAvailability:
    """Test that homepage still works"""
    
    def test_homepage_loads(self):
        """Verify homepage returns 200"""
        response = requests.get(f"{BASE_URL}/")
        assert response.status_code == 200
        assert "EconomizeBem" in response.text
        print(f"✓ Homepage loads successfully")
    
    def test_api_root(self):
        """Verify API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✓ API root: {data}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

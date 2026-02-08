#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class EconomizaiAPITester:
    def __init__(self, base_url="https://economizebem-1.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json() if response.content else {}
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                self.failed_tests.append({
                    'name': name,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'response': response.text[:200]
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                'name': name,
                'error': str(e)
            })
            return False, {}

    def test_health_endpoints(self):
        """Test basic health endpoints"""
        print("\n" + "="*50)
        print("TESTING HEALTH ENDPOINTS")
        print("="*50)
        
        self.run_test("API Root", "GET", "", 200)
        self.run_test("Health Check", "GET", "health", 200)

    def test_products_api(self):
        """Test products endpoints"""
        print("\n" + "="*50)
        print("TESTING PRODUCTS API")
        print("="*50)
        
        # Test get all products
        success, products = self.run_test("Get All Products", "GET", "products", 200)
        if success and products:
            print(f"   Found {len(products)} products")
            
            # Test search
            self.run_test("Search Products", "GET", "products?search=iPhone", 200)
            
            # Test category filter
            self.run_test("Filter by Category", "GET", "products?category=smartphones", 200)
            
            # Test get single product
            if products and len(products) > 0:
                product_id = products[0].get('id')
                self.run_test("Get Single Product", "GET", f"products/{product_id}", 200)
            
            # Test invalid product
            self.run_test("Get Invalid Product", "GET", "products/invalid-id", 404)
        
        # Test categories
        self.run_test("Get Categories", "GET", "products/categories/list", 200)

    def test_plans_api(self):
        """Test plans endpoints"""
        print("\n" + "="*50)
        print("TESTING PLANS API")
        print("="*50)
        
        # Test internet plans
        success, internet = self.run_test("Get Internet Plans", "GET", "plans/internet", 200)
        if success and internet:
            print(f"   Found {len(internet)} internet plans")
        
        # Test mobile plans
        success, mobile = self.run_test("Get Mobile Plans", "GET", "plans/mobile", 200)
        if success and mobile:
            print(f"   Found {len(mobile)} mobile plans")
        
        # Test streaming plans
        success, streaming = self.run_test("Get Streaming Plans", "GET", "plans/streaming", 200)
        if success and streaming:
            print(f"   Found {len(streaming)} streaming plans")
        
        # Test with filters
        self.run_test("Filter Internet Plans", "GET", "plans/internet?min_speed=300&max_price=150", 200)
        self.run_test("Filter Mobile Plans", "GET", "plans/mobile?min_data=20&max_price=60", 200)
        self.run_test("Filter Streaming Plans", "GET", "plans/streaming?min_screens=2&max_price=40", 200)

    def test_auth_flow(self):
        """Test authentication flow"""
        print("\n" + "="*50)
        print("TESTING AUTHENTICATION")
        print("="*50)
        
        # Generate unique test user
        timestamp = datetime.now().strftime('%H%M%S')
        test_email = f"test_user_{timestamp}@economizai.com"
        test_password = "TestPass123!"
        test_name = f"Test User {timestamp}"
        
        # Test registration
        register_data = {
            "name": test_name,
            "email": test_email,
            "password": test_password
        }
        success, register_response = self.run_test("User Registration", "POST", "auth/register", 200, register_data)
        
        if success and 'token' in register_response:
            self.token = register_response['token']
            self.user_id = register_response.get('user', {}).get('id')
            print(f"   Registered user: {test_email}")
            
            # Test get current user
            self.run_test("Get Current User", "GET", "auth/me", 200)
            
            # Test duplicate registration
            self.run_test("Duplicate Registration", "POST", "auth/register", 400, register_data)
            
            # Clear token for login test
            old_token = self.token
            self.token = None
            
            # Test login
            login_data = {"email": test_email, "password": test_password}
            success, login_response = self.run_test("User Login", "POST", "auth/login", 200, login_data)
            
            if success and 'token' in login_response:
                self.token = login_response['token']
                print(f"   Login successful")
                
                # Test invalid login
                invalid_login = {"email": test_email, "password": "wrongpassword"}
                self.run_test("Invalid Login", "POST", "auth/login", 401, invalid_login)
                
                # Test profile update
                update_data = {"name": f"Updated {test_name}"}
                self.run_test("Update Profile", "PUT", "auth/profile", 200, update_data)
                
                # Test password change
                password_data = {
                    "current_password": test_password,
                    "new_password": "NewPass123!"
                }
                self.run_test("Change Password", "PUT", "auth/change-password", 200, password_data)
                
                # Test forgot password
                forgot_data = {"email": test_email}
                self.run_test("Forgot Password", "POST", "auth/forgot-password", 200, forgot_data)
                
                return True
            else:
                print("❌ Login failed, cannot continue with authenticated tests")
                return False
        else:
            print("❌ Registration failed, cannot continue with authenticated tests")
            return False

    def test_favorites_api(self):
        """Test favorites endpoints (requires auth)"""
        if not self.token:
            print("\n⚠️  Skipping favorites tests - no auth token")
            return
            
        print("\n" + "="*50)
        print("TESTING FAVORITES API")
        print("="*50)
        
        # Test get favorites
        success, favorites = self.run_test("Get Favorites", "GET", "favorites", 200)
        
        # Test add favorite product
        favorite_data = {
            "item_type": "product",
            "item_id": "test-product-1",
            "item_data": {
                "name": "Test Product",
                "image": "https://example.com/image.jpg",
                "best_price": 99.99
            }
        }
        self.run_test("Add Product Favorite", "POST", "favorites", 200, favorite_data)
        
        # Test add favorite plan
        plan_favorite_data = {
            "item_type": "plan",
            "item_id": "test-plan-1",
            "item_data": {
                "provider": "Test Provider",
                "name": "Test Plan",
                "price": 49.99
            }
        }
        self.run_test("Add Plan Favorite", "POST", "favorites", 200, plan_favorite_data)
        
        # Test remove favorite
        self.run_test("Remove Product Favorite", "DELETE", "favorites/product/test-product-1", 200)
        self.run_test("Remove Plan Favorite", "DELETE", "favorites/plan/test-plan-1", 200)

    def test_alerts_api(self):
        """Test price alerts endpoints (requires auth)"""
        if not self.token:
            print("\n⚠️  Skipping alerts tests - no auth token")
            return
            
        print("\n" + "="*50)
        print("TESTING PRICE ALERTS API")
        print("="*50)
        
        # Test get alerts
        success, alerts = self.run_test("Get Price Alerts", "GET", "alerts", 200)
        
        # Test create alert
        alert_data = {
            "product_id": "test-product-1",
            "product_name": "Test Product Alert",
            "product_image": "https://example.com/image.jpg",
            "target_price": 50.00,
            "current_price": 99.99
        }
        success, alert_response = self.run_test("Create Price Alert", "POST", "alerts", 200, alert_data)
        
        if success and 'id' in alert_response:
            alert_id = alert_response['id']
            
            # Test update alert
            update_data = {"target_price": 45.00}
            self.run_test("Update Price Alert", "PUT", f"alerts/{alert_id}", 200, update_data)
            
            # Test delete alert
            self.run_test("Delete Price Alert", "DELETE", f"alerts/{alert_id}", 200)
        
        # Test invalid alert operations
        self.run_test("Update Invalid Alert", "PUT", "alerts/invalid-id", 404, {"target_price": 30.00})
        self.run_test("Delete Invalid Alert", "DELETE", "alerts/invalid-id", 404)

    def test_expenses_api(self):
        """Test expenses endpoints (requires auth)"""
        if not self.token:
            print("\n⚠️  Skipping expenses tests - no auth token")
            return
            
        print("\n" + "="*50)
        print("TESTING EXPENSES API")
        print("="*50)
        
        # Test get expenses
        success, expenses = self.run_test("Get Expenses", "GET", "expenses", 200)
        
        # Test get expenses summary
        success, summary = self.run_test("Get Expenses Summary", "GET", "expenses/summary", 200)
        
        # Test create expense
        expense_data = {
            "category": "mercado",
            "description": "Compras do mês",
            "amount": 250.50,
            "month": "2024-12"
        }
        success, expense_response = self.run_test("Create Expense", "POST", "expenses", 200, expense_data)
        
        if success and 'id' in expense_response:
            expense_id = expense_response['id']
            
            # Test update expense
            update_data = {"amount": 275.00}
            self.run_test("Update Expense", "PUT", f"expenses/{expense_id}", 200, update_data)
            
            # Test get expenses with month filter
            self.run_test("Get Expenses by Month", "GET", "expenses?month=2024-12", 200)
            
            # Test get summary with month filter
            self.run_test("Get Summary by Month", "GET", "expenses/summary?month=2024-12", 200)
            
            # Test delete expense
            self.run_test("Delete Expense", "DELETE", f"expenses/{expense_id}", 200)
        
        # Test invalid expense operations
        self.run_test("Update Invalid Expense", "PUT", "expenses/invalid-id", 404, {"amount": 100.00})
        self.run_test("Delete Invalid Expense", "DELETE", "expenses/invalid-id", 404)

    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*60)
        print("TEST SUMMARY")
        print("="*60)
        print(f"Total tests run: {self.tests_run}")
        print(f"Tests passed: {self.tests_passed}")
        print(f"Tests failed: {len(self.failed_tests)}")
        print(f"Success rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.failed_tests:
            print("\n❌ FAILED TESTS:")
            for i, test in enumerate(self.failed_tests, 1):
                print(f"{i}. {test['name']}")
                if 'error' in test:
                    print(f"   Error: {test['error']}")
                else:
                    print(f"   Expected: {test['expected']}, Got: {test['actual']}")
                    if test.get('response'):
                        print(f"   Response: {test['response']}")
        
        return len(self.failed_tests) == 0

def main():
    print("🚀 Starting Economizaí API Tests")
    print("="*60)
    
    tester = EconomizaiAPITester()
    
    # Run all test suites
    tester.test_health_endpoints()
    tester.test_products_api()
    tester.test_plans_api()
    
    # Auth flow test (this sets up token for other tests)
    auth_success = tester.test_auth_flow()
    
    if auth_success:
        tester.test_favorites_api()
        tester.test_alerts_api()
        tester.test_expenses_api()
    
    # Print final summary
    success = tester.print_summary()
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
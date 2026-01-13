from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import resend

# Import email templates
from email_templates import (
    welcome_email, 
    password_reset_email, 
    price_alert_email,
    favorite_price_drop_email,
    weekly_deals_email
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'economizai-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Resend Config
resend.api_key = os.environ.get('RESEND_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')

# Create the main app
app = FastAPI(title="Economize Bem API", version="1.0.0")
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    created_at: str

class ForgotPassword(BaseModel):
    email: EmailStr

class ResetPassword(BaseModel):
    token: str
    new_password: str

class ChangePassword(BaseModel):
    current_password: str
    new_password: str

class PriceAlertCreate(BaseModel):
    product_id: str
    product_name: str
    product_image: str
    target_price: float
    current_price: float

class PriceAlertUpdate(BaseModel):
    target_price: Optional[float] = None
    is_active: Optional[bool] = None

class ExpenseCreate(BaseModel):
    category: str
    description: str
    amount: float
    month: str  # Format: "2024-01"

class ExpenseUpdate(BaseModel):
    category: Optional[str] = None
    description: Optional[str] = None
    amount: Optional[float] = None

class FavoriteAdd(BaseModel):
    item_type: str  # "product", "plan", "store"
    item_id: str
    item_data: dict

# ==================== AUTH HELPERS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_token(user_id: str, expires_hours: int = JWT_EXPIRATION_HOURS) -> str:
    payload = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=expires_hours),
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
        if not user:
            raise HTTPException(status_code=401, detail="Usuário não encontrado")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")

# ==================== EMAIL HELPERS ====================

async def send_email(to: str, subject: str, html: str):
    if not resend.api_key:
        logger.warning("RESEND_API_KEY not configured, skipping email")
        return None
    try:
        # Replace template variables
        html = html.replace("{{unsubscribe_url}}", f"{os.environ.get('FRONTEND_URL', 'https://economizebem.com.br')}/unsubscribe")
        params = {
            "from": f"EconomizeBem <{SENDER_EMAIL}>",
            "to": [to],
            "subject": subject,
            "html": html
        }
        result = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Email sent to {to}: {subject}")
        return result
    except Exception as e:
        logger.error(f"Failed to send email to {to}: {e}")
        return None

async def send_welcome_email(to: str, user_name: str):
    """Envia email de boas-vindas"""
    email_data = welcome_email(user_name)
    return await send_email(to, email_data["subject"], email_data["html"])

async def send_password_reset_email(to: str, user_name: str, reset_link: str):
    """Envia email de recuperação de senha"""
    email_data = password_reset_email(user_name, reset_link)
    return await send_email(to, email_data["subject"], email_data["html"])

async def send_price_alert(to: str, user_name: str, product_name: str, product_image: str,
                           old_price: float, new_price: float, store: str, product_url: str):
    """Envia alerta de preço"""
    email_data = price_alert_email(user_name, product_name, product_image, old_price, new_price, store, product_url)
    return await send_email(to, email_data["subject"], email_data["html"])

async def send_favorite_alert(to: str, user_name: str, product_name: str, product_image: str,
                              old_price: float, new_price: float, store: str, product_url: str):
    """Envia alerta de favorito com preço baixo"""
    email_data = favorite_price_drop_email(user_name, product_name, product_image, old_price, new_price, store, product_url)
    return await send_email(to, email_data["subject"], email_data["html"])

async def send_weekly_newsletter(to: str, user_name: str, deals: list):
    """Envia newsletter semanal"""
    email_data = weekly_deals_email(user_name, deals)
    return await send_email(to, email_data["subject"], email_data["html"])

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register", response_model=dict)
async def register(user: UserCreate, background_tasks: BackgroundTasks):
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="E-mail já cadastrado")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "name": user.name,
        "email": user.email,
        "password": hash_password(user.password),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "email_preferences": {
            "weekly_deals": True,
            "price_alerts": True,
            "favorite_alerts": True
        },
        "favorites": {"products": [], "plans": [], "stores": []}
    }
    await db.users.insert_one(user_doc)
    
    # Enviar email de boas-vindas
    background_tasks.add_task(send_welcome_email, user.email, user.name)
    
    token = create_token(user_id)
    return {"token": token, "user": {"id": user_id, "name": user.name, "email": user.email}}

@api_router.post("/auth/login", response_model=dict)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    
    token = create_token(user["id"])
    return {"token": token, "user": {"id": user["id"], "name": user["name"], "email": user["email"]}}

@api_router.post("/auth/forgot-password")
async def forgot_password(data: ForgotPassword, background_tasks: BackgroundTasks):
    user = await db.users.find_one({"email": data.email}, {"_id": 0})
    if not user:
        return {"message": "Se o e-mail existir, você receberá um link de recuperação"}
    
    reset_token = str(uuid.uuid4())
    expires = datetime.now(timezone.utc) + timedelta(hours=1)
    await db.password_resets.insert_one({
        "token": reset_token,
        "user_id": user["id"],
        "expires": expires.isoformat()
    })
    
    reset_link = f"{os.environ.get('FRONTEND_URL', 'https://economizebem.com.br')}/reset-password?token={reset_token}"
    background_tasks.add_task(send_password_reset_email, data.email, user['name'], reset_link)
    return {"message": "Se o e-mail existir, você receberá um link de recuperação"}

@api_router.post("/auth/reset-password")
async def reset_password(data: ResetPassword):
    reset_doc = await db.password_resets.find_one({"token": data.token}, {"_id": 0})
    if not reset_doc:
        raise HTTPException(status_code=400, detail="Token inválido")
    
    if datetime.fromisoformat(reset_doc["expires"]) < datetime.now(timezone.utc):
        await db.password_resets.delete_one({"token": data.token})
        raise HTTPException(status_code=400, detail="Token expirado")
    
    await db.users.update_one(
        {"id": reset_doc["user_id"]},
        {"$set": {"password": hash_password(data.new_password)}}
    )
    await db.password_resets.delete_one({"token": data.token})
    return {"message": "Senha alterada com sucesso"}

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(user: dict = Depends(get_current_user)):
    return UserResponse(id=user["id"], name=user["name"], email=user["email"], created_at=user["created_at"])

@api_router.put("/auth/profile")
async def update_profile(data: UserUpdate, user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="Nenhum dado para atualizar")
    
    if "email" in update_data:
        existing = await db.users.find_one({"email": update_data["email"], "id": {"$ne": user["id"]}})
        if existing:
            raise HTTPException(status_code=400, detail="E-mail já em uso")
    
    await db.users.update_one({"id": user["id"]}, {"$set": update_data})
    return {"message": "Perfil atualizado com sucesso"}

@api_router.put("/auth/change-password")
async def change_password(data: ChangePassword, user: dict = Depends(get_current_user)):
    user_doc = await db.users.find_one({"id": user["id"]}, {"_id": 0})
    if not verify_password(data.current_password, user_doc["password"]):
        raise HTTPException(status_code=400, detail="Senha atual incorreta")
    
    await db.users.update_one({"id": user["id"]}, {"$set": {"password": hash_password(data.new_password)}})
    return {"message": "Senha alterada com sucesso"}

# ==================== FAVORITES ROUTES ====================

@api_router.get("/favorites")
async def get_favorites(user: dict = Depends(get_current_user)):
    user_doc = await db.users.find_one({"id": user["id"]}, {"_id": 0, "favorites": 1})
    return user_doc.get("favorites", {"products": [], "plans": [], "stores": []})

@api_router.post("/favorites")
async def add_favorite(data: FavoriteAdd, user: dict = Depends(get_current_user)):
    field = f"favorites.{data.item_type}s"
    await db.users.update_one(
        {"id": user["id"]},
        {"$addToSet": {field: {"item_id": data.item_id, **data.item_data}}}
    )
    return {"message": "Favorito adicionado"}

@api_router.delete("/favorites/{item_type}/{item_id}")
async def remove_favorite(item_type: str, item_id: str, user: dict = Depends(get_current_user)):
    field = f"favorites.{item_type}s"
    await db.users.update_one(
        {"id": user["id"]},
        {"$pull": {field: {"item_id": item_id}}}
    )
    return {"message": "Favorito removido"}

# ==================== PRICE ALERTS ROUTES ====================

@api_router.get("/alerts")
async def get_alerts(user: dict = Depends(get_current_user)):
    alerts = await db.price_alerts.find({"user_id": user["id"]}, {"_id": 0}).to_list(100)
    return alerts

@api_router.post("/alerts")
async def create_alert(data: PriceAlertCreate, user: dict = Depends(get_current_user)):
    alert_id = str(uuid.uuid4())
    alert_doc = {
        "id": alert_id,
        "user_id": user["id"],
        "product_id": data.product_id,
        "product_name": data.product_name,
        "product_image": data.product_image,
        "target_price": data.target_price,
        "current_price": data.current_price,
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.price_alerts.insert_one(alert_doc)
    return {"id": alert_id, "message": "Alerta criado com sucesso"}

@api_router.put("/alerts/{alert_id}")
async def update_alert(alert_id: str, data: PriceAlertUpdate, user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    result = await db.price_alerts.update_one(
        {"id": alert_id, "user_id": user["id"]},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Alerta não encontrado")
    return {"message": "Alerta atualizado"}

@api_router.delete("/alerts/{alert_id}")
async def delete_alert(alert_id: str, user: dict = Depends(get_current_user)):
    result = await db.price_alerts.delete_one({"id": alert_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Alerta não encontrado")
    return {"message": "Alerta removido"}

# ==================== EXPENSES ROUTES ====================

@api_router.get("/expenses")
async def get_expenses(month: Optional[str] = None, user: dict = Depends(get_current_user)):
    query = {"user_id": user["id"]}
    if month:
        query["month"] = month
    expenses = await db.expenses.find(query, {"_id": 0}).to_list(500)
    return expenses

@api_router.get("/expenses/summary")
async def get_expenses_summary(month: Optional[str] = None, user: dict = Depends(get_current_user)):
    query = {"user_id": user["id"]}
    if month:
        query["month"] = month
    expenses = await db.expenses.find(query, {"_id": 0}).to_list(500)
    
    by_category = {}
    total = 0
    for exp in expenses:
        cat = exp["category"]
        by_category[cat] = by_category.get(cat, 0) + exp["amount"]
        total += exp["amount"]
    
    return {"total": total, "by_category": by_category, "count": len(expenses)}

@api_router.post("/expenses")
async def create_expense(data: ExpenseCreate, user: dict = Depends(get_current_user)):
    expense_id = str(uuid.uuid4())
    expense_doc = {
        "id": expense_id,
        "user_id": user["id"],
        "category": data.category,
        "description": data.description,
        "amount": data.amount,
        "month": data.month,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.expenses.insert_one(expense_doc)
    return {"id": expense_id, "message": "Despesa adicionada"}

@api_router.put("/expenses/{expense_id}")
async def update_expense(expense_id: str, data: ExpenseUpdate, user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    result = await db.expenses.update_one(
        {"id": expense_id, "user_id": user["id"]},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Despesa não encontrada")
    return {"message": "Despesa atualizada"}

@api_router.delete("/expenses/{expense_id}")
async def delete_expense(expense_id: str, user: dict = Depends(get_current_user)):
    result = await db.expenses.delete_one({"id": expense_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Despesa não encontrada")
    return {"message": "Despesa removida"}

# ==================== PRODUCTS ROUTES (MOCK DATA) ====================

MOCK_PRODUCTS = [
    {"id": "1", "name": "iPhone 15 Pro 128GB", "category": "smartphones", "image": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400", "stores": [
        {"store": "Amazon", "price": 7999.00, "original_price": 8999.00, "rating": 4.8, "delivery_days": 2, "shipping": 0, "url": "https://amazon.com.br"},
        {"store": "Magazine Luiza", "price": 8199.00, "original_price": 8999.00, "rating": 4.7, "delivery_days": 3, "shipping": 0, "url": "https://magazineluiza.com.br"},
        {"store": "Mercado Livre", "price": 7899.00, "original_price": 8500.00, "rating": 4.6, "delivery_days": 4, "shipping": 29.90, "url": "https://mercadolivre.com.br"},
        {"store": "Casas Bahia", "price": 8299.00, "original_price": 8999.00, "rating": 4.5, "delivery_days": 5, "shipping": 0, "url": "https://casasbahia.com.br"},
    ]},
    {"id": "2", "name": "Samsung Galaxy S24 Ultra 256GB", "category": "smartphones", "image": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400", "stores": [
        {"store": "Amazon", "price": 6999.00, "original_price": 7999.00, "rating": 4.9, "delivery_days": 1, "shipping": 0, "url": "https://amazon.com.br"},
        {"store": "Shopee", "price": 6799.00, "original_price": 7500.00, "rating": 4.4, "delivery_days": 7, "shipping": 19.90, "url": "https://shopee.com.br"},
        {"store": "Magazine Luiza", "price": 7199.00, "original_price": 7999.00, "rating": 4.7, "delivery_days": 2, "shipping": 0, "url": "https://magazineluiza.com.br"},
    ]},
    {"id": "3", "name": "Smart TV LG 55\" 4K OLED", "category": "tvs", "image": "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400", "stores": [
        {"store": "Amazon", "price": 4299.00, "original_price": 5999.00, "rating": 4.8, "delivery_days": 3, "shipping": 0, "url": "https://amazon.com.br"},
        {"store": "Casas Bahia", "price": 4499.00, "original_price": 5999.00, "rating": 4.6, "delivery_days": 5, "shipping": 0, "url": "https://casasbahia.com.br"},
        {"store": "Magazine Luiza", "price": 4399.00, "original_price": 5999.00, "rating": 4.7, "delivery_days": 4, "shipping": 0, "url": "https://magazineluiza.com.br"},
    ]},
    {"id": "4", "name": "PlayStation 5 Digital Edition", "category": "games", "image": "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400", "stores": [
        {"store": "Amazon", "price": 3499.00, "original_price": 3999.00, "rating": 4.9, "delivery_days": 2, "shipping": 0, "url": "https://amazon.com.br"},
        {"store": "Magazine Luiza", "price": 3599.00, "original_price": 3999.00, "rating": 4.8, "delivery_days": 3, "shipping": 0, "url": "https://magazineluiza.com.br"},
        {"store": "Mercado Livre", "price": 3399.00, "original_price": 3800.00, "rating": 4.5, "delivery_days": 5, "shipping": 39.90, "url": "https://mercadolivre.com.br"},
    ]},
    {"id": "5", "name": "MacBook Air M3 13\" 256GB", "category": "notebooks", "image": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400", "stores": [
        {"store": "Amazon", "price": 10999.00, "original_price": 12999.00, "rating": 4.9, "delivery_days": 2, "shipping": 0, "url": "https://amazon.com.br"},
        {"store": "Magazine Luiza", "price": 11299.00, "original_price": 12999.00, "rating": 4.8, "delivery_days": 3, "shipping": 0, "url": "https://magazineluiza.com.br"},
    ]},
    {"id": "6", "name": "Airfryer Philips Walita 4.1L", "category": "eletrodomesticos", "image": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400", "stores": [
        {"store": "Amazon", "price": 399.00, "original_price": 599.00, "rating": 4.7, "delivery_days": 1, "shipping": 0, "url": "https://amazon.com.br"},
        {"store": "Casas Bahia", "price": 449.00, "original_price": 599.00, "rating": 4.5, "delivery_days": 4, "shipping": 0, "url": "https://casasbahia.com.br"},
        {"store": "Shopee", "price": 379.00, "original_price": 550.00, "rating": 4.3, "delivery_days": 8, "shipping": 15.90, "url": "https://shopee.com.br"},
    ]},
    {"id": "7", "name": "Fone JBL Tune 520BT Bluetooth", "category": "acessorios", "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400", "stores": [
        {"store": "Amazon", "price": 199.00, "original_price": 299.00, "rating": 4.6, "delivery_days": 1, "shipping": 0, "url": "https://amazon.com.br"},
        {"store": "Mercado Livre", "price": 179.00, "original_price": 280.00, "rating": 4.4, "delivery_days": 3, "shipping": 9.90, "url": "https://mercadolivre.com.br"},
        {"store": "Magazine Luiza", "price": 219.00, "original_price": 299.00, "rating": 4.7, "delivery_days": 2, "shipping": 0, "url": "https://magazineluiza.com.br"},
    ]},
    {"id": "8", "name": "Cafeteira Nespresso Essenza Mini", "category": "eletrodomesticos", "image": "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400", "stores": [
        {"store": "Amazon", "price": 499.00, "original_price": 699.00, "rating": 4.8, "delivery_days": 2, "shipping": 0, "url": "https://amazon.com.br"},
        {"store": "Casas Bahia", "price": 549.00, "original_price": 699.00, "rating": 4.6, "delivery_days": 4, "shipping": 0, "url": "https://casasbahia.com.br"},
    ]},
]

@api_router.get("/products")
async def get_products(search: Optional[str] = None, category: Optional[str] = None):
    products = MOCK_PRODUCTS
    if search:
        search_lower = search.lower()
        products = [p for p in products if search_lower in p["name"].lower()]
    if category:
        products = [p for p in products if p["category"] == category]
    
    # Add best price info
    for p in products:
        prices = [s["price"] for s in p["stores"]]
        p["best_price"] = min(prices)
        p["worst_price"] = max(prices)
    
    return products

@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    for p in MOCK_PRODUCTS:
        if p["id"] == product_id:
            prices = [s["price"] for s in p["stores"]]
            p["best_price"] = min(prices)
            p["worst_price"] = max(prices)
            return p
    raise HTTPException(status_code=404, detail="Produto não encontrado")

@api_router.get("/products/categories/list")
async def get_categories():
    categories = list(set(p["category"] for p in MOCK_PRODUCTS))
    return [
        {"id": "smartphones", "name": "Smartphones", "icon": "smartphone"},
        {"id": "tvs", "name": "TVs", "icon": "tv"},
        {"id": "notebooks", "name": "Notebooks", "icon": "laptop"},
        {"id": "games", "name": "Games", "icon": "gamepad"},
        {"id": "eletrodomesticos", "name": "Eletrodomésticos", "icon": "home"},
        {"id": "acessorios", "name": "Acessórios", "icon": "headphones"},
    ]

# ==================== PLANS ROUTES (MOCK DATA) ====================

MOCK_INTERNET_PLANS = [
    {"id": "int1", "provider": "Vivo Fibra", "name": "300 Mega", "speed": 300, "price": 99.99, "features": ["Wi-Fi 6", "Instalação grátis", "Sem fidelidade"], "loyalty_months": 0, "rating": 4.5, "popular": True},
    {"id": "int2", "provider": "Claro", "name": "500 Mega", "speed": 500, "price": 119.99, "features": ["Wi-Fi 6", "Claro Video incluso", "12 meses fidelidade"], "loyalty_months": 12, "rating": 4.3, "popular": False},
    {"id": "int3", "provider": "Tim Live", "name": "400 Mega", "speed": 400, "price": 109.99, "features": ["Wi-Fi 5", "Paramount+ incluso", "Sem fidelidade"], "loyalty_months": 0, "rating": 4.4, "popular": False},
    {"id": "int4", "provider": "Oi Fibra", "name": "200 Mega", "speed": 200, "price": 79.99, "features": ["Wi-Fi 5", "Deezer incluso"], "loyalty_months": 0, "rating": 4.2, "popular": False},
    {"id": "int5", "provider": "Vivo Fibra", "name": "600 Mega", "speed": 600, "price": 149.99, "features": ["Wi-Fi 6E", "Paramount+ incluso", "Netflix incluso"], "loyalty_months": 0, "rating": 4.7, "popular": True},
]

MOCK_MOBILE_PLANS = [
    {"id": "mob1", "provider": "Vivo", "name": "Vivo Selfie", "data_gb": 25, "price": 54.99, "features": ["WhatsApp ilimitado", "Ligações ilimitadas", "Roaming nacional"], "loyalty_months": 0, "rating": 4.4, "popular": True},
    {"id": "mob2", "provider": "Claro", "name": "Claro Flex", "data_gb": 30, "price": 49.99, "features": ["Apps ilimitados", "Ligações ilimitadas", "5G incluso"], "loyalty_months": 0, "rating": 4.5, "popular": True},
    {"id": "mob3", "provider": "Tim", "name": "Tim Controle", "data_gb": 20, "price": 44.99, "features": ["Deezer incluso", "Ligações ilimitadas", "Bônus madrugada"], "loyalty_months": 12, "rating": 4.3, "popular": False},
    {"id": "mob4", "provider": "Oi", "name": "Oi Livre", "data_gb": 15, "price": 39.99, "features": ["Redes sociais ilimitadas", "Ligações ilimitadas"], "loyalty_months": 0, "rating": 4.1, "popular": False},
]

MOCK_STREAMING_PLANS = [
    {"id": "str1", "provider": "Netflix", "name": "Padrão com anúncios", "screens": 2, "price": 18.90, "features": ["Full HD", "Downloads em 2 dispositivos"], "quality": "HD", "rating": 4.6, "popular": False},
    {"id": "str2", "provider": "Netflix", "name": "Padrão", "screens": 2, "price": 39.90, "features": ["Full HD", "Sem anúncios", "Downloads"], "quality": "Full HD", "rating": 4.7, "popular": True},
    {"id": "str3", "provider": "Netflix", "name": "Premium", "screens": 4, "price": 55.90, "features": ["4K + HDR", "Áudio espacial", "4 downloads"], "quality": "4K", "rating": 4.9, "popular": False},
    {"id": "str4", "provider": "Disney+", "name": "Padrão", "screens": 4, "price": 33.90, "features": ["4K", "Disney, Marvel, Star Wars", "4 telas simultâneas"], "quality": "4K", "rating": 4.8, "popular": True},
    {"id": "str5", "provider": "HBO Max", "name": "Padrão", "screens": 3, "price": 34.90, "features": ["4K", "HBO, Warner, DC", "Downloads"], "quality": "4K", "rating": 4.5, "popular": False},
    {"id": "str6", "provider": "Amazon Prime Video", "name": "Prime", "screens": 3, "price": 14.90, "features": ["4K", "Prime incluso", "Frete grátis Amazon"], "quality": "4K", "rating": 4.6, "popular": True},
    {"id": "str7", "provider": "Globoplay", "name": "Padrão", "screens": 4, "price": 24.90, "features": ["Full HD", "Novelas e séries", "Ao vivo"], "quality": "Full HD", "rating": 4.3, "popular": False},
]

@api_router.get("/plans/internet")
async def get_internet_plans(min_speed: Optional[int] = None, max_price: Optional[float] = None):
    plans = MOCK_INTERNET_PLANS
    if min_speed:
        plans = [p for p in plans if p["speed"] >= min_speed]
    if max_price:
        plans = [p for p in plans if p["price"] <= max_price]
    return sorted(plans, key=lambda x: x["price"])

@api_router.get("/plans/mobile")
async def get_mobile_plans(min_data: Optional[int] = None, max_price: Optional[float] = None):
    plans = MOCK_MOBILE_PLANS
    if min_data:
        plans = [p for p in plans if p["data_gb"] >= min_data]
    if max_price:
        plans = [p for p in plans if p["price"] <= max_price]
    return sorted(plans, key=lambda x: x["price"])

@api_router.get("/plans/streaming")
async def get_streaming_plans(min_screens: Optional[int] = None, max_price: Optional[float] = None):
    plans = MOCK_STREAMING_PLANS
    if min_screens:
        plans = [p for p in plans if p["screens"] >= min_screens]
    if max_price:
        plans = [p for p in plans if p["price"] <= max_price]
    return sorted(plans, key=lambda x: x["price"])

# ==================== ROOT ====================

@api_router.get("/")
async def root():
    return {"message": "Economize Bem API", "version": "1.0.0"}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

# Include router and middleware
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

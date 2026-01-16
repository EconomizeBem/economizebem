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
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Import email templates
from email_templates import (
    welcome_email, 
    password_reset_email, 
    price_alert_email,
    favorite_price_drop_email,
    weekly_deals_email
)

# Import product and alert services
import product_service
import alert_service

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Inject database into services
product_service.set_database(db)
alert_service.set_database(db)

# Note: Email function will be injected after send_email is defined

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'economizai-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# SMTP Config (Zoho Mail)
SMTP_HOST = os.environ.get('SMTP_HOST', 'smtp.zoho.com')
SMTP_PORT = int(os.environ.get('SMTP_PORT', 587))
SMTP_USER = os.environ.get('SMTP_USER', '')
SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'contato@economizebem.com.br')
SENDER_NAME = os.environ.get('SENDER_NAME', 'EconomizeBem')

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

def send_email_sync(to: str, subject: str, html: str):
    """Envia email via SMTP (síncrono)"""
    if not SMTP_USER or not SMTP_PASSWORD:
        logger.warning("SMTP credentials not configured, skipping email")
        return None
    
    try:
        # Replace template variables
        html = html.replace("{{unsubscribe_url}}", f"{os.environ.get('FRONTEND_URL', 'https://economizebem.com.br')}/unsubscribe")
        
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = f"{SENDER_NAME} <{SENDER_EMAIL}>"
        msg['To'] = to
        
        # Attach HTML content
        html_part = MIMEText(html, 'html', 'utf-8')
        msg.attach(html_part)
        
        # Send via SMTP
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SENDER_EMAIL, to, msg.as_string())
        
        logger.info(f"Email sent to {to}: {subject}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to}: {e}")
        return None

async def send_email(to: str, subject: str, html: str):
    """Envia email via SMTP (assíncrono)"""
    return await asyncio.to_thread(send_email_sync, to, subject, html)

# Inject email function into alert service
alert_service.set_email_function(send_email)

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

# ==================== PRODUCTS ROUTES (REAL DATA via SerpAPI) ====================

# Categorias disponíveis para busca
PRODUCT_CATEGORIES = [
    {"id": "smartphones", "name": "Smartphones", "icon": "smartphone", "query": "smartphone celular"},
    {"id": "tvs", "name": "TVs", "icon": "tv", "query": "smart tv televisão"},
    {"id": "notebooks", "name": "Notebooks", "icon": "laptop", "query": "notebook laptop"},
    {"id": "games", "name": "Games", "icon": "gamepad", "query": "video game console"},
    {"id": "eletrodomesticos", "name": "Eletrodomésticos", "icon": "home", "query": "eletrodoméstico"},
    {"id": "acessorios", "name": "Acessórios", "icon": "headphones", "query": "fone bluetooth acessório"},
]

@api_router.get("/products")
async def get_products(search: Optional[str] = None, category: Optional[str] = None):
    """
    Busca produtos via Google Shopping (SerpAPI)
    Usa cache de 24h para otimizar custos
    """
    # Se não houver busca, retorna produtos populares
    if not search and not category:
        products = await product_service.get_popular_products(limit=12)
    else:
        # Busca específica
        query = search or ""
        if category:
            cat_info = next((c for c in PRODUCT_CATEGORIES if c["id"] == category), None)
            if cat_info and not search:
                query = cat_info["query"]
        
        products = await product_service.search_google_shopping(
            query=query,
            category=category,
            num_results=20
        )
    
    # Formatar resposta para compatibilidade com frontend
    formatted_products = []
    for p in products:
        # Pegar a URL da oferta (link do SerpAPI)
        offer_url = p.get("link") or p.get("url") or None
        # Validar que é uma URL válida
        if offer_url and not offer_url.startswith("http"):
            offer_url = None
            
        formatted_products.append({
            "id": p.get("id", ""),
            "name": p.get("name", ""),
            "category": category or "geral",
            "image": p.get("image", ""),
            "best_price": p.get("price"),
            "worst_price": p.get("original_price") or p.get("price"),
            "offer_url": offer_url,  # URL padronizada no nível do produto
            "stores": [{
                "store": p.get("store", ""),
                "price": p.get("price"),
                "original_price": p.get("original_price"),
                "rating": p.get("rating"),
                "delivery_days": None,
                "shipping": 0 if "grátis" in (p.get("delivery") or "").lower() else None,
                "url": offer_url,  # Mesmo URL para a loja
                "offer_url": offer_url  # Campo adicional padronizado
            }]
        })
    
    return formatted_products

@api_router.get("/products/search")
async def search_products(q: str, limit: int = 20):
    """Endpoint de busca direta"""
    products = await product_service.search_google_shopping(
        query=q,
        num_results=limit
    )
    return products

@api_router.get("/products/categories/list")
async def get_categories():
    """Retorna categorias disponíveis"""
    return PRODUCT_CATEGORIES

@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    """Busca detalhes de um produto específico"""
    product = await product_service.get_product_details(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return product

@api_router.get("/products/cache/stats")
async def get_cache_stats():
    """Retorna estatísticas do cache de produtos"""
    return await product_service.get_cache_stats()

@api_router.post("/products/cache/clear")
async def clear_cache():
    """Limpa cache expirado"""
    deleted = await product_service.clear_expired_cache()
    return {"message": f"{deleted} entradas de cache removidas"}

# ==================== PRICE ALERT CHECK ROUTES ====================

@api_router.post("/alerts/check")
async def trigger_price_alert_check(background_tasks: BackgroundTasks, force: bool = False):
    """
    Dispara verificação de todos os alertas de preço ativos
    Pode ser chamado manualmente ou via cron job externo
    
    Args:
        force: Se True, ignora cooldown de 24h e verifica todos os alertas
    """
    background_tasks.add_task(alert_service.check_price_alerts, force)
    return {
        "message": "Verificação de alertas iniciada em segundo plano",
        "force_mode": force
    }

@api_router.post("/alerts/check-favorites")
async def trigger_favorite_check(background_tasks: BackgroundTasks):
    """Verifica preços de produtos favoritados"""
    background_tasks.add_task(alert_service.check_favorite_prices)
    return {"message": "Verificação de favoritos iniciada em segundo plano"}

@api_router.get("/alerts/check-history")
async def get_alert_check_history(limit: int = 10):
    """Retorna histórico de verificações de alertas"""
    return await alert_service.get_alert_check_history(limit)

# ==================== PLANS ROUTES (MOCK DATA - mantido por enquanto) ====================

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

# ==================== EMAIL PREFERENCES ROUTES ====================

class EmailPreferences(BaseModel):
    weekly_deals: Optional[bool] = None
    price_alerts: Optional[bool] = None
    favorite_alerts: Optional[bool] = None

@api_router.get("/email-preferences")
async def get_email_preferences(user: dict = Depends(get_current_user)):
    user_doc = await db.users.find_one({"id": user["id"]}, {"_id": 0, "email_preferences": 1})
    return user_doc.get("email_preferences", {
        "weekly_deals": True,
        "price_alerts": True,
        "favorite_alerts": True
    })

@api_router.put("/email-preferences")
async def update_email_preferences(prefs: EmailPreferences, user: dict = Depends(get_current_user)):
    update_data = {f"email_preferences.{k}": v for k, v in prefs.model_dump().items() if v is not None}
    if update_data:
        await db.users.update_one({"id": user["id"]}, {"$set": update_data})
    return {"message": "Preferências atualizadas"}

@api_router.post("/unsubscribe/{user_id}")
async def unsubscribe(user_id: str, email_type: Optional[str] = None):
    """Permite descadastrar de emails específicos ou todos"""
    if email_type:
        await db.users.update_one(
            {"id": user_id},
            {"$set": {f"email_preferences.{email_type}": False}}
        )
    else:
        await db.users.update_one(
            {"id": user_id},
            {"$set": {
                "email_preferences.weekly_deals": False,
                "email_preferences.price_alerts": False,
                "email_preferences.favorite_alerts": False
            }}
        )
    return {"message": "Inscrição cancelada com sucesso"}

# ==================== NEWSLETTER / ADMIN ROUTES ====================

@api_router.post("/admin/send-weekly-newsletter")
async def send_weekly_newsletter_to_all(background_tasks: BackgroundTasks):
    """Envia newsletter semanal para todos os usuários inscritos"""
    # Buscar usuários com weekly_deals ativo
    users = await db.users.find(
        {"email_preferences.weekly_deals": {"$ne": False}},
        {"_id": 0, "id": 1, "name": 1, "email": 1}
    ).to_list(10000)
    
    # Buscar produtos populares reais via SerpAPI para a newsletter
    popular_products = await product_service.get_popular_products(limit=6)
    
    # Preparar ofertas
    deals = []
    for product in popular_products:
        if product.get("original_price") and product.get("price") and product["original_price"] > product["price"]:
            deals.append({
                "name": product.get("name", ""),
                "image": product.get("image", ""),
                "price": product.get("price"),
                "original_price": product.get("original_price"),
                "store": product.get("store", ""),
                "url": product.get("link", "")
            })
    
    # Se não houver produtos com desconto, usar os produtos normais
    if not deals:
        for product in popular_products[:6]:
            deals.append({
                "name": product.get("name", ""),
                "image": product.get("image", ""),
                "price": product.get("price"),
                "original_price": product.get("price"),
                "store": product.get("store", ""),
                "url": product.get("link", "")
            })
    
    # Enviar para cada usuário
    sent_count = 0
    for user in users:
        background_tasks.add_task(send_weekly_newsletter, user["email"], user["name"], deals[:6])
        sent_count += 1
    
    return {"message": f"Newsletter agendada para {sent_count} usuários"}

@api_router.post("/admin/test-email/{email_type}")
async def test_email(email_type: str, test_email: str, background_tasks: BackgroundTasks):
    """Testa envio de um tipo específico de email"""
    if email_type == "welcome":
        background_tasks.add_task(send_welcome_email, test_email, "Usuário Teste")
    elif email_type == "password_reset":
        background_tasks.add_task(send_password_reset_email, test_email, "Usuário Teste", "https://economizebem.com.br/reset-password?token=test123")
    elif email_type == "price_alert":
        background_tasks.add_task(
            send_price_alert, test_email, "Usuário Teste",
            "iPhone 15 Pro 128GB", "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400",
            8999.00, 7499.00, "Amazon", "https://amazon.com.br"
        )
    elif email_type == "favorite_alert":
        background_tasks.add_task(
            send_favorite_alert, test_email, "Usuário Teste",
            "Samsung Galaxy S24 Ultra", "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400",
            7999.00, 6499.00, "Magazine Luiza", "https://magazineluiza.com.br"
        )
    elif email_type == "weekly":
        deals = [
            {"name": "iPhone 15 Pro 128GB", "image": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400", "price": 7499.00, "original_price": 8999.00, "store": "Amazon"},
            {"name": "Samsung Galaxy S24 Ultra", "image": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400", "price": 6499.00, "original_price": 7999.00, "store": "Shopee"},
            {"name": "Smart TV LG 55\" 4K OLED", "image": "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400", "price": 4299.00, "original_price": 5999.00, "store": "Amazon"},
        ]
        background_tasks.add_task(send_weekly_newsletter, test_email, "Usuário Teste", deals)
    else:
        raise HTTPException(status_code=400, detail="Tipo de email inválido")
    
    return {"message": f"Email de teste ({email_type}) enviado para {test_email}"}

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

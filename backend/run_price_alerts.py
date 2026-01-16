#!/usr/bin/env python3
"""
Script standalone para verificação de alertas de preço
Pode ser executado via:
  - python run_price_alerts.py
  - python -m run_price_alerts
  - Via cron job externo chamando o endpoint HTTP

Este script é IDEMPOTENTE:
  - Não envia alertas duplicados (cooldown de 24h)
  - Registra cada execução no banco
  - Pode ser executado múltiplas vezes com segurança
"""

import os
import sys
import asyncio
import logging
from datetime import datetime, timezone
from pathlib import Path

# Adicionar diretório atual ao path
sys.path.insert(0, str(Path(__file__).parent))

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

# Carregar variáveis de ambiente
load_dotenv(Path(__file__).parent / '.env')

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Importar serviços
import alert_service
import product_service

# Configurações de email
SMTP_HOST = os.environ.get('SMTP_HOST', 'smtp.zoho.com')
SMTP_PORT = int(os.environ.get('SMTP_PORT', 587))
SMTP_USER = os.environ.get('SMTP_USER', '')
SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD', '')
EMAIL_FROM = os.environ.get('EMAIL_FROM', SMTP_USER)


def send_email_sync(to: str, subject: str, html: str) -> bool:
    """Envia email via SMTP de forma síncrona"""
    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart
    
    if not SMTP_USER or not SMTP_PASSWORD:
        logger.error("SMTP credentials not configured")
        return False
    
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = f"EconomizeBem <{EMAIL_FROM}>"
        msg['To'] = to
        
        html_part = MIMEText(html, 'html', 'utf-8')
        msg.attach(html_part)
        
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(EMAIL_FROM, to, msg.as_string())
        
        logger.info(f"Email sent successfully to {to}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send email to {to}: {e}")
        return False


async def send_email_async(to: str, subject: str, html: str) -> bool:
    """Wrapper assíncrono para envio de email"""
    return await asyncio.to_thread(send_email_sync, to, subject, html)


async def main(force: bool = False):
    """
    Função principal para execução do job de alertas
    
    Args:
        force: Se True, ignora cooldown e verifica todos os alertas
    """
    logger.info("=" * 60)
    logger.info("INICIANDO VERIFICAÇÃO DE ALERTAS DE PREÇO")
    logger.info(f"Timestamp: {datetime.now(timezone.utc).isoformat()}")
    logger.info(f"Force mode: {force}")
    logger.info("=" * 60)
    
    # Conectar ao MongoDB
    mongo_url = os.environ.get('MONGO_URL')
    db_name = os.environ.get('DB_NAME', 'economizebem')
    
    if not mongo_url:
        logger.error("MONGO_URL não configurada!")
        sys.exit(1)
    
    try:
        client = AsyncIOMotorClient(mongo_url)
        db = client[db_name]
        
        # Testar conexão
        await db.command('ping')
        logger.info(f"Conectado ao MongoDB: {db_name}")
        
    except Exception as e:
        logger.error(f"Erro ao conectar ao MongoDB: {e}")
        sys.exit(1)
    
    # Injetar dependências nos serviços
    alert_service.set_database(db)
    alert_service.set_email_function(send_email_async)
    product_service.set_database(db)
    
    try:
        # Executar verificação de alertas de preço
        logger.info("\n--- Verificando Alertas de Preço ---")
        price_results = await alert_service.check_price_alerts(force=force)
        
        logger.info(f"Resultados dos Alertas de Preço:")
        logger.info(f"  - Total de alertas: {price_results.get('total_alerts', 0)}")
        logger.info(f"  - Verificados: {price_results.get('alerts_checked', 0)}")
        logger.info(f"  - Ignorados (cooldown): {price_results.get('alerts_skipped_cooldown', 0)}")
        logger.info(f"  - Ignorados (intervalo): {price_results.get('alerts_skipped_interval', 0)}")
        logger.info(f"  - Disparados: {price_results.get('alerts_triggered', 0)}")
        logger.info(f"  - Emails enviados: {price_results.get('emails_sent', 0)}")
        logger.info(f"  - Erros: {price_results.get('errors', 0)}")
        
        # Executar verificação de favoritos
        logger.info("\n--- Verificando Preços de Favoritos ---")
        favorite_results = await alert_service.check_favorite_prices()
        
        logger.info(f"Resultados dos Favoritos:")
        logger.info(f"  - Usuários verificados: {favorite_results.get('users_checked', 0)}")
        logger.info(f"  - Favoritos verificados: {favorite_results.get('favorites_checked', 0)}")
        logger.info(f"  - Alertas enviados: {favorite_results.get('alerts_sent', 0)}")
        logger.info(f"  - Erros: {favorite_results.get('errors', 0)}")
        
        # Resumo final
        total_emails = price_results.get('emails_sent', 0) + favorite_results.get('alerts_sent', 0)
        total_errors = price_results.get('errors', 0) + favorite_results.get('errors', 0)
        
        logger.info("\n" + "=" * 60)
        logger.info("VERIFICAÇÃO CONCLUÍDA")
        logger.info(f"Total de emails enviados: {total_emails}")
        logger.info(f"Total de erros: {total_errors}")
        logger.info("=" * 60)
        
        return {
            "success": True,
            "price_alerts": price_results,
            "favorite_alerts": favorite_results
        }
        
    except Exception as e:
        logger.error(f"Erro durante execução: {e}")
        return {"success": False, "error": str(e)}
        
    finally:
        client.close()
        logger.info("Conexão MongoDB fechada")


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Verificar alertas de preço')
    parser.add_argument('--force', '-f', action='store_true', 
                       help='Forçar verificação ignorando cooldown')
    args = parser.parse_args()
    
    result = asyncio.run(main(force=args.force))
    
    # Exit code baseado no resultado
    sys.exit(0 if result.get("success") else 1)

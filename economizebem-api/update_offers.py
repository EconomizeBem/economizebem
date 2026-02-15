#!/usr/bin/env python3
"""
Script para atualizar ofertas Amazon.
Lê ASINs de asins.txt e gera offers.json.
Executar via Cron Job no Render: 2x ao dia (08:00 e 20:00)
"""

import json
from datetime import datetime, timezone
from pathlib import Path

# Configurações
TRACKING_ID = "economizebe0b-20"
ASINS_FILE = "asins.txt"
OFFERS_FILE = "offers.json"


def read_asins(filepath: str) -> list[str]:
    """Lê ASINs do arquivo, ignorando linhas vazias e comentários."""
    asins = []
    path = Path(filepath)
    
    if not path.exists():
        print(f"Arquivo {filepath} não encontrado!")
        return asins
    
    with open(path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            # Ignora linhas vazias e comentários
            if line and not line.startswith('#'):
                asins.append(line)
    
    return asins


def generate_affiliate_url(asin: str) -> str:
    """Gera URL de afiliado para o ASIN."""
    return f"https://www.amazon.com.br/dp/{asin}/?tag={TRACKING_ID}"


def generate_placeholder_image(asin: str) -> str:
    """Gera URL de imagem placeholder para o ASIN."""
    return f"https://via.placeholder.com/300x300?text=ASIN+{asin}"


def create_offer_item(asin: str) -> dict:
    """Cria um item de oferta para o ASIN."""
    return {
        "asin": asin,
        "title": f"Produto (ASIN {asin})",
        "image_url": generate_placeholder_image(asin),
        "price": None,
        "affiliate_url": generate_affiliate_url(asin)
    }


def update_offers():
    """Função principal que atualiza o arquivo offers.json."""
    print(f"[{datetime.now()}] Iniciando atualização de ofertas...")
    
    # Lê ASINs
    asins = read_asins(ASINS_FILE)
    print(f"Total de ASINs encontrados: {len(asins)}")
    
    if not asins:
        print("Nenhum ASIN encontrado. Abortando.")
        return
    
    # Gera itens de oferta
    items = [create_offer_item(asin) for asin in asins]
    
    # Cria estrutura do JSON
    offers_data = {
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "items": items
    }
    
    # Salva arquivo
    with open(OFFERS_FILE, 'w', encoding='utf-8') as f:
        json.dump(offers_data, f, ensure_ascii=False, indent=2)
    
    print(f"Arquivo {OFFERS_FILE} atualizado com {len(items)} ofertas.")
    print(f"[{datetime.now()}] Atualização concluída!")


if __name__ == "__main__":
    update_offers()

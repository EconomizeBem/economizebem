#!/usr/bin/env python3
"""
Utilitário para extrair ASINs de URLs da Amazon.
Lê urls.txt e gera asins.csv com category="outros" e priority=5 (padrão).

Uso:
    python extract_asins.py [--input urls.txt] [--output asins.csv] [--category outros] [--priority 5]
"""

import re
import csv
import argparse
from pathlib import Path


def extract_asin_from_url(url: str) -> str | None:
    """
    Extrai ASIN de uma URL da Amazon.
    Padrões suportados:
    - /dp/ASIN
    - /gp/product/ASIN
    - /gp/aw/d/ASIN
    - amazon.com.br/ASIN (alguns links curtos)
    """
    patterns = [
        r'/dp/([A-Z0-9]{10})',
        r'/gp/product/([A-Z0-9]{10})',
        r'/gp/aw/d/([A-Z0-9]{10})',
        r'amazon\.com\.br/([A-Z0-9]{10})(?:/|\?|$)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url, re.IGNORECASE)
        if match:
            return match.group(1).upper()
    
    return None


def read_urls(filepath: str) -> list[str]:
    """Lê URLs do arquivo, ignorando linhas vazias e comentários."""
    urls = []
    path = Path(filepath)
    
    if not path.exists():
        print(f"Arquivo {filepath} não encontrado!")
        return urls
    
    with open(path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#'):
                urls.append(line)
    
    return urls


def extract_asins(
    input_file: str = "urls.txt",
    output_file: str = "asins.csv",
    default_category: str = "outros",
    default_priority: int = 5,
    append: bool = False
) -> list[dict]:
    """
    Extrai ASINs de URLs e salva em CSV.
    
    Args:
        input_file: Arquivo com URLs (uma por linha)
        output_file: Arquivo CSV de saída
        default_category: Categoria padrão para os produtos
        default_priority: Prioridade padrão (1-10)
        append: Se True, adiciona ao arquivo existente
    
    Returns:
        Lista de dicionários com os ASINs extraídos
    """
    urls = read_urls(input_file)
    print(f"Total de URLs encontradas: {len(urls)}")
    
    # Extrair ASINs únicos
    asins_found = []
    seen_asins = set()
    
    # Se for append, carregar ASINs existentes
    if append and Path(output_file).exists():
        with open(output_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                seen_asins.add(row['asin'])
    
    for url in urls:
        asin = extract_asin_from_url(url)
        if asin:
            if asin not in seen_asins:
                asins_found.append({
                    'asin': asin,
                    'category': default_category,
                    'priority': default_priority
                })
                seen_asins.add(asin)
                print(f"  ✓ {asin} <- {url[:60]}...")
        else:
            print(f"  ✗ Não foi possível extrair ASIN de: {url[:60]}...")
    
    print(f"\nASINs únicos extraídos: {len(asins_found)}")
    
    # Salvar CSV
    mode = 'a' if append else 'w'
    write_header = not append or not Path(output_file).exists()
    
    with open(output_file, mode, newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=['asin', 'category', 'priority'])
        if write_header:
            writer.writeheader()
        writer.writerows(asins_found)
    
    print(f"Arquivo {output_file} {'atualizado' if append else 'criado'} com sucesso!")
    
    return asins_found


def main():
    parser = argparse.ArgumentParser(
        description='Extrai ASINs de URLs da Amazon e gera arquivo CSV.'
    )
    parser.add_argument(
        '--input', '-i',
        default='urls.txt',
        help='Arquivo de entrada com URLs (padrão: urls.txt)'
    )
    parser.add_argument(
        '--output', '-o',
        default='asins.csv',
        help='Arquivo CSV de saída (padrão: asins.csv)'
    )
    parser.add_argument(
        '--category', '-c',
        default='outros',
        help='Categoria padrão para os produtos (padrão: outros)'
    )
    parser.add_argument(
        '--priority', '-p',
        type=int,
        default=5,
        choices=range(1, 11),
        help='Prioridade padrão 1-10 (padrão: 5)'
    )
    parser.add_argument(
        '--append', '-a',
        action='store_true',
        help='Adicionar ao arquivo existente em vez de sobrescrever'
    )
    
    args = parser.parse_args()
    
    extract_asins(
        input_file=args.input,
        output_file=args.output,
        default_category=args.category,
        default_priority=args.priority,
        append=args.append
    )


if __name__ == "__main__":
    main()

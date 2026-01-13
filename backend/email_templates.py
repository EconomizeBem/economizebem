"""
Email Templates para EconomizeBem
"""

BRAND_COLOR = "#0ea5e9"
BRAND_NAME = "EconomizeBem"

def get_base_template(content: str, preview_text: str = "") -> str:
    """Template base para todos os emails"""
    return f"""
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>{BRAND_NAME}</title>
        <!--[if mso]>
        <style type="text/css">
            table {{border-collapse: collapse; border-spacing: 0; margin: 0;}}
            div, td {{padding: 0;}}
            div {{margin: 0 !important;}}
        </style>
        <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
        </noscript>
        <![endif]-->
        <style>
            body {{ margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }}
            .container {{ max-width: 600px; margin: 0 auto; background-color: #ffffff; }}
            .header {{ background: linear-gradient(135deg, {BRAND_COLOR} 0%, #0284c7 100%); padding: 32px; text-align: center; }}
            .header h1 {{ color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; }}
            .content {{ padding: 32px; }}
            .footer {{ background-color: #f4f4f5; padding: 24px; text-align: center; font-size: 12px; color: #71717a; }}
            .btn {{ display: inline-block; padding: 14px 28px; background-color: {BRAND_COLOR}; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; }}
            .btn:hover {{ background-color: #0284c7; }}
            .product-card {{ border: 1px solid #e4e4e7; border-radius: 12px; padding: 16px; margin: 12px 0; }}
            .price {{ color: {BRAND_COLOR}; font-size: 24px; font-weight: 700; }}
            .old-price {{ color: #a1a1aa; text-decoration: line-through; font-size: 14px; }}
            .discount {{ background-color: #dcfce7; color: #16a34a; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }}
        </style>
    </head>
    <body>
        <div style="display: none; max-height: 0; overflow: hidden;">{preview_text}</div>
        <div class="container">
            <div class="header">
                <h1>💰 {BRAND_NAME}</h1>
            </div>
            <div class="content">
                {content}
            </div>
            <div class="footer">
                <p>© 2024 {BRAND_NAME}. Todos os direitos reservados.</p>
                <p>Você está recebendo este e-mail porque se cadastrou em economizebem.com.br</p>
                <p><a href="{{{{unsubscribe_url}}}}" style="color: #71717a;">Cancelar inscrição</a></p>
            </div>
        </div>
    </body>
    </html>
    """


def welcome_email(user_name: str) -> dict:
    """Email de boas-vindas após cadastro"""
    content = f"""
    <h2 style="color: #18181b; margin-top: 0;">Bem-vindo(a) ao {BRAND_NAME}, {user_name}! 🎉</h2>
    
    <p style="color: #3f3f46; font-size: 16px; line-height: 1.6;">
        Estamos muito felizes em ter você conosco! Agora você pode:
    </p>
    
    <ul style="color: #3f3f46; font-size: 16px; line-height: 2;">
        <li>🔍 <strong>Comparar preços</strong> entre as principais lojas do Brasil</li>
        <li>📱 <strong>Comparar planos</strong> de internet, celular e streaming</li>
        <li>🔔 <strong>Criar alertas</strong> para ser notificado quando o preço cair</li>
        <li>❤️ <strong>Favoritar produtos</strong> e acompanhar ofertas</li>
        <li>📊 <strong>Controlar seus gastos</strong> com nossa calculadora financeira</li>
    </ul>
    
    <div style="text-align: center; margin: 32px 0;">
        <a href="https://economizebem.com.br/products" class="btn">Começar a Economizar</a>
    </div>
    
    <p style="color: #3f3f46; font-size: 16px;">
        Dica: Favorite seus produtos preferidos e crie alertas de preço para nunca perder uma promoção!
    </p>
    
    <p style="color: #71717a; font-size: 14px; margin-top: 32px;">
        Qualquer dúvida, responda este e-mail. Estamos aqui para ajudar!
    </p>
    """
    return {
        "subject": f"🎉 Bem-vindo(a) ao {BRAND_NAME}, {user_name}!",
        "html": get_base_template(content, f"Olá {user_name}! Sua conta foi criada com sucesso.")
    }


def password_reset_email(user_name: str, reset_link: str) -> dict:
    """Email de recuperação de senha"""
    content = f"""
    <h2 style="color: #18181b; margin-top: 0;">Recuperação de Senha</h2>
    
    <p style="color: #3f3f46; font-size: 16px; line-height: 1.6;">
        Olá {user_name},
    </p>
    
    <p style="color: #3f3f46; font-size: 16px; line-height: 1.6;">
        Recebemos uma solicitação para redefinir a senha da sua conta no {BRAND_NAME}.
        Clique no botão abaixo para criar uma nova senha:
    </p>
    
    <div style="text-align: center; margin: 32px 0;">
        <a href="{reset_link}" class="btn">Redefinir Minha Senha</a>
    </div>
    
    <p style="color: #71717a; font-size: 14px; background-color: #fef3c7; padding: 12px; border-radius: 8px;">
        ⚠️ Este link expira em <strong>1 hora</strong>. Se você não solicitou esta recuperação, ignore este e-mail.
    </p>
    
    <p style="color: #71717a; font-size: 12px; margin-top: 24px;">
        Se o botão não funcionar, copie e cole este link no navegador:<br>
        <a href="{reset_link}" style="color: {BRAND_COLOR}; word-break: break-all;">{reset_link}</a>
    </p>
    """
    return {
        "subject": f"🔐 Recuperação de Senha - {BRAND_NAME}",
        "html": get_base_template(content, "Clique para redefinir sua senha")
    }


def price_alert_email(user_name: str, product_name: str, product_image: str, 
                      old_price: float, new_price: float, store: str, product_url: str) -> dict:
    """Email de alerta quando preço do produto cai"""
    discount = int(((old_price - new_price) / old_price) * 100)
    savings = old_price - new_price
    
    content = f"""
    <h2 style="color: #18181b; margin-top: 0;">🚨 Alerta de Preço!</h2>
    
    <p style="color: #3f3f46; font-size: 16px; line-height: 1.6;">
        Ótima notícia, {user_name}! O produto que você está monitorando baixou de preço!
    </p>
    
    <div class="product-card">
        <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
                <td width="120" style="vertical-align: top;">
                    <img src="{product_image}" alt="{product_name}" width="100" style="border-radius: 8px;">
                </td>
                <td style="vertical-align: top; padding-left: 16px;">
                    <h3 style="margin: 0 0 8px 0; color: #18181b; font-size: 16px;">{product_name}</h3>
                    <p style="margin: 0;">
                        <span class="old-price">R$ {old_price:,.2f}</span>
                        <span class="discount">-{discount}%</span>
                    </p>
                    <p class="price" style="margin: 8px 0;">R$ {new_price:,.2f}</p>
                    <p style="color: #16a34a; font-size: 14px; margin: 0;">
                        💰 Economia de R$ {savings:,.2f}
                    </p>
                    <p style="color: #71717a; font-size: 12px; margin: 8px 0 0 0;">
                        Vendido por: <strong>{store}</strong>
                    </p>
                </td>
            </tr>
        </table>
    </div>
    
    <div style="text-align: center; margin: 24px 0;">
        <a href="{product_url}" class="btn">Ver Oferta Agora</a>
    </div>
    
    <p style="color: #71717a; font-size: 14px;">
        ⏰ Corra! Promoções assim costumam acabar rápido.
    </p>
    """
    return {
        "subject": f"🚨 Preço Baixou! {product_name} agora por R$ {new_price:,.2f}",
        "html": get_base_template(content, f"O produto {product_name} baixou {discount}%!")
    }


def favorite_price_drop_email(user_name: str, product_name: str, product_image: str,
                               old_price: float, new_price: float, store: str, product_url: str) -> dict:
    """Email quando um produto favoritado baixa de preço"""
    discount = int(((old_price - new_price) / old_price) * 100)
    savings = old_price - new_price
    
    content = f"""
    <h2 style="color: #18181b; margin-top: 0;">❤️ Seu Favorito Baixou de Preço!</h2>
    
    <p style="color: #3f3f46; font-size: 16px; line-height: 1.6;">
        Olá {user_name}! Um produto que você favoritou está mais barato:
    </p>
    
    <div class="product-card">
        <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
                <td width="120" style="vertical-align: top;">
                    <img src="{product_image}" alt="{product_name}" width="100" style="border-radius: 8px;">
                </td>
                <td style="vertical-align: top; padding-left: 16px;">
                    <h3 style="margin: 0 0 8px 0; color: #18181b; font-size: 16px;">{product_name}</h3>
                    <p style="margin: 0;">
                        <span class="old-price">R$ {old_price:,.2f}</span>
                        <span class="discount">-{discount}%</span>
                    </p>
                    <p class="price" style="margin: 8px 0;">R$ {new_price:,.2f}</p>
                    <p style="color: #16a34a; font-size: 14px; margin: 0;">
                        💰 Você economiza R$ {savings:,.2f}
                    </p>
                    <p style="color: #71717a; font-size: 12px; margin: 8px 0 0 0;">
                        Melhor preço em: <strong>{store}</strong>
                    </p>
                </td>
            </tr>
        </table>
    </div>
    
    <div style="text-align: center; margin: 24px 0;">
        <a href="{product_url}" class="btn">Aproveitar Oferta</a>
    </div>
    """
    return {
        "subject": f"❤️ Seu favorito baixou! {product_name} -${discount}%",
        "html": get_base_template(content, f"Produto favoritado com {discount}% de desconto!")
    }


def weekly_deals_email(user_name: str, deals: list) -> dict:
    """Email semanal com melhores ofertas"""
    
    deals_html = ""
    for deal in deals[:6]:  # Máximo 6 produtos
        discount = int(((deal['original_price'] - deal['price']) / deal['original_price']) * 100) if deal.get('original_price') else 0
        deals_html += f"""
        <div class="product-card">
            <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                    <td width="80" style="vertical-align: top;">
                        <img src="{deal['image']}" alt="{deal['name']}" width="70" style="border-radius: 8px;">
                    </td>
                    <td style="vertical-align: top; padding-left: 12px;">
                        <h4 style="margin: 0 0 4px 0; color: #18181b; font-size: 14px;">{deal['name'][:50]}...</h4>
                        <p style="margin: 0;">
                            {f'<span class="old-price">R$ {deal["original_price"]:,.2f}</span>' if deal.get('original_price') else ''}
                            {f'<span class="discount">-{discount}%</span>' if discount > 0 else ''}
                        </p>
                        <p class="price" style="margin: 4px 0; font-size: 18px;">R$ {deal['price']:,.2f}</p>
                        <p style="color: #71717a; font-size: 11px; margin: 0;">{deal['store']}</p>
                    </td>
                </tr>
            </table>
        </div>
        """
    
    content = f"""
    <h2 style="color: #18181b; margin-top: 0;">🔥 Melhores Ofertas da Semana</h2>
    
    <p style="color: #3f3f46; font-size: 16px; line-height: 1.6;">
        Olá {user_name}! Separamos as melhores ofertas desta semana para você:
    </p>
    
    {deals_html}
    
    <div style="text-align: center; margin: 32px 0;">
        <a href="https://economizebem.com.br/products" class="btn">Ver Todas as Ofertas</a>
    </div>
    
    <p style="color: #71717a; font-size: 14px; text-align: center;">
        💡 Dica: Favorite produtos para receber alertas quando o preço cair!
    </p>
    """
    return {
        "subject": f"🔥 {user_name}, confira as melhores ofertas da semana!",
        "html": get_base_template(content, "As melhores ofertas da semana selecionadas para você!")
    }

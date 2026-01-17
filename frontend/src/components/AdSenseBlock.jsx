import { useEffect, useRef } from 'react';

/**
 * Componente reutilizável para exibir anúncios do Google AdSense
 * 
 * @param {string} adSlot - ID do slot de anúncio (ex: "1234567890")
 * @param {string} adFormat - Formato do anúncio (default: "auto")
 * @param {boolean} fullWidthResponsive - Se o anúncio deve ser responsivo em largura total (default: true)
 * @param {string} className - Classes CSS adicionais para o container
 * @param {string} style - Estilos inline adicionais
 */
export const AdSenseBlock = ({ 
    adSlot, 
    adFormat = "auto", 
    fullWidthResponsive = true,
    className = "",
    style = {}
}) => {
    const adRef = useRef(null);
    const isAdLoaded = useRef(false);

    useEffect(() => {
        // Evita carregar o mesmo anúncio múltiplas vezes em navegação SPA
        if (isAdLoaded.current) {
            return;
        }

        try {
            // Verifica se o script do AdSense está carregado
            if (typeof window !== 'undefined' && window.adsbygoogle) {
                // Push para carregar o anúncio
                (window.adsbygoogle = window.adsbygoogle || []).push({});
                isAdLoaded.current = true;
            }
        } catch (error) {
            // Silencia erros do AdSense para não crashar a aplicação
            console.warn('AdSense error:', error.message);
        }

        // Cleanup: reseta o estado quando o componente é desmontado
        return () => {
            isAdLoaded.current = false;
        };
    }, [adSlot]);

    // Em desenvolvimento, mostra um placeholder
    if (process.env.NODE_ENV === 'development' && !adSlot) {
        return (
            <div 
                className={`bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-4 text-center text-slate-500 dark:text-slate-400 ${className}`}
                style={{ minHeight: '100px', ...style }}
            >
                <p className="text-sm font-medium">📢 Espaço para Anúncio</p>
                <p className="text-xs mt-1">AdSense Slot: {adSlot || 'Não configurado'}</p>
            </div>
        );
    }

    return (
        <div 
            className={`adsense-container overflow-hidden ${className}`} 
            style={{ minHeight: '100px', ...style }}
            ref={adRef}
        >
            <ins
                className="adsbygoogle"
                style={{ 
                    display: 'block',
                    textAlign: 'center',
                    ...style 
                }}
                data-ad-client="ca-pub-XXXXXXXXXXXX"
                data-ad-slot={adSlot}
                data-ad-format={adFormat}
                data-full-width-responsive={fullWidthResponsive.toString()}
            />
        </div>
    );
};

/**
 * Componente para anúncio horizontal (banner)
 */
export const AdSenseBanner = ({ adSlot, className = "" }) => (
    <AdSenseBlock 
        adSlot={adSlot} 
        adFormat="horizontal"
        className={`w-full my-4 ${className}`}
    />
);

/**
 * Componente para anúncio in-feed (entre cards de produtos)
 */
export const AdSenseInFeed = ({ adSlot, className = "" }) => (
    <AdSenseBlock 
        adSlot={adSlot} 
        adFormat="fluid"
        className={`w-full ${className}`}
        style={{ minHeight: '250px' }}
    />
);

/**
 * Componente para anúncio quadrado/retangular
 */
export const AdSenseRectangle = ({ adSlot, className = "" }) => (
    <AdSenseBlock 
        adSlot={adSlot} 
        adFormat="rectangle"
        className={className}
        style={{ minWidth: '300px', minHeight: '250px' }}
    />
);

export default AdSenseBlock;

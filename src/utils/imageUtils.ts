import html2canvas from 'html2canvas';

/**
 * Gera uma imagem PNG a partir de um elemento HTML
 * @param element O elemento HTML para converter em imagem
 * @returns Uma Promise com o URL de dados da imagem
 */
export async function generateImage(element: HTMLElement): Promise<string> {
  try {
    // Definir opções para melhor qualidade
    const canvas = await html2canvas(element, {
      scale: 2, // Escala 2x para melhor qualidade
      backgroundColor: null, // Preservar transparência
      logging: false,
      useCORS: true, // Permitir imagens cross-origin
    });
    
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Erro ao gerar imagem:', error);
    throw error;
  }
}

/**
 * Salva uma imagem no dispositivo do usuário
 * @param dataUrl URL de dados da imagem
 * @param filename Nome do arquivo para salvar
 */
export function saveImage(dataUrl: string, filename: string = 'quiz-resultado.png'): void {
  try {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Erro ao salvar imagem:', error);
    throw error;
  }
}

/**
 * Compartilha uma imagem usando a Web Share API ou links diretos
 * @param dataUrl URL de dados da imagem
 * @param title Título para o compartilhamento
 * @param text Texto para o compartilhamento
 * @param platformUrl URL específica da plataforma (opcional)
 */
export async function shareImage(
  dataUrl: string, 
  title: string = 'Resultado do Quiz', 
  text: string = 'Veja meu resultado no quiz!',
  platform?: 'whatsapp' | 'telegram' | 'x' | 'facebook'
): Promise<void> {
  try {
    // Primeiro tenta usar a API de compartilhamento nativa se disponível
    if (navigator.share && !platform) {
      // Converte o dataUrl em um arquivo Blob para compartilhamento
      const blob = await fetch(dataUrl).then(res => res.blob());
      const file = new File([blob], 'quiz-resultado.png', { type: 'image/png' });
      
      await navigator.share({
        title,
        text,
        files: [file]
      });
      return;
    }
    
    // Links diretos para plataformas específicas
    if (platform) {
      let shareUrl: string;
      
      switch (platform) {
        case 'whatsapp':
          shareUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
          break;
        case 'telegram':
          shareUrl = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`;
          break;
        case 'x':
          shareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
          break;
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(text)}`;
          break;
      }
      
      window.open(shareUrl, '_blank');
      return;
    }
    
    // Fallback: apenas abrir a imagem em uma nova aba
    const newTab = window.open();
    if (newTab) {
      newTab.document.body.innerHTML = `
        <html>
          <head><title>${title}</title></head>
          <body style="margin: 0; display: flex; justify-content: center; background-color: #f0f0f0;">
            <img src="${dataUrl}" alt="${title}" style="max-width: 100%; max-height: 100vh;" />
          </body>
        </html>
      `;
    }
  } catch (error) {
    console.error('Erro ao compartilhar imagem:', error);
    throw error;
  }
}

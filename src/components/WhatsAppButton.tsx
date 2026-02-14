import { MessageCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const WHATSAPP_NUMBER = '5216641234567'; // Replace with actual number

const WhatsAppButton = () => {
  const { language } = useLanguage();
  const message = language === 'es'
    ? 'Hola, me gustaría obtener información sobre sus servicios de envío.'
    : 'Hello, I would like to get information about your shipping services.';

  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-full p-4 shadow-lg transition-transform hover:scale-110"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
};

export default WhatsAppButton;

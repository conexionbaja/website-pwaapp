import { useEffect } from 'react';

interface PageMetaProps {
  title: string;
  description?: string;
}

const PageMeta = ({ title, description }: PageMetaProps) => {
  useEffect(() => {
    document.title = `${title} | Conexión Baja`;
    
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    if (description) {
      meta.setAttribute('content', description);
    }
    
    return () => {
      document.title = 'Conexión Baja';
    };
  }, [title, description]);

  return null;
};

export default PageMeta;

import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

const ImageUpload = ({ value, onChange, label }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { language } = useLanguage();
  const es = language === 'es';

  const displayLabel = label || (es ? 'Imagen' : 'Image');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error(es ? 'Solo se permiten imágenes' : 'Only image files are allowed'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error(es ? 'Tamaño máximo: 5MB' : 'Max file size is 5MB'); return; }

    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('public-images').upload(path, file);
    if (error) { toast.error(error.message); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from('public-images').getPublicUrl(path);
    onChange(urlData.publicUrl);
    setUploading(false);
    toast.success(es ? 'Imagen subida' : 'Image uploaded');
  };

  return (
    <div className="space-y-2">
      <Label className="text-foreground">{displayLabel}</Label>
      {value && (
        <div className="relative w-full max-w-xs">
          <img src={value} alt="Preview" className="w-full h-32 object-cover rounded-md border border-border" />
          <Button type="button" variant="destructive" size="sm" className="absolute top-1 right-1 h-6 w-6 p-0" onClick={() => onChange('')}><X className="h-3 w-3" /></Button>
        </div>
      )}
      <div className="flex gap-2">
        <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={es ? 'Pegar URL o subir' : 'Paste URL or upload'} className="bg-background flex-1" />
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        </Button>
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
    </div>
  );
};

export default ImageUpload;

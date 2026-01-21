import Link from 'next/link';
import Card from '../atoms/Card';
import Button from '../atoms/Button';

interface QuickActionsProps {
  shortUrl: string;
  originalUrl: string;
  onCopyShortUrl: () => void;
  onCopyOriginalUrl: () => void;
}

export default function QuickActions({
  shortUrl,
  originalUrl,
  onCopyShortUrl,
  onCopyOriginalUrl
}: QuickActionsProps) {
  return (
    <Card>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      
      <div className="space-y-3">
        <Button
          onClick={onCopyShortUrl}
          variant="primary"
          className="w-full"
        >
          Copy Short URL
        </Button>
        <Button
          onClick={onCopyOriginalUrl}
          variant="secondary"
          className="w-full"
        >
          Copy Original URL
        </Button>
        <Link
          href={shortUrl || '#'}
          target="_blank"
          className="block w-full"
        >
          <Button
            variant="success"
            className="w-full"
          >
            Open URL
          </Button>
        </Link>
      </div>
    </Card>
  );
}

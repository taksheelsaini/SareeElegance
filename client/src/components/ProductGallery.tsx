import { useState } from "react";
import { ZoomIn, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { ProductImage } from "@shared/schema";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomImageIndex, setZoomImageIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
        <span className="text-muted-foreground">No images available</span>
      </div>
    );
  }

  const selectedImage = images[selectedImageIndex];

  const nextZoomImage = () => {
    setZoomImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevZoomImage = () => {
    setZoomImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const openZoom = (index: number) => {
    setZoomImageIndex(index);
    setIsZoomOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative group">
        <div 
          className="aspect-square overflow-hidden rounded-lg cursor-zoom-in"
          onClick={() => openZoom(selectedImageIndex)}
        >
          <img
            src={selectedImage.imageUrl}
            alt={selectedImage.altText || productName}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            data-testid="main-product-image"
          />
        </div>
        
        {/* Zoom Icon */}
        <Button
          variant="secondary"
          size="sm"
          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white"
          onClick={() => openZoom(selectedImageIndex)}
          data-testid="zoom-button"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>

        {/* Navigation Arrows for Main Image */}
        {images.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="sm"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white"
              onClick={() => setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length)}
              data-testid="prev-image-button"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white"
              onClick={() => setSelectedImageIndex((prev) => (prev + 1) % images.length)}
              data-testid="next-image-button"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedImageIndex(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                index === selectedImageIndex
                  ? "border-primary shadow-lg"
                  : "border-border hover:border-primary/50"
              }`}
              data-testid={`thumbnail-${index}`}
            >
              <img
                src={image.imageUrl}
                alt={image.altText || `${productName} view ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Zoom Modal */}
      <Dialog open={isZoomOpen} onOpenChange={setIsZoomOpen}>
        <DialogContent className="max-w-4xl w-full h-[80vh] p-0 bg-black">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
              onClick={() => setIsZoomOpen(false)}
              data-testid="close-zoom-button"
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Zoomed Image */}
            <img
              src={images[zoomImageIndex].imageUrl}
              alt={images[zoomImageIndex].altText || productName}
              className="max-w-full max-h-full object-contain"
              data-testid="zoomed-image"
            />

            {/* Navigation in Zoom */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
                  onClick={prevZoomImage}
                  data-testid="prev-zoom-button"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
                  onClick={nextZoomImage}
                  data-testid="next-zoom-button"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>

                {/* Image Counter */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {zoomImageIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
import { useState } from "react";
import { Ruler, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface SizeGuideProps {
  category?: string;
}

export default function SizeGuide({ category }: SizeGuideProps) {
  const [selectedSize, setSelectedSize] = useState<string>("");

  const sareeSizes = [
    { size: "Free Size", description: "One size fits all", measurements: "5.5-6.5 meters length" },
    { size: "Petite", description: "For height 5'0\" - 5'4\"", measurements: "5.2-5.5 meters length" },
    { size: "Regular", description: "For height 5'4\" - 5'8\"", measurements: "5.5-6.0 meters length" },
    { size: "Tall", description: "For height 5'8\" and above", measurements: "6.0-6.5 meters length" },
  ];

  const careInstructions = [
    "Dry clean only for silk and embellished sarees",
    "Hand wash gently for cotton sarees",
    "Store in breathable cotton bags",
    "Iron on reverse side with medium heat",
    "Avoid direct sunlight while drying",
    "Keep away from rough surfaces",
  ];

  const fabricGuide = {
    "Silk": {
      care: "Dry clean only",
      season: "All seasons",
      occasions: "Weddings, festivals, formal events",
      drape: "Structured and elegant drape"
    },
    "Cotton": {
      care: "Hand wash or gentle machine wash",
      season: "Summer and monsoon",
      occasions: "Daily wear, office, casual outings",
      drape: "Comfortable and breathable"
    },
    "Chiffon": {
      care: "Dry clean recommended",
      season: "All seasons",
      occasions: "Parties, evening events",
      drape: "Flowy and graceful"
    },
    "Georgette": {
      care: "Dry clean or gentle hand wash",
      season: "All seasons",
      occasions: "Formal events, parties",
      drape: "Elegant with good fall"
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Ruler className="w-4 h-4" />
          Size Guide
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ruler className="w-5 h-5" />
            Saree Size Guide & Care Instructions
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Size Guide */}
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Size Guide
            </h3>
            <div className="grid gap-3">
              {sareeSizes.map((sizeInfo) => (
                <div
                  key={sizeInfo.size}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedSize === sizeInfo.size
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedSize(selectedSize === sizeInfo.size ? "" : sizeInfo.size)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{sizeInfo.size}</h4>
                      <p className="text-sm text-muted-foreground">{sizeInfo.description}</p>
                    </div>
                    <Badge variant="outline">{sizeInfo.measurements}</Badge>
                  </div>
                  {selectedSize === sizeInfo.size && (
                    <div className="mt-3 pt-3 border-t text-sm">
                      <p className="text-muted-foreground">
                        Perfect for: {sizeInfo.description}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Fabric Guide */}
          <div>
            <h3 className="font-semibold mb-4">Fabric Guide</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(fabricGuide).map(([fabric, info]) => (
                <div key={fabric} className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-3">{fabric}</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Care:</span> {info.care}
                    </div>
                    <div>
                      <span className="font-medium">Best Season:</span> {info.season}
                    </div>
                    <div>
                      <span className="font-medium">Occasions:</span> {info.occasions}
                    </div>
                    <div>
                      <span className="font-medium">Drape:</span> {info.drape}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Care Instructions */}
          <div>
            <h3 className="font-semibold mb-4">Care Instructions</h3>
            <div className="grid gap-2">
              {careInstructions.map((instruction, index) => (
                <div key={index} className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>{instruction}</span>
                </div>
              ))}
            </div>
          </div>

          {/* How to Drape */}
          <div>
            <h3 className="font-semibold mb-4">Draping Tips</h3>
            <div className="bg-gradient-to-r from-champagne/20 to-blush/20 p-4 rounded-lg">
              <div className="space-y-2 text-sm">
                <p><strong>Step 1:</strong> Start by tucking the saree into the petticoat at the waist</p>
                <p><strong>Step 2:</strong> Make pleats (5-7 pleats) and tuck them at the center</p>
                <p><strong>Step 3:</strong> Drape the remaining fabric around the waist</p>
                <p><strong>Step 4:</strong> Bring the pallu over the shoulder and secure with a pin</p>
                <p className="text-primary font-medium mt-3">
                  For detailed video tutorials, check our styling guide section!
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
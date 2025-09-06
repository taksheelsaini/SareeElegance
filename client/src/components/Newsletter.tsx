import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubscribing(true);

    // Simulate API call - in real app this would be an actual subscription
    setTimeout(() => {
      toast({
        title: "Successfully Subscribed!",
        description: "Thank you for subscribing to our newsletter.",
      });
      setEmail("");
      setIsSubscribing(false);
    }, 1000);
  };

  return (
    <section className="py-16 gradient-primary">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl lg:text-4xl font-serif font-bold text-primary mb-4">
            Stay Updated with Elegance
          </h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter for the latest saree trends, exclusive offers, and styling tips delivered to your inbox.
          </p>
          
          <form onSubmit={handleSubmit} className="max-w-md mx-auto" data-testid="form-newsletter">
            <div className="flex gap-4">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-6 py-4 rounded-full border border-border focus:ring-2 focus:ring-primary focus:border-primary"
                data-testid="input-newsletter-email"
              />
              <Button
                type="submit"
                disabled={isSubscribing}
                className="btn-primary whitespace-nowrap"
                data-testid="button-newsletter-subscribe"
              >
                {isSubscribing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Subscribing...
                  </>
                ) : (
                  "Subscribe"
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              By subscribing, you agree to our privacy policy. Unsubscribe anytime.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

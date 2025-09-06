import { Star } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Priya Sharma",
    location: "Mumbai",
    rating: 5,
    comment: "The quality of sarees from Elegance is exceptional. I bought a Banarasi silk saree for my daughter's wedding and received so many compliments!",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b332e234?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80",
  },
  {
    id: 2,
    name: "Anita Patel",
    location: "Delhi",
    rating: 5,
    comment: "Amazing collection and fast delivery! The cotton sarees are perfect for daily wear and the customer service is outstanding.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80",
  },
  {
    id: 3,
    name: "Kavya Reddy",
    location: "Bangalore",
    rating: 5,
    comment: "Elegance has the most beautiful designer sarees! Perfect for special occasions and the packaging is so elegant too.",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80",
  },
];

export default function Testimonials() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h3 className="text-3xl lg:text-4xl font-serif font-bold text-primary mb-4">
            What Our Customers Say
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Hear from our satisfied customers who have found their perfect sarees with us.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="glassmorphism p-8 rounded-2xl elegant-shadow"
              data-testid={`testimonial-${testimonial.id}`}
            >
              <div className="flex items-center mb-6">
                <div className="flex text-yellow-400" data-testid={`rating-${testimonial.id}`}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-muted-foreground mb-6 italic" data-testid={`comment-${testimonial.id}`}>
                "{testimonial.comment}"
              </p>
              <div className="flex items-center">
                <img
                  src={testimonial.avatar}
                  alt={`Portrait of ${testimonial.name}`}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                  data-testid={`avatar-${testimonial.id}`}
                />
                <div>
                  <h5 className="font-semibold" data-testid={`name-${testimonial.id}`}>
                    {testimonial.name}
                  </h5>
                  <p className="text-sm text-muted-foreground" data-testid={`location-${testimonial.id}`}>
                    {testimonial.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

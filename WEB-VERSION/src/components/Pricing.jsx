import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Check, Star, Zap } from "lucide-react";

const Pricing = () => {
  const plans = [
    {
      name: "Student",
      price: "$1",
      period: "/month",
      description: "Affordable access for all students. Get started with essential writing tools and support.",
      badge: "Most Popular",
      badgeColor: "bg-accent text-accent-foreground",
      features: [
        "Up to 3 writing projects per month",
        "Basic AI writing assistance",
        "Grammar and style checking",
        "Email support",
        "Standard turnaround (48-72 hours)",
        "Access to writing guides"
      ],
      cta: "Start for $1",
      highlighted: false
    },
    {
      name: "Academic Pro",
      price: "Contract",
      period: "Contract",
      description: "Signup and Chat with our expert writers directly for your specific projects",
      badge: "Premium",
      badgeColor: "bg-primary text-primary-foreground",
      features: [
        "Direct writer hiring",
        "Custom project requirements",
        "One-on-one consultation with our expert writers",
        "Flexible pricing",
        "Priority support",
        "Quality guarantee"
      ],
      cta: "Signup and Chat a Writer",
      highlighted: true
    },
    {
      name: "Institution",
      price: "$99",
      period: "/month",
      description: "For universities, research teams, and academic institutions",
      badge: "Enterprise",
      badgeColor: "bg-success text-success-foreground",
      features: [
        "Everything in Academic Pro",
        "Team collaboration tools",
        "Bulk project management",
        "Dedicated account manager",
        "Custom AI model training",
        "White-label solutions",
        "Advanced analytics",
        "API access",
        "Custom integrations"
      ],
      cta: "Contact Sales",
      highlighted: false
    }
  ];

  return (
    <section id="pricing" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            Pricing Plans
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Choose Your Academic Success Plan
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Flexible pricing options designed to support every stage of your academic journey, 
            from undergraduate studies to advanced research.
          </p>
          
          {/* Money Back Guarantee */}
          <div className="inline-flex items-center gap-2 bg-success/10 text-success px-6 py-3 rounded-full border border-success/20">
            <Star className="w-5 h-5" />
            <span className="font-semibold">30-Day Money-Back Guarantee</span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative ${plan.highlighted 
                ? 'border-primary shadow-elegant scale-105 bg-gradient-card' 
                : 'border-border bg-card hover:border-primary/50'
              } transition-all duration-300 hover:shadow-subtle`}
            >
              {/* Badge */}
              {plan.badge && (
                <Badge className={`absolute -top-3 left-1/2 transform -translate-x-1/2 ${plan.badgeColor}`}>
                  {plan.badge}
                </Badge>
              )}

              <CardHeader className="text-center p-6 md:p-8">
                <CardTitle className="text-2xl font-bold text-card-foreground mb-2">
                  {plan.name}
                </CardTitle>
                <div className="mb-4">
                  <span className="text-4xl md:text-5xl font-bold text-primary">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground text-lg">
                    {plan.period}
                  </span>
                </div>
                <p className="text-muted-foreground">
                  {plan.description}
                </p>
              </CardHeader>

              <CardContent className="p-6 md:p-8 pt-0">
                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-card-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                {plan.name === "Student" ? (
                  <Button 
                    asChild
                    className={`w-full ${plan.highlighted 
                      ? 'bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-elegant' 
                      : 'bg-primary hover:bg-primary-dark text-primary-foreground'
                    }`}
                    size="lg"
                  >
                    <a href="/signup">{plan.cta}</a>
                  </Button>
                ) : plan.name === "Academic Pro" ? (
                  <Button 
                    asChild
                    className={`w-full ${plan.highlighted 
                      ? 'bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-elegant' 
                      : 'bg-primary hover:bg-primary-dark text-primary-foreground'
                    }`}
                    size="lg"
                  >
                    <a href="/signup">{plan.cta}</a>
                  </Button>
                ) : (
                  <Button 
                    className={`w-full ${plan.highlighted 
                      ? 'bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-elegant' 
                      : 'bg-primary hover:bg-primary-dark text-primary-foreground'
                    }`}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12 md:mt-16">
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 text-muted-foreground">
              <Check className="w-5 h-5 text-success" />
              <span>No setup fees</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-muted-foreground">
              <Check className="w-5 h-5 text-success" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-muted-foreground">
              <Check className="w-5 h-5 text-success" />
              <span>24/7 support included</span>
            </div>
          </div>
          
          <p className="text-muted-foreground mt-8">
            Need a custom plan? 
            <Button variant="link" className="text-primary font-semibold p-0 ml-1">
              Contact our sales team
            </Button>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
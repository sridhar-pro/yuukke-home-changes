import { AnimatedTestimonials } from "@/app/components/ui/animated-testimonials";

export function AnimatedTestimonialsDemo() {
  const testimonials = [
    {
      quote:
        "Aamani's Crochet is an honest initiative to save an exquisite knitting skill of India - CROCHET!!. We are manufacturing all type of Crochet Garments for Ladies Kids. Our collection includes Shrugs, Beachwear, Tops, Knickers, Skirts, Bikinis etc for summers along with Pullovers, Poncho, Shawls, Scarfs etc for winters. ",
      name: "Aamani's Crochet",
      designation: "Our Seller",
      src: "https://customer-3uw4nujlakj1ub6w.cloudflarestream.com/f3762ae822ff39d67bada54038969264/iframe",
      button: {
        text: "Shop Crochet",
        link: "/aamani-crochet",
      },
    },
    {
      quote:
        "I Rakhi Saxena am a creative entrepreneur based in Delhi, India, running Rachika Fashions, a brand specializing in customizing apparel, primarily for women. My company stands out for its unique offerings, including custom designs for prints, colors, and motifs, tailored to individual customer preferences.",
      name: "Ms Rakhi Saxena",
      designation: "Our Seller",
      src: "https://customer-3uw4nujlakj1ub6w.cloudflarestream.com/79b671c35617ded4c5e4d9e68039bc0d/iframe",
      button: {
        text: "Customize Outfits",
        link: "/rachika-fashions",
      },
    },
    {
      quote:
        "I generally make fresh hair n skin products on order and have been able to have a great clientele.My work is more out of passion for good natural products for maintaining your overall health and I have been fairly successful in achieving this at the age of 58.",
      name: "Nairiti Forever Grace",
      designation: "Our Seller",
      src: "https://customer-3uw4nujlakj1ub6w.cloudflarestream.com/7d3f1ee969f64ea8a6376f86ec7dc90a/iframe",
      button: {
        text: "View Products",
        link: "/nairiti-beauty",
      },
    },
    {
      quote:
        "Indulge in eco-friendly luxury with bamboo towels handcrafted sops, home made spices, massage candle and much more",
      name: "Bhumee Roots",
      designation: "Engineering Lead at DataPro",
      src: "https://customer-3uw4nujlakj1ub6w.cloudflarestream.com/0c830605f5334e1d79f443c29ecdfee6/iframe",
      button: {
        text: "Explore Eco Goods",
        link: "/bhumee-roots",
      },
    },
    {
      quote:
        "Manufracturer of bottom wear like saree shapewear pants leggings in premium quality cotton",
      name: "Dhruvi Textiles",
      designation: "Our Seller",
      src: "https://customer-3uw4nujlakj1ub6w.cloudflarestream.com/1c4dc5de89c0d551d6203332cf08c0b7/iframe",
      button: {
        text: "Shop Shapewear",
        link: "/dhruvi-textiles",
      },
    },
  ];
  return <AnimatedTestimonials testimonials={testimonials} />;
}

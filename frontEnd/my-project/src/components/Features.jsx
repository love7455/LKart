import { GiCheckMark } from "react-icons/gi";
import { FaShippingFast, FaShieldAlt, FaHeadset } from "react-icons/fa";

const features = [
  {
    icon: GiCheckMark,
    title: "LKart Assured",
    description: "Quality guaranteed on every purchase.",
  },
  {
    icon: FaShippingFast,
    title: "Fast Delivery",
    description: "Get your orders delivered quickly.",
  },
  {
    icon: FaHeadset,
    title: "24/7 Support",
    description: "We are here to help anytime.",
  },
  {
    icon: FaShieldAlt,
    title: "Secure Payments",
    description: "Safe and secure payment options.",
  },
];

const Features = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto grid grid-cols-1 gap-8 px-6 text-center sm:grid-cols-2 lg:grid-cols-4">
        {features.map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-amber-200/70 bg-white/80 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-100"
          >
            <item.icon className="mx-auto mb-3 h-10 w-10 text-amber-500" />
            <h3 className="mb-2 text-xl font-bold text-slate-800">{item.title}</h3>
            <p className="text-slate-600">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;

import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-100 via-orange-50 to-emerald-50 p-8 text-slate-800">
      <div className="absolute -left-10 top-0 h-48 w-48 rounded-full bg-amber-300/40 blur-3xl" />
      <div className="absolute -right-10 bottom-0 h-56 w-56 rounded-full bg-orange-300/30 blur-3xl" />

      <div className="relative container mx-auto flex flex-col items-center gap-8 px-6 lg:flex-row">
        <div className="flex min-h-[320px] w-full items-center justify-center rounded-2xl border border-amber-200/70 bg-white/70 p-6 shadow-lg backdrop-blur-sm lg:min-h-[420px] lg:w-1/2">
          <img
            src="https://rukminim2.flixcart.com/image/2834/2834/xif0q/mobile/c/s/z/-original-imahcfcfuxrutrbd.jpeg?q=90"
            alt="Product"
            className="max-h-[280px] w-full object-contain lg:max-h-[380px]"
          />
        </div>

        <div className="text-center lg:w-1/2 lg:text-left">
          <p className="mb-3 inline-block rounded-full bg-amber-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-900">
            Trusted by smart shoppers
          </p>
          <h1 className="mb-4 text-4xl font-bold text-slate-900">
            Discover Your Next Favorite Product
          </h1>
          <p className="mb-6 text-slate-600">
            LKart brings quality products, fast delivery, and dependable support in
            one polished shopping experience.
          </p>

          <div className="flex justify-center gap-4 lg:justify-start">
            <button
              onClick={() => navigate("/products")}
              className="rounded-lg bg-amber-500 px-6 py-3 font-semibold text-slate-900 transition hover:bg-amber-400"
            >
              Shop Now
            </button>
            <button
              onClick={() => navigate("/help-center")}
              className="rounded-lg border border-amber-400/70 bg-white/70 px-6 py-3 font-semibold text-slate-700 transition hover:bg-amber-100"
            >
              View Help
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

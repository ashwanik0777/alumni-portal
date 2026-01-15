import Link from "next/link";
import { Construction, ArrowLeft } from "lucide-react";

interface UnderConstructionProps {
  pageName: string;
}

export default function UnderConstruction({ pageName }: UnderConstructionProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <div className="bg-primary/5 p-6 rounded-full mb-6">
        <Construction className="w-16 h-16 text-primary animate-pulse" />
      </div>
      <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
        {pageName}
      </h1>
      <h2 className="text-xl md:text-2xl font-semibold text-secondary mb-6">
        Under Development
      </h2>
      <p className="text-text-secondary max-w-md mb-8 text-lg">
        We are working hard to build this feature for our alumni community. 
        Stay tuned for updates! 🚀
      </p>
      <Link 
        href="/" 
        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all shadow-md hover:shadow-lg"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Home
      </Link>
    </div>
  );
}

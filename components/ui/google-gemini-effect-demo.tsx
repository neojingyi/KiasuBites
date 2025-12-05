import React from "react";
import { useScroll, useTransform } from "framer-motion";
import { GoogleGeminiEffect } from "./google-gemini-effect";
import { Button } from "../UI";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

export function GoogleGeminiEffectDemo() {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const pathLengthFirst = useTransform(scrollYProgress, [0, 0.8], [0.2, 1.2]);
  const pathLengthSecond = useTransform(scrollYProgress, [0, 0.8], [0.15, 1.2]);
  const pathLengthThird = useTransform(scrollYProgress, [0, 0.8], [0.1, 1.2]);
  const pathLengthFourth = useTransform(scrollYProgress, [0, 0.8], [0.05, 1.2]);
  const pathLengthFifth = useTransform(scrollYProgress, [0, 0.8], [0, 1.2]);

  return (
    <div
      className="h-[100vh] w-full relative overflow-clip flex items-center justify-center"
      ref={ref}
    >
      <GoogleGeminiEffect
        pathLengths={[
          pathLengthFirst,
          pathLengthSecond,
          pathLengthThird,
          pathLengthFourth,
          pathLengthFifth,
        ]}
      />
      <div className="relative z-10 flex flex-col items-center justify-center">
        <Link to="/register">
          <Button
            size="lg"
            variant="secondary"
            className="bg-white text-gray-900 hover:bg-gray-50 border-0 shadow-lg"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Join KiasuBites
          </Button>
        </Link>
      </div>
    </div>
  );
}


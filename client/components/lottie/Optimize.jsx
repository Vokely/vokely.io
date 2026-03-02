import React from "react";
import Lottie from "lottie-react";
import animationData from "@/public/optimize.json"

const OptimizeLottie = () => {
  return <Lottie animationData={animationData} loop={true} height={500} width={500}/>;
};

export default OptimizeLottie;

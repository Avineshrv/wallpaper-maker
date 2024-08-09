'use client'
import {useState, useEffect} from "react"

export const useWindowSize = () => {
    const [windowSize, setWindowSize] = useState({
      width: undefined,
      height: undefined,
    });
  
    useEffect(() => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
  
      const handleResize = () =>
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
  
      window.addEventListener("resize", handleResize);
      handleResize();
      return () => window.removeEventListener("resize", handleResize);
    }, []);
  
    const width = windowSize.width; // Derive width from the windowSize state
    return width < 640
      ? "xsm"
      : width < 768
      ? "sm"
      : width < 901
      ? "ml"
      : width < 1024
      ? "md"
      : width < 1280
      ? "lg"
      : width < 1600
      ? "xl"
      : width < 1900
      ? "2xl":"3xl"
  };
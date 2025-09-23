import React, { useEffect } from "react";
import { Loading } from "../components";

const currentGuidePath = '/guide/September 2025.pdf';

const Guide = () => {
  useEffect(() => {
    window.location = currentGuidePath;
  }, []);
  return <>
    <Loading />
  </>
}

export default Guide;
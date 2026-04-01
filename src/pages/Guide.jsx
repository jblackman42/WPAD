import React, { useEffect } from "react";
import { Loading } from "../components";

const currentGuidePath = '/guide/Apr 2026.pdf';

const Guide = () => {
  useEffect(() => {
    window.location = currentGuidePath;
  }, []);
  return <>
    <Loading />
  </>
}

export default Guide;
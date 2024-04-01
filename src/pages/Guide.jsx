import React, { useEffect } from "react";
import { Loading } from "../components";

const currentGuidePath = '/guide/April 2024.pdf'

const Guide = () => {
  useEffect(() => {
    window.location = currentGuidePath;
  }, []);
  return <>
    <Loading />
  </>
}

export default Guide;
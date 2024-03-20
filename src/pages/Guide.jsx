import React, { useEffect } from "react";
import { Loading } from "../components";

const currentGuidePath = '/guide/Mar-Apr 2024.pdf'

const Guide = () => {
  useEffect(() => {
    window.location = currentGuidePath;
  }, []);
  return <>
    <Loading />
  </>
}

export default Guide;
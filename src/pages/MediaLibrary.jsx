import { Navbar, Footer } from "../components";

const MediaLibrary = () => {
  return <>
    <Navbar />
    <div>
      <fs-media-library media-label="Sermons"></fs-media-library>
    </div>
    <Footer />
  </>
}

export default MediaLibrary;
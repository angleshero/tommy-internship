
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AuthorImage from "../../images/author_thumbnail.jpg";
import nftImage from "../../images/nftImage.jpg";
import axios from "axios";

import "keen-slider/keen-slider.min.css";
import { useKeenSlider } from "keen-slider/react";

const HotCollections = () => {
  const [collections, setCollections] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const [sliderRef, instanceRef] = useKeenSlider({
    loop: true,
    mode: "snap",
    renderMode: "performance",
    slides: { perView: 4, spacing: 24 },
    breakpoints: {
      "(max-width: 1200px)": { slides: { perView: 3, spacing: 20 } },
      "(max-width: 992px)": { slides: { perView: 2, spacing: 16 } },
      "(max-width: 576px)": { slides: { perView: 1, spacing: 14 } },
    },
    created() {
      setLoaded(true);
    },
  });

  useEffect(() => {
    axios
      .get("https://us-central1-nft-cloud-functions.cloudfunctions.net/hotCollections")
      .then((response) => setCollections(response.data))
      .catch((error) => console.error("Error fetching collections:", error));
  }, []);

  return (
    <section id="section-collections" className="no-bottom">
      <div className="container">
        <div className="row">
          {/* Header */}
          <div className="col-lg-12">
            <div className="text-center">
              <h2>Hot Collections</h2>
              <div className="small-border bg-color-2"></div>
            </div>
          </div>

          {/* Slider */}
          <div className="col-lg-12">
            <div className="hc-slider-wrap">
              <div ref={sliderRef} className="keen-slider hc-slider">
                {collections.map((item, index) => (
                  <div className="keen-slider__slide" key={item.id ?? index}>
                    <div className="hc-card">
                      {/* Main image */}
                      <div className="hc-img-wrap">
                        <Link to="/item-details">
                          <img
                            src={item.nftImage || nftImage}
                            className="hc-img"
                            alt={item.title || "NFT collection"}
                          />
                        </Link>
                      </div>

                      {/* Avatar overlapping */}
                      <div className="hc-avatar-row">
                        <Link to="/author" className="hc-avatar-link">
                          <img
                            className="hc-avatar"
                            src={item.authorImage || AuthorImage}
                            alt={item.title ? `${item.title} author` : "Author"}
                          />
                          <span className="hc-verified">
                            <i className="fa fa-check" />
                          </span>
                        </Link>
                      </div>

                      {/* Text */}
                      <div className="hc-info">
                        <Link to="/explore">
                          <h4 className="hc-title">{item.title}</h4>
                        </Link>
                        <span className="hc-code">{item.code}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Overlay arrows like screenshot */}
              {loaded && instanceRef.current && (
                <>
                  <button
                    type="button"
                    className="hc-arrow hc-arrow--left"
                    onClick={() => instanceRef.current?.prev()}
                    aria-label="Previous"
                  >
                    ‹
                  </button>

                  <button
                    type="button"
                    className="hc-arrow hc-arrow--right"
                    onClick={() => instanceRef.current?.next()}
                    aria-label="Next"
                  >
                    ›
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HotCollections;

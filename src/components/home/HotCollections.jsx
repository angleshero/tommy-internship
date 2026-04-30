
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Skeleton from "../UI/Skeleton";

// Owl Carousel
import OwlCarousel from "react-owl-carousel";
import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";

const HotCollections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHotCollections = async () => {
    try {
      const { data } = await axios.get(
        "https://us-central1-nft-cloud-functions.cloudfunctions.net/hotCollections"
      );
      setCollections(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch hot collections", err);
      setCollections([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotCollections();
  }, []);

  // ✅ Ensure at least 4 items
  const displayItems = useMemo(() => {
    if (!collections.length) return [];
    if (collections.length >= 4) return collections;

    const padded = [...collections];
    for (let i = 0; padded.length < 4; i++) {
      padded.push(collections[i % collections.length]);
    }
    return padded;
  }, [collections]);

  // ✅ Owl settings (4 per view on desktop)
  const owlOptions = {
    loop: displayItems.length > 4,
    margin: 10,
    nav: true,
    dots: false,
    smartSpeed: 700,
    navText: [
      `<button class="arrow arrow--left" aria-label="Previous">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M16.67 0l2.83 2.829-9.34 9.175 9.34 9.167-2.83 2.829L4.5 12z"/>
        </svg>
      </button>`,
      `<button class="arrow arrow--right" aria-label="Next">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M7.33 24l-2.83-2.829 9.34-9.175-9.34-9.167L7.33 0l12.17 12z"/>
        </svg>
      </button>`,
    ],
    responsive: {
      0: { items: 1 },
      768: { items: 2 },
      992: { items: 4 },
      1200: { items: 4 },
    },
  };

  return (
    <section id="section-hot-collections" className="no-bottom">
      <div className="container">
        <div className="row">
          <div className="col-lg-12 text-center">
            <h2>Hot Collections</h2>
            <div className="small-border bg-color-2"></div>
          </div>

          <div className="col-lg-12">
            {loading ? (
              <div className="row">
                {new Array(4).fill(0).map((_, idx) => (
                  <div className="col-12 col-md-6 col-lg-3" key={idx}>
                    <div className="nft_wrap">
                      <Skeleton width="100%" height="200px" />
                    </div>
                    <div className="nft_coll_pp">
                      <Skeleton width="50px" height="50px" borderRadius="50%" />
                    </div>
                    <div className="nft_coll_info">
                      <Skeleton width="100px" height="20px" />
                      <Skeleton width="60px" height="20px" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <OwlCarousel className="owl-theme" {...owlOptions}>
                {displayItems.map((item, idx) => (
                  <div className="item" key={`${item.id}-${idx}`}>
                    <div className="nft_wrap">
                      <Link to={`/collection/${item.id}`}>
                        <img
                          className="img-fluid"
                          src={item.nftImage}
                          alt=""
                          loading="lazy"
                          onError={(e) =>
                            (e.target.src =
                              "https://via.placeholder.com/350")
                          }
                        />
                      </Link>
                    </div>

                    <div className="nft_coll_pp">
                      <Link to={`/author/${item.authorId}`}>
                        <img
                          className="pp-coll"
                          src={item.authorImage}
                          alt="author"
                          loading="lazy"
                          onError={(e) =>
                            (e.target.src =
                              "https://via.placeholder.com/150")
                          }
                        />
                      </Link>
                      <i className="fa fa-check"></i>
                    </div>

                    <div className="nft_coll_info">
                      <Link to="/explore">
                        <h4>{item.title}</h4>
                      </Link>
                      <span>ERC-{item.code}</span>
                    </div>
                  </div>
                ))}
              </OwlCarousel>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default React.memo(HotCollections);

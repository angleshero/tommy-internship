import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import OwlCarousel from "react-owl-carousel";
import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";
import Skeleton from "../UI/Skeleton";
import $ from "jquery";

// Ensure jQuery is available globally for OwlCarousel
window.jQuery = $;
window.$ = $;

const HotCollections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(
          "https://us-central1-nft-cloud-functions.cloudfunctions.net/hotCollections",
        );
        setCollections(data);
      } catch (error) {
        console.error("Error fetching collections:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const options = {
    loop: true,
    margin: 24,
    nav: true,
    dots: false,
    autoplay: false,
    smartSpeed: 700,
    navText: ["‹", "›"], // simple arrow characters,
    responsive: {
      0: { items: 1 },
      576: { items: 2 },
      992: { items: 3 },
      1200: { items: 4 },
    },
  };

  return (
    <section id="section-collections" className="no-bottom">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="text-center">
              <h2>Hot Collections</h2>
              <div className="small-border bg-color-2"></div>
            </div>
          </div>

          <div className="col-lg-12">
            {loading ? (
              <div className="row">
                {new Array(4).fill(0).map((_, index) => (
                  <div
                    className="col-lg-3 col-md-6 col-sm-6 col-xs-12"
                    key={index}
                  >
                    <div className="nft_coll">
                      <div className="nft_wrap">
                        <Skeleton width="100%" height="200px" />
                      </div>
                      <div className="nft_coll_pp">
                        <Skeleton
                          width="50px"
                          height="50px"
                          borderRadius="50%"
                        />
                        <i className="fa fa-check"></i>
                      </div>
                      <div className="nft_coll_info">
                        <Skeleton width="100px" height="20px" />
                        <br />
                        <Skeleton width="60px" height="20px" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              collections.length > 0 && (
                <OwlCarousel
                  className="owl-theme hot-collections-carousel"
                  {...options}
                >
                  {collections.map((item, index) => (
                    <div className="item" key={item.id ?? index}>
                      <div className="nft_coll">
                        <div className="nft_wrap">
                          <Link to={`/item-details/${item.id}`}>
                            <img
                              src={item.nftImage}
                              className="lazy img-fluid"
                              alt=""
                            />
                          </Link>
                        </div>

                        <div className="nft_coll_pp">
                          <Link to="/author">
                            <img
                              className="lazy pp-coll"
                              src={item.authorImage}
                              alt=""
                            />
                          </Link>
                          <i className="fa fa-check"></i>
                        </div>

                        <div className="nft_coll_info">
                          <Link to="/explore">
                            <h4>{item.title}</h4>
                          </Link>
                          <span>{item.code}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </OwlCarousel>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HotCollections;
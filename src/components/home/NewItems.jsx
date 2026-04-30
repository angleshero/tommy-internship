
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";

import Skeleton from "../UI/Skeleton";
import Item from "../Item";

// Owl Carousel
import OwlCarousel from "react-owl-carousel";
import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";

const NewItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNewItems = async () => {
    try {
      const { data } = await axios.get(
        "https://us-central1-nft-cloud-functions.cloudfunctions.net/newItems"
      );
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch new items:", err);
      setItems([]);
    } finally {
      setLoading(false);
      // AOS refresh after DOM updates
      setTimeout(() => AOS.refreshHard(), 0);
    }
  };

  useEffect(() => {
    AOS.init({ once: true });
    fetchNewItems();
  }, []);

  // Ensure at least 4 items are displayed by padding with repeats if needed
  const displayItems = useMemo(() => {
    if (!items || items.length === 0) return [];
    if (items.length >= 4) return items;

    const padded = [...items];
    for (let i = 0; padded.length < 4; i++) {
      padded.push(items[i % items.length]);
    }
    return padded;
  }, [items]);

  // ✅ Owl options (4 at a time on desktop)
  const owlOptions = useMemo(
    () => ({
      loop: displayItems.length > 4, // loop only when enough items
      margin: 10,
      nav: true,
      dots: false,
      autoplay: false,
      smartSpeed: 700,
      navText: [
        // left
        `<button class="arrow arrow-left" aria-label="Previous slide">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M16.67 0l2.83 2.829-9.34 9.175 9.34 9.167-2.83 2.829L4.5 12z"></path>
          </svg>
        </button>`,
        // right
        `<button class="arrow arrow-right" aria-label="Next slide">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M7.33 24l-2.83-2.829 9.34-9.175-9.34-9.167L7.33 0l12.17 12z"></path>
          </svg>
        </button>`,
      ],
      responsive: {
        0: { items: 1 },
        768: { items: 2 },
        992: { items: 4 },
        1200: { items: 4 },
      },
    }),
    [displayItems.length]
  );

  return (
    <section id="section-new-items" className="no-bottom">
      <div className="container">
        <div data-aos="fadeIn" className="row">
          <div className="col-lg-12">
            <div className="text-center">
              <h2 data-aos="fadeIn">New Items</h2>
              <div className="small-border bg-color-2"></div>
            </div>
          </div>

          {/* IMPORTANT: keep carousel inside a Bootstrap column */}
          <div className="col-lg-12">
            <div className="navigation-wrapper">
              {loading ? (
                <div className="row">
                  {new Array(4).fill(0).map((_, index) => (
                    <div className="col-12 col-md-6 col-lg-3" key={index}>
                      <Skeleton width="100%" height="350px" />
                    </div>
                  ))}
                </div>
              ) : (
                <OwlCarousel className="owl-theme" {...owlOptions}>
                  {displayItems.map((item, idx) => (
                    <div
                      className="item"
                      key={`${item.id}-${item.title}-${item.authorId || ""}-${item.nftId || ""}-${idx}`}
                    >
                      <Item {...item} />
                    </div>
                  ))}
                </OwlCarousel>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default React.memo(NewItems);


import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import OwlCarousel from "react-owl-carousel";
import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";

import Skeleton from "../UI/Skeleton"; // adjust path if needed
import $ from "jquery";

// Ensure jQuery is available globally for OwlCarousel
window.jQuery = $;
window.$ = $;

const API_URL =
  "https://us-central1-nft-cloud-functions.cloudfunctions.net/newItems";

  
function normalizeEndTime(item, nowMs, createdAtMs) {
  // 1) Absolute timestamp fields (number)
  const numeric =
    item?.endTimestamp ??
    item?.endTime ??
    item?.endsAtTimestamp ??
    item?.endsAtMs;

  if (typeof numeric === "number" && Number.isFinite(numeric)) {
    // If it's in seconds (10 digits-ish), convert to ms
    const ms = numeric < 1e12 ? numeric * 1000 : numeric;
    return ms;
  }

  // 2) Absolute date/time string fields
  const dateStr = item?.endsAt ?? item?.endDate ?? item?.endTime ?? item?.endsOn;
  if (typeof dateStr === "string" && dateStr.trim()) {
    const parsed = Date.parse(dateStr);
    if (!Number.isNaN(parsed)) return parsed;
  }

  // 3) Duration fields (seconds remaining). Convert to absolute end time.
  const durationSec = item?.countdownSeconds ?? item?.remainingSeconds ?? item?.secondsLeft;
  if (typeof durationSec === "number" && Number.isFinite(durationSec)) {
    // Prefer locking duration to the fetch moment so it doesn't "reset" on re-render
    const base = createdAtMs ?? nowMs;
    return base + durationSec * 1000;
  }

  // Not found
  return null;
}

function formatRemaining(msRemaining) {
  if (msRemaining == null) return "—";
  if (msRemaining <= 0) return "Ended";

  const totalSeconds = Math.floor(msRemaining / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours}h ${minutes}m ${seconds}s`;
}


const NewItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewItems = async () => {
      try {
        const { data } = await axios.get(API_URL);
        setItems(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching new items:", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNewItems();
  }, []);

  const options = {
    loop: true,
    margin: 24,
    nav: true,
    dots: false,
    autoplay: false,
    smartSpeed: 700,
    navText: ["‹", "›"],
    responsive: {
      0: { items: 1 },
      576: { items: 2 },
      992: { items: 3 },
      1200: { items: 4 },
    },
  };

  return (
    <section id="section-items" className="no-bottom">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="text-center">
              <h2>New Items</h2>
              <div className="small-border bg-color-2"></div>
            </div>
          </div>

          <div className="col-lg-12">
            {loading ? (
              // ✅ Skeleton loading state
              <div className="row">
                {new Array(4).fill(0).map((_, index) => (
                  <div
                    className="col-lg-3 col-md-6 col-sm-6 col-xs-12"
                    key={index}
                  >
                    <div className="nft__item">
                      <div className="author_list_pp">
                        <Skeleton
                          width="42px"
                          height="42px"
                          borderRadius="50%"
                        />
                      </div>

                      <div className="de_countdown">
                        <Skeleton width="90px" height="18px" />
                      </div>

                      <div className="nft__item_wrap">
                        <Skeleton width="100%" height="260px" />
                      </div>

                      <div className="nft__item_info">
                        <Skeleton width="140px" height="18px" />
                        <div style={{ marginTop: 10 }}>
                          <Skeleton width="80px" height="18px" />
                        </div>
                        <div style={{ marginTop: 10 }}>
                          <Skeleton width="60px" height="18px" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // ✅ OwlCarousel applied to New Items cards
              items.length > 0 && (
                <OwlCarousel
                  className="owl-theme new-items-carousel"
                  {...options}
                >
                  {items.map((item, index) => {
                    // ✅ Safe fallbacks in case some fields are missing
                    const id = item?.id ?? index;
                    const title = item?.title ?? "Untitled";
                    const price = item?.price ?? "—";
                    const likes = item?.likes ?? 0;
                    const nftImage = item?.nftImage ?? "";
                    const authorImage = item?.authorImage ?? "";
                    const authorName = item?.authorName ?? "Creator";
                    const countdown =
                      item?.countdown ?? item?.endsIn ?? "5h 30m 32s";

                    return (
                      <div className="item" key={id}>
                        <div className="nft__item">
                          <div className="author_list_pp">
                            <Link
                              to="/author"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              title={`Creator: ${authorName}`}
                            >
                              <img className="lazy" src={authorImage} alt="" />
                              <i className="fa fa-check"></i>
                            </Link>
                          </div>

                          <div className="de_countdown">{countdown}</div>

                          <div className="nft__item_wrap">
                            <div className="nft__item_extra">
                              <div className="nft__item_buttons">
                                <button>Buy Now</button>

                                <div className="nft__item_share">
                                  <h4>Share</h4>

                                  <a
                                    href="#"
                                    onClick={(e) => e.preventDefault()}
                                    rel="noreferrer"
                                  >
                                    <i className="fa fa-facebook fa-lg"></i>
                                  </a>

                                  <a
                                    href="#"
                                    onClick={(e) => e.preventDefault()}
                                    rel="noreferrer"
                                  >
                                    <i className="fa fa-twitter fa-lg"></i>
                                  </a>

                                  <a
                                    href="#"
                                    onClick={(e) => e.preventDefault()}
                                    rel="noreferrer"
                                  >
                                    <i className="fa fa-envelope fa-lg"></i>
                                  </a>
                                </div>
                              </div>
                            </div>

                            <Link to="/item-details">
                              <img
                                src={nftImage}
                                className="lazy nft__item_preview"
                                alt=""
                              />
                            </Link>
                          </div>

                          <div className="nft__item_info">
                            <Link to="/item-details">
                              <h4>{title}</h4>
                            </Link>

                            <div className="nft__item_price">{price}</div>

                            <div className="nft__item_like">
                              <i className="fa fa-heart"></i>
                              <span>{likes}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </OwlCarousel>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewItems;

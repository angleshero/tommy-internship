
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import AuthorImageFallback from "../../images/author_thumbnail.jpg";
import nftImageFallback from "../../images/nftImage.jpg";

const API_URL =
  "https://us-central1-nft-cloud-functions.cloudfunctions.net/authors?author=73855012";

const AuthorItems = () => {
  const [authorImage, setAuthorImage] = useState(AuthorImageFallback);
  const [items, setItems] = useState([]); // nftCollection
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setErrorMsg("");

      try {
        const res = await fetch(API_URL, { signal: controller.signal });
        if (!res.ok) {
          throw new Error(`API request failed: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();

        // author image (API may return base64 data url)
        setAuthorImage(data?.authorImage || AuthorImageFallback);

        // nft collection
        const collection = Array.isArray(data?.nftCollection)
          ? data.nftCollection
          : [];

        setItems(collection);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          setErrorMsg("Could not load items from API. Showing fallback items.");
          setAuthorImage(AuthorImageFallback);

          // fallback to 8 placeholders (same as your original)
          setItems(
            new Array(8).fill(0).map((_, i) => ({
              id: i,
              nftId: i,
              title: "Pinky Ocean",
              price: 2.52,
              likes: 97,
              nftImage: nftImageFallback,
            }))
          );
        }
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, []);

  return (
    <div className="de_tab_content">
      <div className="tab-1">
        {/* Optional error message */}
        {!loading && errorMsg ? (
          <div
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              background: "rgba(255, 165, 0, 0.12)",
              color: "#b26a00",
              marginBottom: 12,
              fontSize: 14,
            }}
          >
            {errorMsg}
          </div>
        ) : null}

        <div className="row">
          {items.map((item, index) => (
            <div
              className="col-lg-3 col-md-6 col-sm-6 col-xs-12"
              key={item?.nftId ?? item?.id ?? index}
            >
              <div className="nft__item">
                <div className="author_list_pp">
                  <Link to="">
                    <img
                      className="lazy"
                      src={authorImage}
                      alt=""
                      onError={(e) =>
                        (e.currentTarget.src = AuthorImageFallback)
                      }
                    />
                    <i className="fa fa-check"></i>
                  </Link>
                </div>

                <div className="nft__item_wrap">
                  <div className="nft__item_extra">
                    <div className="nft__item_buttons">
                      <button>Buy Now</button>
                      <div className="nft__item_share">
                        <h4>Share</h4>
                        <a href="" target="_blank" rel="noreferrer">
                          <i className="fa fa-facebook fa-lg"></i>
                        </a>
                        <a href="" target="_blank" rel="noreferrer">
                          <i className="fa fa-twitter fa-lg"></i>
                        </a>
                        <a href="">
                          <i className="fa fa-envelope fa-lg"></i>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Your App.jsx route is /item-details (no param) */}
                  <Link to="/item-details">
                    <img
                      src={item?.nftImage || nftImageFallback}
                      className="lazy nft__item_preview"
                      alt=""
                      onError={(e) =>
                        (e.currentTarget.src = nftImageFallback)
                      }
                    />
                  </Link>
                </div>

                <div className="nft__item_info">
                  <Link to="/item-details">
                    <h4>{item?.title || "Pinky Ocean"}</h4>
                  </Link>

                  <div className="nft__item_price">
                    {typeof item?.price === "number" || typeof item?.price === "string"
                      ? `${item.price} ETH`
                      : "—"}
                  </div>

                  <div className="nft__item_like">
                    <i className="fa fa-heart"></i>
                    <span>{item?.likes ?? 0}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Optional tiny loading hint */}
        {loading ? (
          <div style={{ padding: "10px 0", opacity: 0.7 }}>Loading...</div>
        ) : null}
      </div>
    </div>
  );
};

export default AuthorItems;

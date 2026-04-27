
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import AuthorImageFallback from "../../images/author_thumbnail.jpg";
import nftImageFallback from "../../images/nftImage.jpg";

const DEFAULT_AUTHOR_ID = 73855012;

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const AuthorItems = () => {
  const query = useQuery();

  // ✅ Dynamic authorId from URL: /author?author=73855012
  const authorId = query.get("author") || String(DEFAULT_AUTHOR_ID);

  // ✅ Use the API you specified (dynamic author id)
  const API_URL = `https://us-central1-nft-cloud-functions.cloudfunctions.net/authors?author=${authorId}`;

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [author, setAuthor] = useState(null);
  const [nfts, setNfts] = useState([]);

  const skeletonCards = useMemo(() => new Array(8).fill(0), []);

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

        setAuthor(data && typeof data === "object" ? data : null);

        // Expected shape: data.nftCollection
        const collection = Array.isArray(data?.nftCollection) ? data.nftCollection : [];
        setNfts(collection);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          setErrorMsg("Could not load NFTs from the API.");
          setAuthor(null);
          setNfts([]);
        }
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [API_URL]);

  const authorAvatar = author?.authorImage || AuthorImageFallback;

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
          {/* ✅ Skeleton Loading State */}
          {loading
            ? skeletonCards.map((_, index) => (
                <div className="col-lg-3 col-md-6 col-sm-6 col-xs-12" key={`sk-${index}`}>
                  <div className="nft__item">
                    <div className="author_list_pp">
                      <div className="skeleton skeleton-circle" />
                    </div>

                    <div className="nft__item_wrap">
                      <div className="skeleton skeleton-rect" />
                    </div>

                    <div className="nft__item_info">
                      <div className="skeleton skeleton-line" />
                      <div className="skeleton skeleton-line short" />
                    </div>
                  </div>
                </div>
              ))
            : nfts.map((nft, index) => {
                const key = nft?.nftId ?? nft?.id ?? index;
                const title = nft?.title || "Untitled";
                const price = nft?.price ?? "—";
                const likes = nft?.likes ?? 0;
                const image = nft?.nftImage || nftImageFallback;

                return (
                  <div className="col-lg-3 col-md-6 col-sm-6 col-xs-12" key={key}>
                    <div className="nft__item">
                      {/* ✅ Author icon on each element */}
                      <div className="author_list_pp">
                        <Link to={`/author?author=${authorId}`}>
                          <img
                            className="lazy"
                            src={authorAvatar}
                            alt=""
                            onError={(e) => (e.currentTarget.src = AuthorImageFallback)}
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
                        <Link to="/item-details" state={{ nftId: nft?.nftId }}>
                          <img
                            src={image}
                            className="lazy nft__item_preview"
                            alt=""
                            onError={(e) => (e.currentTarget.src = nftImageFallback)}
                          />
                        </Link>
                      </div>

                      <div className="nft__item_info">
                        <Link to="/item-details" state={{ nftId: nft?.nftId }}>
                          <h4>{title}</h4>
                        </Link>

                        <div className="nft__item_price">
                          {String(price).includes("ETH") ? price : `${price} ETH`}
                        </div>

                        <div className="nft__item_like">
                          <i className="fa fa-heart"></i>
                          <span>{likes}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
        </div>
      </div>

      
    </div>
  );
};

export default AuthorItems;

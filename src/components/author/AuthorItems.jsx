
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import AuthorImageFallback from "../../images/author_thumbnail.jpg";
import nftImageFallback from "../../images/nftImage.jpg";

const AUTHOR_ID = 73855012;
const API_URL = `https://us-central1-nft-cloud-functions.cloudfunctions.net/authors?author=${AUTHOR_ID}`;

const AuthorItems = () => {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // API shape: { authorName, authorImage, followers, nftCollection: [...] }
  const [author, setAuthor] = useState(null);
  const [nfts, setNfts] = useState([]);

  // Follow toggle state (global for the author)
  const [isFollowed, setIsFollowed] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  const skeletonCards = useMemo(() => new Array(8).fill(0), []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadAuthor() {
      setLoading(true);
      setErrorMsg("");

      try {
        const res = await fetch(API_URL, { signal: controller.signal });
        if (!res.ok) {
          throw new Error(`API request failed: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();

        // Defensive checks based on your example JSON
        const safeAuthor = data && typeof data === "object" ? data : null;
        const safeNfts = Array.isArray(data?.nftCollection) ? data.nftCollection : [];

        setAuthor(safeAuthor);
        setNfts(safeNfts);

        // Seed followers from API
        const apiFollowers = Number(data?.followers ?? 0) || 0;
        setFollowersCount(apiFollowers);
        setIsFollowed(false);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          setErrorMsg("Could not load author items right now. Showing fallback items.");
          // Fallback UI (same feel as your original)
          setAuthor({
            authorName: "Unknown Author",
            authorImage: AuthorImageFallback,
            followers: 0,
          });
          setFollowersCount(0);
          setIsFollowed(false);
          setNfts(
            new Array(8).fill(0).map((_, idx) => ({
              id: idx + 1,
              nftId: idx + 1,
              title: `Pinky Ocean ${idx + 1}`,
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

    loadAuthor();

    return () => controller.abort();
  }, []);

  // ✅ Follow increments on first click, decrements on second click (toggle)
  const handleFollowToggle = () => {
    setIsFollowed((prev) => {
      const next = !prev;

      setFollowersCount((count) => {
        if (next) return count + 1;
        return Math.max(0, count - 1);
      });

      return next;
    });
  };

  const authorName = author?.authorName || "Author";
  const authorImageSrc = author?.authorImage || AuthorImageFallback;

  return (
    <div className="de_tab_content">
      <div className="tab-1">
        <div className="row">
          {/* Optional non-blocking error message */}
          {!loading && errorMsg ? (
            <div className="col-12">
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
            </div>
          ) : null}

          {/* ✅ Skeleton Loading State */}
          {loading
            ? skeletonCards.map((_, index) => (
                <div className="col-lg-3 col-md-6 col-sm-6 col-xs-12" key={`sk-${index}`}>
                  <div className="nft__item">
                    <div className="author_list_pp" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div className="skeleton skeleton-circle" />
                      <div className="skeleton skeleton-line short" />
                    </div>

                    <div className="nft__item_wrap">
                      <div className="skeleton skeleton-rect" />
                    </div>

                    <div className="nft__item_info">
                      <div className="skeleton skeleton-line" />
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
                        <div className="skeleton skeleton-line short" />
                        <div className="skeleton skeleton-line short" />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            : nfts.map((nft, index) => {
                const key = nft?.nftId ?? nft?.id ?? index;

                const title = nft?.title || "Untitled";
                const price = Number(nft?.price ?? 0);
                const likes = Number(nft?.likes ?? 0);

                const nftImageSrc = nft?.nftImage || nftImageFallback;

                return (
                  <div className="col-lg-3 col-md-6 col-sm-6 col-xs-12" key={key}>
                    <div className="nft__item">
                      <div
                        className="author_list_pp"
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <Link to="">
                          <img
                            className="lazy"
                            src={authorImageSrc}
                            alt={authorName}
                            onError={(e) => {
                              e.currentTarget.src = AuthorImageFallback;
                            }}
                          />
                          <i className="fa fa-check"></i>
                        </Link>

                        {/* ✅ Follow toggle (global state; consistent across all cards) */}
                        <button
                          type="button"
                          onClick={handleFollowToggle}
                          className="btn-main btn-follow"
                          style={{
                            padding: "6px 10px",
                            fontSize: 12,
                            lineHeight: "12px",
                            borderRadius: 8,
                            whiteSpace: "nowrap",
                          }}
                          aria-label="Toggle follow"
                          title={`Follow ${authorName}`}
                        >
                          {isFollowed ? "Following" : "Follow"}{" "}
                          <span style={{ opacity: 0.9 }}>({followersCount})</span>
                        </button>
                      </div>

                      <div className="nft__item_wrap">
                        <div className="nft__item_extra">
                          <div className="nft__item_buttons">
                            <button type="button">Buy Now</button>

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

                        <Link to="/item-details">
                          <img
                            src={nftImageSrc}
                            className="lazy nft__item_preview"
                            alt={title}
                            onError={(e) => {
                              e.currentTarget.src = nftImageFallback;
                            }}
                          />
                        </Link>
                      </div>

                      <div className="nft__item_info">
                        <Link to="/item-details">
                          <h4>{title}</h4>
                        </Link>

                        <div className="nft__item_price">{price ? `${price} ETH` : "—"}</div>

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
